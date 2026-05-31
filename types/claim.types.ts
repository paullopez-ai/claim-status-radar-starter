export type ClaimScenario =
  | 'PROCESSING_ON_SCHEDULE'
  | 'PAYMENT_PENDING'
  | 'ADDITIONAL_INFO_REQUESTED'
  | 'DENIED_BILLING_ERROR'
  | 'DENIED_MEDICAL_NECESSITY'
  | 'TIMELY_FILING_AT_RISK'
  | 'SECONDARY_PENDING'
  | 'APPEAL_IN_PROGRESS'

export type ClaimPriority = 'URGENT' | 'ACTION_REQUIRED' | 'MONITOR' | 'ON_TRACK'
export type ClaimAgeCategory = 'CURRENT' | 'AGING' | 'CRITICAL'

export interface SyntheticClaim {
  id: string
  patientFirstName: string
  patientLastName: string
  dateOfService: string
  procedureCode: string
  procedureDescription: string
  billedAmount: string
  billedAmountNumeric: number
  payerName: string
  tradingPartnerServiceId: string
  claimControlNumber: string
  payerClaimNumber: string
  submittedDate: string
  daysOutstanding: number
  timelyFilingLimit: number
  daysUntilFilingDeadline: number
  scenario: ClaimScenario
  priority: ClaimPriority
  ageCategory: ClaimAgeCategory
  claimContext: string
  mockClaimScenario: string
}

export interface ClaimFeedFilters {
  priority: ClaimPriority | 'ALL'
  scenario: ClaimScenario | 'ALL'
  ageCategory: ClaimAgeCategory | 'ALL'
  payerName: string | 'ALL'
}

export type ClaimSortField =
  | 'priority'
  | 'daysOutstanding'
  | 'billedAmountNumeric'
  | 'payerName'
  | 'daysUntilFilingDeadline'

export type SortDirection = 'asc' | 'desc'
