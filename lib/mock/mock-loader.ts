import type { ClaimStatusFeedResult, ClaimInquiryResult } from '@/types/optum.types'
import { SYNTHETIC_CLAIMS } from '@/lib/claims'
import { MOCK_CLAIM_INQUIRY_RESPONSES } from '@/lib/mock/claim-inquiry-fixtures'
import { MOCK_CLAUDE_AR_ANALYSIS } from '@/lib/mock/claude-fixtures'

export function loadMockFeedData(): ClaimStatusFeedResult {
  const claims: ClaimInquiryResult[] = SYNTHETIC_CLAIMS.map((claim) => ({
    claim,
    inquiryResponse: MOCK_CLAIM_INQUIRY_RESPONSES[claim.id],
    claimAction: MOCK_CLAUDE_AR_ANALYSIS.perClaimActions[claim.id],
    timingMs: 180,
    error: null,
  }))

  return {
    claims,
    arAnalysis: MOCK_CLAUDE_AR_ANALYSIS,
    timing: {
      parallelInquiryMs: 320,
      claudeMs: 1800,
      totalMs: 2120,
    },
    mode: 'mock',
    successCount: 8,
    errorCount: 0,
  }
}
