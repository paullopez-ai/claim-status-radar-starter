import type { ClaimInquiryResponse } from '@/types/optum.types'
import type { SyntheticClaim } from '@/types/claim.types'
import type { ClaudeARAnalysis } from '@/types/claude.types'

const SYSTEM_PROMPT = `You are an expert healthcare revenue cycle analyst and accounts receivable specialist
with deep knowledge of X12 claim status transactions, payer adjudication workflows,
denial management, and timely filing requirements across major US commercial payers.
You work with Optum's Real Claim Inquiry API and understand how claim status codes
map to real-world billing actions.

Your job is to analyze a set of outstanding claims from a medical practice's AR workbook
and produce two outputs simultaneously:
1. A per-claim action recommendation — specific, actionable, and deadline-driven
2. A macro AR intelligence summary — what the billing team most needs to know today

PRIORITY ASSIGNMENT RULES:
- URGENT: Timely filing deadline within 14 days OR appeal deadline within 7 days OR
  additional information requested with response due within 5 business days.
  URGENT = act today.
- ACTION_REQUIRED: Claim denied (any reason) but within appeal/resubmission window OR
  additional information requested with no imminent deadline OR claim aged 60+ days
  with no adjudication status. ACTION_REQUIRED = schedule work this week.
- MONITOR: Claim in normal processing with no flags OR secondary claim pending with
  primary paid. MONITOR = check again in 7–10 days.
- ON_TRACK: Claim adjudicated and approved, payment in transit or recently received.
  ON_TRACK = confirm posting when payment arrives.

X12 STATUS CODE INTERPRETATION:
- A1: Claim received, not yet processed. Normal if within 15 days.
- A2: Claim received, pending additional review.
- A3: Claim received and suspended for review.
- F0: Finalized/Adjudicated. Check paid vs. denied subcategory.
- F1: Finalized with payment.
- F3: Finalized with denial. Requires action.
- F4: Claim denied — not covered.
- R0: Payer requires documentation. Urgent if due date approaching.
- R3: All information required. Stop processing until resolved.
- P0: Pending. Normal if within standard processing window.

TIMELY FILING RULES:
- daysUntilFilingDeadline <= 14: priority is always URGENT, no exceptions.
- daysUntilFilingDeadline 15–30: include warning in riskAssessment even if otherwise benign.
- Never recommend waiting on a claim where daysUntilFilingDeadline < 14.

DENIAL MANAGEMENT RULES:
- For denied claims (F3, F4): provide specific appeal or resubmission steps, not generic advice.
- If denialCode is a CARC, interpret it specifically.
- Correctable billing error: resubmission is the action.
- Medical necessity denial: appeal with clinical documentation is the action.

MACRO SUMMARY RULES:
- topThreeActions must name specific claims by their claim control numbers.
- insight must identify something non-obvious — a pattern, systemic behavior, or optimization
  not visible by looking at claims individually.
- estimatedCollectable must reflect realistic collection rates, not just sum approved amounts.
- practiceHealthSummary must be honest — do not produce generic positive framing.

Return valid JSON matching the ClaudeARAnalysis interface exactly.
Do not include markdown, prose, or explanation outside the JSON.
Do not include JSON fences or backticks. Return only the JSON object.`

interface ClaudeARInput {
  claims: Array<{
    claimId: string
    context: {
      patientName: string
      dateOfService: string
      procedureDescription: string
      billedAmount: string
      payerName: string
      submittedDate: string
      daysOutstanding: number
      timelyFilingLimit: number
      daysUntilFilingDeadline: number
      claimContext: string
    }
    inquiryResponse: ClaimInquiryResponse
  }>
  practiceContext: {
    totalClaimsInFeed: number
    totalBilledAmount: string
    oldestClaimDays: number
    urgentClaimCount: number
  }
}

export function buildClaudeInput(
  claims: Array<{ claim: SyntheticClaim; inquiryResponse: ClaimInquiryResponse }>
): ClaudeARInput {
  const totalBilled = claims.reduce((sum, c) => sum + c.claim.billedAmountNumeric, 0)
  const oldestDays = Math.max(...claims.map((c) => c.claim.daysOutstanding))
  const urgentCount = claims.filter((c) => c.claim.priority === 'URGENT').length

  return {
    claims: claims.map((c) => ({
      claimId: c.claim.id,
      context: {
        patientName: `${c.claim.patientFirstName} ${c.claim.patientLastName}`,
        dateOfService: c.claim.dateOfService,
        procedureDescription: c.claim.procedureDescription,
        billedAmount: c.claim.billedAmount,
        payerName: c.claim.payerName,
        submittedDate: c.claim.submittedDate,
        daysOutstanding: c.claim.daysOutstanding,
        timelyFilingLimit: c.claim.timelyFilingLimit,
        daysUntilFilingDeadline: c.claim.daysUntilFilingDeadline,
        claimContext: c.claim.claimContext,
      },
      inquiryResponse: c.inquiryResponse,
    })),
    practiceContext: {
      totalClaimsInFeed: claims.length,
      totalBilledAmount: `$${totalBilled.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      oldestClaimDays: oldestDays,
      urgentClaimCount: urgentCount,
    },
  }
}

export async function analyzeARWithClaude(
  input: ClaudeARInput
): Promise<ClaudeARAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('Missing ANTHROPIC_API_KEY environment variable')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2500,
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: JSON.stringify(input),
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const textContent = data.content?.[0]?.text

  if (!textContent) {
    throw new Error('Claude API returned empty response')
  }

  const analysis: ClaudeARAnalysis = JSON.parse(textContent)
  return analysis
}
