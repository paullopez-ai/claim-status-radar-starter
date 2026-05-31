"use client"

import { Alert02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

interface SandboxUnavailableBannerProps {
  message: string | null
  onDismiss: () => void
}

export function SandboxUnavailableBanner({ message, onDismiss }: SandboxUnavailableBannerProps) {
  if (!message) return null

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-center text-sm font-sans">
      <span className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400">
        <HugeiconsIcon icon={Alert02Icon} className="h-4 w-4 shrink-0" />
        <span className="font-medium">Sandbox unavailable</span>
        <span className="text-amber-600/80 dark:text-amber-400/80">— {message}</span>
        <button
          onClick={onDismiss}
          className="ml-1 underline underline-offset-2 hover:no-underline"
          aria-label="Dismiss"
        >
          Dismiss
        </button>
      </span>
    </div>
  )
}
