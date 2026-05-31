import { cn } from "@/lib/utils"

export function ClaimAgeIndicator({ days }: { days: number }) {
  return (
    <span className={cn(
      "font-mono text-sm",
      days >= 60 ? "text-brand font-semibold" : days >= 30 ? "text-brand/70" : "text-muted-foreground"
    )}>
      {days}d
    </span>
  )
}
