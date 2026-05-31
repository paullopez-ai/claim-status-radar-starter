"use client"

import { TestTube02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

interface SandboxModeBannerProps {
  isSandbox: boolean
}

export function SandboxModeBanner({ isSandbox }: SandboxModeBannerProps) {
  if (!isSandbox) return null

  return (
    <div className="bg-purple-500/10 border-b border-purple-500/20 px-4 py-2.5 text-center text-sm font-sans">
      <div className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400">
        <HugeiconsIcon icon={TestTube02Icon} className="h-4 w-4 shrink-0" />
        <span className="font-medium">Sandbox Mode</span>
        <span className="text-purple-600/80 dark:text-purple-400/80">
          — Optum sandbox only provides Eligibility API access. Claim Status requires a separate production subscription.
          Dashboard shows fixture data; developer console below logs real API connectivity diagnostics.
        </span>
      </div>
    </div>
  )
}
