import { Badge } from "@/components/ui/badge"
import type { ClaudeClaimAction } from "@/types/claude.types"
import { cn } from "@/lib/utils"

interface ClaimRiskAssessmentProps {
  risk: ClaudeClaimAction["riskAssessment"]
}

export function ClaimRiskAssessment({ risk }: ClaimRiskAssessmentProps) {
  const flags = [
    { label: "Timely Filing", active: risk.timelyFilingRisk },
    { label: "Denial Risk", active: risk.denialRisk },
    { label: "Appeal Deadline", active: risk.appealDeadlineRisk },
  ]

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-sans">Risk Level:</span>
        <Badge
          variant="outline"
          className={cn(
            "font-mono text-xs",
            risk.riskLevel === "HIGH" && "bg-brand/15 text-brand border-brand/30",
            risk.riskLevel === "MEDIUM" && "bg-brand/10 text-brand/70 border-brand/20",
            risk.riskLevel === "LOW" && "bg-primary/10 text-primary border-primary/20",
            risk.riskLevel === "NONE" && "bg-muted text-muted-foreground border-border"
          )}
        >
          {risk.riskLevel}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        {flags.map((flag) => (
          <Badge
            key={flag.label}
            variant="outline"
            className={cn(
              "text-xs",
              flag.active
                ? "bg-brand/10 text-brand border-brand/20"
                : "bg-muted/50 text-muted-foreground/50 border-border/50"
            )}
          >
            {flag.label}
          </Badge>
        ))}
      </div>
      {risk.riskSummary && (
        <p className="text-xs text-muted-foreground">{risk.riskSummary}</p>
      )}
    </div>
  )
}
