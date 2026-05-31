import type { ClaimPriority } from './claim.types'

export interface ClaudeClaimAction {
  priority: ClaimPriority
  priorityReason: string
  actionRequired: boolean
  immediateAction: string | null
  actionDeadline: string | null
  actionSteps: Array<{
    stepNumber: number
    step: string
    estimatedTime: string
  }>
  riskAssessment: {
    riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'
    riskSummary: string | null
    timelyFilingRisk: boolean
    denialRisk: boolean
    appealDeadlineRisk: boolean
  }
  statusInterpretation: string
  expectedResolution: string
  contactPayer: boolean
  contactPayerReason: string | null
}

export interface ClaudeARSummary {
  urgentCount: number
  actionRequiredCount: number
  monitorCount: number
  onTrackCount: number
  totalBilledOutstanding: string
  estimatedCollectable: string
  topThreeActions: Array<{
    rank: number
    action: string
    affectedClaimIds: string[]
    urgencyReason: string
  }>
  practiceHealthSummary: string
  flaggedForImmediateAttention: string[]
  insight: string
}

export interface ClaudeARAnalysis {
  perClaimActions: Record<string, ClaudeClaimAction>
  arSummary: ClaudeARSummary
}
