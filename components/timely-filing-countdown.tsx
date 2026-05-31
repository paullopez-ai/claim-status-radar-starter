"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TimelyFilingCountdownProps {
  daysRemaining: number
  isUrgent: boolean
}

export function TimelyFilingCountdown({ daysRemaining, isUrgent }: TimelyFilingCountdownProps) {
  if (daysRemaining > 30) return null

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        "font-mono text-xs",
        daysRemaining <= 14
          ? "bg-brand/20 text-brand border-brand/40 font-bold"
          : "bg-brand/10 text-brand/70 border-brand/20"
      )}
    >
      {daysRemaining}d to file
    </Badge>
  )

  if (isUrgent) {
    return (
      <motion.div
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {badge}
      </motion.div>
    )
  }

  return badge
}
