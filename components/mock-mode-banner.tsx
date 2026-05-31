"use client"

import { Alert02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

interface MockModeBannerProps {
  isMock: boolean
}

export function MockModeBanner({ isMock }: MockModeBannerProps) {
  if (!isMock) return null

  return (
    <div className="bg-brand/10 border-b border-brand/20 px-4 py-2 text-center text-sm font-sans">
      <span className="inline-flex items-center gap-2 text-brand">
        <HugeiconsIcon icon={Alert02Icon} className="h-4 w-4" />
        <span className="font-medium">Mock Mode</span>
        <span className="text-brand/80">— Using simulated data. No live API calls.</span>
      </span>
    </div>
  )
}
