"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import type { ClaudeARSummary } from "@/types/claude.types"
import { cn } from "@/lib/utils"

interface ARStatsBarProps {
  summary: ClaudeARSummary | null
}

interface StatCardProps {
  label: string
  count: number
  className: string
  showPulse?: boolean
}

function StatCard({ label, count, className, showPulse }: StatCardProps) {
  return (
    <Card className={cn("relative", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-sans font-medium">{label}</span>
          {showPulse && count > 0 && (
            <motion.div
              className="h-2.5 w-2.5 rounded-full bg-brand"
              animate={{ opacity: [1, 0.3, 1], scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </div>
        <p className="text-3xl font-mono font-bold mt-1">{count}</p>
      </CardContent>
    </Card>
  )
}

export function ARStatsBar({ summary }: ARStatsBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        label="Urgent"
        count={summary?.urgentCount ?? 0}
        className="border-brand/40 bg-brand/5"
        showPulse
      />
      <StatCard
        label="Action Required"
        count={summary?.actionRequiredCount ?? 0}
        className="border-brand/20 text-brand/80"
      />
      <StatCard
        label="Monitor"
        count={summary?.monitorCount ?? 0}
        className="border-primary/20"
      />
      <StatCard
        label="On Track"
        count={summary?.onTrackCount ?? 0}
        className="border-green-500/20"
      />
    </div>
  )
}
