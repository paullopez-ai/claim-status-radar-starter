import { Badge } from "@/components/ui/badge"
import type { ClaimPriority } from "@/types/claim.types"
import { cn } from "@/lib/utils"

const PRIORITY_STYLES: Record<ClaimPriority, string> = {
  URGENT: "bg-brand/15 text-brand border-brand/30 font-semibold",
  ACTION_REQUIRED: "bg-brand/10 text-brand/80 border-brand/20",
  MONITOR: "bg-primary/10 text-primary border-primary/20",
  ON_TRACK: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
}

const PRIORITY_LABELS: Record<ClaimPriority, string> = {
  URGENT: "URGENT",
  ACTION_REQUIRED: "ACTION REQUIRED",
  MONITOR: "MONITOR",
  ON_TRACK: "ON TRACK",
}

export function ClaimPriorityBadge({ priority }: { priority: ClaimPriority }) {
  return (
    <Badge variant="outline" className={cn("font-mono text-xs", PRIORITY_STYLES[priority])}>
      {PRIORITY_LABELS[priority]}
    </Badge>
  )
}
