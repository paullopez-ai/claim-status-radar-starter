import type { SyntheticClaim } from './claim.types'

export interface ConsoleLogEntry {
  timestamp: string
  phase: 'auth' | 'claim_inquiry' | 'api_request' | 'api_response' | 'claude_request' | 'claude_response' | 'error'
  label: string
  detail?: string
  data?: unknown
  durationMs?: number
}
import type { ClaudeClaimAction, ClaudeARAnalysis } from './claude.types'
import type { SandboxNarrative } from './sandbox.types'

export interface ClaimInquiryGraphQLResponse {
  data?: {
    claimInquiry: ClaimInquiryResponse | null
  }
  errors?: Array<{
    message: string
    extensions?: {
      code: string
    }
  }>
}

export interface ClaimInquiryResponse {
  controlNumber: string
  tradingPartnerServiceId: string
  claimStatus: {
    statusCode: string
    statusCodeDescription: string
    statusCategoryCode: string
    statusCategoryDescription: string
    effectiveDate: string
    checkDate: string | null
    checkNumber: string | null
  }
  claimServiceLine: Array<{
    lineNumber: string
    serviceTypeCode: string | null
    serviceType: string | null
    procedureCode: string
    billedAmount: string
    allowedAmount: string | null
    paidAmount: string | null
    adjustmentReasonCode: string | null
    adjustmentReasonDescription: string | null
    remarkCode: string | null
    remarkDescription: string | null
  }>
  payerControlNumber: string | null
  claimReceivedDate: string
  patientAccountNumber: string | null
  totalBilledAmount: string
  totalAllowedAmount: string | null
  totalPaidAmount: string | null
  patientResponsibilityAmount: string | null
  renderingProvider: {
    npi: string
    firstName: string | null
    lastName: string | null
    organizationName: string | null
  }
  submittedProvider: {
    npi: string
    organizationName: string | null
  }
  subscriber: {
    memberId: string
    firstName: string | null
    lastName: string | null
    dateOfBirth: string | null
  }
  payer: {
    name: string
    payerId: string
  }
  adjudicationInfo: {
    isAdjudicated: boolean
    adjudicationDate: string | null
    eraAvailable: boolean
    denialReason: string | null
    denialCode: string | null
    appealDeadline: string | null
  }
  additionalInformationRequested: {
    isRequested: boolean
    requestType: string | null
    requestDescription: string | null
    responseDueDate: string | null
  }
}

export interface ClaimInquiryResult {
  claim: SyntheticClaim
  inquiryResponse: ClaimInquiryResponse
  claimAction: ClaudeClaimAction
  timingMs: number
  error: string | null
}

export interface ClaimStatusFeedResult {
  claims: ClaimInquiryResult[]
  arAnalysis: ClaudeARAnalysis
  timing: {
    parallelInquiryMs: number
    claudeMs: number
    totalMs: number
  }
  mode: 'mock' | 'sandbox' | 'production'
  successCount: number
  errorCount: number
  sandboxNarrative?: SandboxNarrative
  consoleLog?: ConsoleLogEntry[]
}
