import { NextResponse } from 'next/server'
import { APP_MODE } from '@/lib/config'
import { SYNTHETIC_CLAIMS } from '@/lib/claims'
import { loadMockFeedData } from '@/lib/mock/mock-loader'
import { queryClaimInquiry } from '@/lib/optum-claim-inquiry'
import { getOptumBearerToken } from '@/lib/optum-auth'
import { buildClaudeInput, analyzeARWithClaude } from '@/lib/claude-ar-analyzer'
import { SandboxNarrator } from '@/lib/sandbox-narrator'
import type { ClaimInquiryResult, ClaimStatusFeedResult, ClaimInquiryResponse, ConsoleLogEntry } from '@/types/optum.types'
import type { ClaudeClaimAction, ClaudeARAnalysis } from '@/types/claude.types'

function logEntry(
  log: ConsoleLogEntry[],
  phase: ConsoleLogEntry['phase'],
  label: string,
  opts?: { detail?: string; data?: unknown; durationMs?: number }
) {
  log.push({
    timestamp: new Date().toISOString(),
    phase,
    label,
    ...opts,
  })
}

const MOCK_DELAY_MS = 2120 // parallelBatch (320) + claude (1800)

async function runSandboxProbes(consoleLog: ConsoleLogEntry[]): Promise<import('@/types/sandbox.types').SandboxNarrative> {
  const narrator = new SandboxNarrator()

  // Step 1: OAuth probe
  const optumClientId = process.env.OPTUM_CLIENT_ID
  const optumClientSecret = process.env.OPTUM_CLIENT_SECRET
  const optumAuthUrl = process.env.OPTUM_AUTH_URL

  if (!optumClientId || !optumClientSecret || !optumAuthUrl) {
    narrator.log('OAuth', 'explain', 'OPTUM_CLIENT_ID, OPTUM_CLIENT_SECRET, or OPTUM_AUTH_URL not set. Skipping OAuth test. Set credentials in .env.local to test.')
    logEntry(consoleLog, 'auth', 'OAuth2 credentials not configured', { detail: 'Set OPTUM_CLIENT_ID, OPTUM_CLIENT_SECRET, OPTUM_AUTH_URL in .env.local' })
  } else {
    logEntry(consoleLog, 'auth', 'Requesting OAuth2 bearer token', {
      detail: `POST ${optumAuthUrl}`,
      data: { grant_type: 'client_credentials', client_id: optumClientId.slice(0, 8) + '...' },
    })
    const oauthStart = Date.now()
    try {
      const token = await getOptumBearerToken()
      const elapsed = Date.now() - oauthStart
      narrator.log('OAuth', 'success', `Bearer token acquired in ${elapsed}ms`)
      logEntry(consoleLog, 'auth', 'Bearer token acquired', {
        durationMs: elapsed,
        data: { token: token.slice(0, 20) + '...', expiresIn: '3600s' },
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      const elapsed = Date.now() - oauthStart
      narrator.log('OAuth', 'error', `Token request failed (${elapsed}ms): ${msg}`)
      logEntry(consoleLog, 'error', 'OAuth2 token request failed', { detail: msg, durationMs: elapsed })
    }
  }

  // Step 2: GraphQL endpoint probe
  const eligibilityUrl = process.env.OPTUM_ELIGIBILITY_URL
  const providerTaxId = process.env.OPTUM_PROVIDER_TAX_ID
  if (!optumClientId || !optumClientSecret || !optumAuthUrl || !eligibilityUrl) {
    narrator.log('GraphQL', 'explain', 'OPTUM_ELIGIBILITY_URL not set. Skipping endpoint probe.')
    logEntry(consoleLog, 'claim_inquiry', 'GraphQL endpoint not configured', { detail: 'Set OPTUM_ELIGIBILITY_URL in .env.local' })
  } else {
    narrator.log('GraphQL', 'info', `Probing sandbox GraphQL endpoint: ${eligibilityUrl}`)
    logEntry(consoleLog, 'claim_inquiry', 'Probing Optum sandbox GraphQL endpoint', {
      detail: `${eligibilityUrl} — using checkEligibility query (sandbox does not expose Claim Status API)`,
    })
    // Use the first two claims to build eligibility probe requests
    const sampleClaims = [SYNTHETIC_CLAIMS[0], SYNTHETIC_CLAIMS[5]]
    let token: string | null = null
    try {
      token = await getOptumBearerToken()
    } catch {
      // OAuth already logged above
    }
    if (token) {
      const eligibilityProbeQuery = `query CheckEligibility($input: EligibilityInput!) {
  checkEligibility(input: $input) {
    eligibility {
      eligibilityInfo {
        trnId
        member { memberId firstName lastName dateOfBirth gender }
        insuranceInfo { payerId policyNumber eligibilityStartDate eligibilityEndDate policyStatus planTypeDescription }
      }
    }
  }
}`
      for (const claim of sampleClaims) {
        const correlationId = `claim-status-radar-${Date.now()}`
        const today = new Date().toISOString().split('T')[0]
        const probeVariables = {
          input: {
            payerId: claim.tradingPartnerServiceId,
            memberId: `PROBE-${claim.id}`,
            firstName: claim.patientFirstName,
            lastName: claim.patientLastName,
            groupNumber: 'GRP001',
            dateOfBirth: '1980-01-15',
            serviceStartDate: today,
            serviceEndDate: today,
            providerNPI: '1234567890',
            providerFirstName: 'Sample',
            providerLastName: 'Provider',
            serviceLevelCodes: ['30'],
          },
        }
        const queryBody = {
          query: eligibilityProbeQuery,
          variables: probeVariables,
        }
        const requestHeaders: Record<string, string> = {
          'Authorization': `Bearer ${token.slice(0, 20)}...`,
          'Content-Type': 'application/json',
          ...(providerTaxId ? { 'providerTaxId': providerTaxId } : {}),
          'x-optum-consumer-correlation-id': correlationId,
          'environment': 'sandbox',
        }

        logEntry(consoleLog, 'api_request', `→ Eligibility probe: ${claim.patientFirstName} ${claim.patientLastName} (${claim.payerName})`, {
          detail: `POST ${eligibilityUrl}`,
          data: { headers: requestHeaders, body: queryBody },
        })

        const queryStart = Date.now()
        try {
          const res = await fetch(eligibilityUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              ...(providerTaxId ? { 'providerTaxId': providerTaxId } : {}),
              'x-optum-consumer-correlation-id': correlationId,
              'environment': 'sandbox',
            },
            body: JSON.stringify(queryBody),
          })
          const elapsed = Date.now() - queryStart
          const body = await res.json()

          logEntry(consoleLog, 'api_response', `← ${claim.patientFirstName} ${claim.patientLastName} — HTTP ${res.status}`, {
            durationMs: elapsed,
            data: body,
          })

          if (res.ok && body.data) {
            narrator.log('GraphQL', 'success', `${claim.patientFirstName} ${claim.patientLastName} — eligibility response received (${elapsed}ms)`)
          } else if (res.ok && body.errors) {
            const errMsg = body.errors[0]?.message ?? 'Unknown GraphQL error'
            narrator.log('GraphQL', 'warn', `${claim.patientFirstName} ${claim.patientLastName} — ${errMsg} (${elapsed}ms). Endpoint reached and authenticated.`)
          } else {
            const text = typeof body === 'object' ? JSON.stringify(body).slice(0, 200) : String(body).slice(0, 200)
            narrator.log('GraphQL', 'warn', `${claim.patientFirstName} ${claim.patientLastName} — HTTP ${res.status} (${elapsed}ms): ${text}`)
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown error'
          const elapsed = Date.now() - queryStart
          narrator.log('GraphQL', 'error', `${claim.patientFirstName} ${claim.patientLastName} — ${msg} (${elapsed}ms)`)
          logEntry(consoleLog, 'error', `← ${claim.patientFirstName} ${claim.patientLastName} — request failed`, {
            detail: msg,
            durationMs: elapsed,
          })
        }
      }
    }
  }

  // Step 3: Claude API probe
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) {
    narrator.log('Claude', 'explain', 'ANTHROPIC_API_KEY not set. Skipping Claude probe. Set it in .env.local to test.')
    logEntry(consoleLog, 'claude_request', 'Claude API key not configured', { detail: 'Set ANTHROPIC_API_KEY in .env.local' })
  } else {
    const claudeRequestBody = {
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'ping' }],
    }
    logEntry(consoleLog, 'claude_request', '→ Claude API health probe', {
      detail: 'POST https://api.anthropic.com/v1/messages',
      data: claudeRequestBody,
    })
    const claudeStart = Date.now()
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify(claudeRequestBody),
      })
      const elapsed = Date.now() - claudeStart
      if (response.ok) {
        const data = await response.json()
        narrator.log('Claude', 'success', `API responded (${elapsed}ms). Model: ${data.model}`)
        logEntry(consoleLog, 'claude_response', `← Claude API healthy — ${data.model}`, {
          durationMs: elapsed,
          data,
        })
      } else {
        const text = await response.text()
        narrator.log('Claude', 'error', `API returned ${response.status} (${elapsed}ms): ${text.slice(0, 200)}`)
        logEntry(consoleLog, 'error', `← Claude API returned HTTP ${response.status}`, {
          durationMs: elapsed,
          detail: text.slice(0, 300),
        })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      const elapsed = Date.now() - claudeStart
      narrator.log('Claude', 'error', `API probe failed (${elapsed}ms): ${msg}`)
      logEntry(consoleLog, 'error', 'Claude API probe failed', { detail: msg, durationMs: elapsed })
    }
  }

  return narrator.finish()
}

