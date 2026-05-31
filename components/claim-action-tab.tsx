import { Card, CardContent } from "@/components/ui/card"
import { ClaimActionSteps } from "@/components/claim-action-steps"
import { ClaimRiskAssessment } from "@/components/claim-risk-assessment"
import { ClaimPriorityBadge } from "@/components/claim-priority-badge"
import type { ClaudeClaimAction } from "@/types/claude.types"

interface ClaimActionTabProps {
  action: ClaudeClaimAction
}

export function ClaimActionTab({ action }: ClaimActionTabProps) {
  return (
    <Card className="border-l-4 border-l-brand-secondary/60 border-t-0 border-r border-b">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClaimPriorityBadge priority={action.priority} />
            <span className="text-sm text-brand-secondary font-medium">{action.priorityReason}</span>
          </div>
        </div>

        {action.immediateAction && (
          <div className="bg-brand/5 border border-brand/20 p-3">
            <p className="text-sm font-semibold text-brand">Immediate Action</p>
            <p className="text-sm mt-1">{action.immediateAction}</p>
            {action.actionDeadline && (
              <p className="text-xs text-brand/70 font-mono mt-1">Deadline: {action.actionDeadline}</p>
            )}
          </div>
        )}

        <div>
          <p className="text-xs text-muted-foreground font-sans mb-1">Status Interpretation</p>
          <p className="text-sm">{action.statusInterpretation}</p>
        </div>

        {action.actionSteps.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground font-sans mb-2">Action Steps</p>
            <ClaimActionSteps steps={action.actionSteps} />
          </div>
        )}

        <ClaimRiskAssessment risk={action.riskAssessment} />

        <div>
          <p className="text-xs text-muted-foreground font-sans mb-1">Expected Resolution</p>
          <p className="text-sm">{action.expectedResolution}</p>
        </div>

        {action.contactPayer && action.contactPayerReason && (
          <div className="bg-brand-secondary/5 border border-brand-secondary/20 p-3">
            <p className="text-sm font-semibold text-brand-secondary">Contact Payer</p>
            <p className="text-sm mt-1">{action.contactPayerReason}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
