"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ClaudeARSummary } from "@/types/claude.types"
import { AiBeautifyIcon, AnalyticsUpIcon, TaskDailyIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

interface ARSummaryPanelProps {
  summary: ClaudeARSummary | null
}

export function ARSummaryPanel({ summary }: ARSummaryPanelProps) {
  if (!summary) return null

  return (
    <div className="space-y-4">
      {/* Top 3 Actions Today */}
      <Card className="border-brand-secondary/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-brand-secondary font-sans text-lg">
            <HugeiconsIcon icon={TaskDailyIcon} className="h-5 w-5" />
            Top Three Actions Today
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {summary.topThreeActions.map((action) => (
            <div
              key={action.rank}
              className="border-l-2 border-brand-secondary/40 pl-4 py-2"
            >
              <div className="flex items-start gap-2">
                <span className="font-mono text-sm font-bold text-brand-secondary">
                  #{action.rank}
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-sans">{action.action}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {action.affectedClaimIds.join(", ")}
                  </p>
                  <p className="text-xs text-brand-secondary/70">{action.urgencyReason}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Practice AR Health */}
        <Card className="border-brand-secondary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-brand-secondary font-sans text-lg">
              <HugeiconsIcon icon={AnalyticsUpIcon} className="h-5 w-5" />
              Practice AR Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Outstanding</span>
              <span className="font-mono text-lg font-semibold">{summary.totalBilledOutstanding}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Est. Collectable</span>
              <span className="font-display text-2xl font-bold text-brand-secondary">
                {summary.estimatedCollectable}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed pt-2 border-t border-border">
              {summary.practiceHealthSummary}
            </p>
          </CardContent>
        </Card>

        {/* AI Insight */}
        <Card className="border-brand-secondary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-brand-secondary font-sans text-lg">
              <HugeiconsIcon icon={AiBeautifyIcon} className="h-5 w-5" />
              AI Insight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{summary.insight}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
