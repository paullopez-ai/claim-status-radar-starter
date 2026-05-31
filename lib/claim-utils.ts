import type { ClaimInquiryResult } from '@/types/optum.types'
import type { ClaimFeedFilters, ClaimSortField, SortDirection, ClaimAgeCategory, ClaimPriority } from '@/types/claim.types'

const PRIORITY_ORDER: Record<ClaimPriority, number> = {
  URGENT: 0,
  ACTION_REQUIRED: 1,
  MONITOR: 2,
  ON_TRACK: 3,
}

export function sortClaims(
  claims: ClaimInquiryResult[],
  field: ClaimSortField,
  direction: SortDirection
): ClaimInquiryResult[] {
  return [...claims].sort((a, b) => {
    let comparison = 0
    switch (field) {
      case 'priority':
        comparison = PRIORITY_ORDER[a.claim.priority] - PRIORITY_ORDER[b.claim.priority]
        break
      case 'daysOutstanding':
        comparison = a.claim.daysOutstanding - b.claim.daysOutstanding
        break
      case 'billedAmountNumeric':
        comparison = a.claim.billedAmountNumeric - b.claim.billedAmountNumeric
        break
      case 'payerName':
        comparison = a.claim.payerName.localeCompare(b.claim.payerName)
        break
      case 'daysUntilFilingDeadline':
        comparison = a.claim.daysUntilFilingDeadline - b.claim.daysUntilFilingDeadline
        break
    }
    return direction === 'asc' ? comparison : -comparison
  })
}

export function filterClaims(
  claims: ClaimInquiryResult[],
  filters: ClaimFeedFilters
): ClaimInquiryResult[] {
  return claims.filter((result) => {
    if (filters.priority !== 'ALL' && result.claim.priority !== filters.priority) return false
    if (filters.scenario !== 'ALL' && result.claim.scenario !== filters.scenario) return false
    if (filters.ageCategory !== 'ALL' && result.claim.ageCategory !== filters.ageCategory) return false
    if (filters.payerName !== 'ALL' && result.claim.payerName !== filters.payerName) return false
    return true
  })
}

export function calculateAgeCategory(daysOutstanding: number): ClaimAgeCategory {
  if (daysOutstanding >= 60) return 'CRITICAL'
  if (daysOutstanding >= 30) return 'AGING'
  return 'CURRENT'
}

export function calculateDaysUntilFilingDeadline(
  submittedDate: string,
  timelyFilingLimit: number
): number {
  const submitted = new Date(submittedDate)
  const deadline = new Date(submitted)
  deadline.setDate(deadline.getDate() + timelyFilingLimit)
  const now = new Date()
  const diffMs = deadline.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}