export async function POST(request: Request) {
  try {
    // Accept mode from request body, fall back to env var
    let mode: 'mock' | 'sandbox' | 'production' = APP_MODE
    try {
      const body = await request.json()
      if (body.mode === 'mock' || body.mode === 'sandbox' || body.mode === 'production') {
        mode = body.mode
      }
    } catch {
      // No body or invalid JSON — use default
    }

    const isMock = mode === 'mock'
    const isSandbox = mode === 'sandbox'

    const consoleLog: ConsoleLogEntry[] = []

    // Mock mode: return fixtures with simulated delay
    if (isMock) {
      logEntry(consoleLog, 'api_request', 'Mock mode — no live API calls', { detail: 'Returning fixture data with simulated delay' })
      await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))
      logEntry(consoleLog, 'claim_inquiry', `Loaded ${SYNTHETIC_CLAIMS.length} mock claim responses`, { durationMs: 320 })
      logEntry(consoleLog, 'claude_response', 'Mock Claude AR analysis loaded', { durationMs: 1800 })
      const mockResult = loadMockFeedData()
      return NextResponse.json({ ...mockResult, consoleLog })
    }

    // Sandbox mode: run API probes, return fixture data + narrative
    if (isSandbox) {
      logEntry(consoleLog, 'api_request', 'Sandbox mode — running live API probes')
      const narrative = await runSandboxProbes(consoleLog)
      logEntry(consoleLog, 'api_response', 'All sandbox probes complete — loading fixture data for dashboard')
      const mockResult = loadMockFeedData()
      const result: ClaimStatusFeedResult = {
        ...mockResult,
        mode: 'sandbox',
        sandboxNarrative: narrative,
        consoleLog,
      }
      return NextResponse.json(result)
    }

    // Production mode: real API calls
    const totalStart = Date.now()
    logEntry(consoleLog, 'api_request', 'Production mode — starting live API calls')

    // Step 1: OAuth token
    logEntry(consoleLog, 'auth', 'Requesting OAuth2 bearer token')
    const authStart = Date.now()
    try {
      await getOptumBearerToken()
      logEntry(consoleLog, 'auth', 'Bearer token acquired', { durationMs: Date.now() - authStart })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      logEntry(consoleLog, 'error', 'OAuth2 token failed', { detail: msg, durationMs: Date.now() - authStart })
    }

    // Step 2: Parallel claim inquiries
    logEntry(consoleLog, 'claim_inquiry', `Launching ${SYNTHETIC_CLAIMS.length} parallel claim inquiries`)
    const inquiryStart = Date.now()
    const inquiryResults = await Promise.all(
      SYNTHETIC_CLAIMS.map(async (claim): Promise<{
        claim: typeof claim
        inquiryResponse: ClaimInquiryResponse | null
        error: string | null
        timingMs: number
      }> => {
        const claimStart = Date.now()
        logEntry(consoleLog, 'api_request', `→ ${claim.claimControlNumber}`, {
          detail: `${claim.patientFirstName} ${claim.patientLastName} / ${claim.payerName}`,
          data: { controlNumber: claim.claimControlNumber, tradingPartner: claim.tradingPartnerServiceId },
        })
        try {
          const response = await queryClaimInquiry(
            claim.claimControlNumber,
            claim.tradingPartnerServiceId
          )
          const elapsed = Date.now() - claimStart
          logEntry(consoleLog, 'api_response', `← ${claim.claimControlNumber} — ${response.claimStatus.statusCategoryDescription}`, {
            durationMs: elapsed,
            data: response,
          })
          return {
            claim,
            inquiryResponse: response,
            error: null,
            timingMs: elapsed,
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error'
          const elapsed = Date.now() - claimStart
          logEntry(consoleLog, 'error', `← ${claim.claimControlNumber} — FAILED`, {
            detail: message,
            durationMs: elapsed,
          })
          return {
            claim,
            inquiryResponse: null,
            error: message,
            timingMs: elapsed,
          }
        }
      })
    )
    const parallelInquiryMs = Date.now() - inquiryStart
    logEntry(consoleLog, 'claim_inquiry', `All ${SYNTHETIC_CLAIMS.length} inquiries complete`, { durationMs: parallelInquiryMs })

    // Step 2: Separate successes and errors
    const successfulInquiries = inquiryResults.filter((r) => r.inquiryResponse !== null)
    const errorCount = inquiryResults.filter((r) => r.error !== null).length

    // Step 3: Claude AR analysis (only on successful inquiries)
    let arAnalysis: ClaudeARAnalysis | null = null
    let claudeMs = 0

    if (successfulInquiries.length > 0) {
      const claudeStart = Date.now()
      logEntry(consoleLog, 'claude_request', `Sending ${successfulInquiries.length} claims to Claude for AR analysis`, {
        detail: 'System prompt includes priority rules, X12 interpretation, timely filing, denial management',
      })
      try {
        const claudeInput = buildClaudeInput(
          successfulInquiries.map((r) => ({
            claim: r.claim,
            inquiryResponse: r.inquiryResponse!,
          }))
        )
        arAnalysis = await analyzeARWithClaude(claudeInput)
        claudeMs = Date.now() - claudeStart
        logEntry(consoleLog, 'claude_response', 'Claude AR analysis received', {
          durationMs: claudeMs,
          data: {
            urgentCount: arAnalysis?.arSummary?.urgentCount,
            actionRequiredCount: arAnalysis?.arSummary?.actionRequiredCount,
            monitorCount: arAnalysis?.arSummary?.monitorCount,
            onTrackCount: arAnalysis?.arSummary?.onTrackCount,
            claimsAnalyzed: Object.keys(arAnalysis?.perClaimActions ?? {}).length,
          },
        })
      } catch (err) {
        claudeMs = Date.now() - claudeStart
        const msg = err instanceof Error ? err.message : 'Unknown error'
        logEntry(consoleLog, 'error', 'Claude analysis failed — dashboard will render without AI', {
          detail: msg,
          durationMs: claudeMs,
        })
        arAnalysis = null
      }
    }

    // Step 4: Build final result
    const defaultAction: ClaudeClaimAction = {
      priority: 'MONITOR',
      priorityReason: 'AI analysis unavailable',
      actionRequired: false,
      immediateAction: null,
      actionDeadline: null,
      actionSteps: [],
      riskAssessment: {
        riskLevel: 'NONE',
        riskSummary: null,
        timelyFilingRisk: false,
        denialRisk: false,
        appealDeadlineRisk: false,
      },
      statusInterpretation: 'AI analysis unavailable — showing raw claim status.',
      expectedResolution: 'Check back after AI analysis is available.',
      contactPayer: false,
      contactPayerReason: null,
    }

    const claims: ClaimInquiryResult[] = inquiryResults
      .filter((r) => r.inquiryResponse !== null)
      .map((r) => ({
        claim: r.claim,
        inquiryResponse: r.inquiryResponse!,
        claimAction: arAnalysis?.perClaimActions[r.claim.id] ?? defaultAction,
        timingMs: r.timingMs,
        error: r.error,
      }))

    logEntry(consoleLog, 'api_response', 'Feed complete', {
      durationMs: Date.now() - totalStart,
      detail: `${successfulInquiries.length} succeeded, ${errorCount} failed`,
    })

    const result: ClaimStatusFeedResult = {
      claims,
      consoleLog,
      arAnalysis: arAnalysis ?? {
        perClaimActions: {},
        arSummary: {
          urgentCount: 0,
          actionRequiredCount: 0,
          monitorCount: 0,
          onTrackCount: 0,
          totalBilledOutstanding: '$0.00',
          estimatedCollectable: '$0.00',
          topThreeActions: [],
          practiceHealthSummary: 'AR intelligence summary unavailable — showing raw data.',
          flaggedForImmediateAttention: [],
          insight: '',
        },
      },
      timing: {
        parallelInquiryMs,
        claudeMs,
        totalMs: Date.now() - totalStart,
      },
      mode,
      successCount: successfulInquiries.length,
      errorCount,
    }

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
