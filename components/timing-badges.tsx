import { Badge } from "@/components/ui/badge"

interface TimingBadgesProps {
  parallelMs: number
  claudeMs: number
  totalMs: number
  claimCount: number
}

export function TimingBadges({ parallelMs, claudeMs, totalMs, claimCount }: TimingBadgesProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
        {claimCount} claims checked in parallel: {parallelMs}ms
      </Badge>
      <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
        AI analysis: {claudeMs}ms
      </Badge>
      <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
        Total: {totalMs}ms
      </Badge>
    </div>
  )
}
