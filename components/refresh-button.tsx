"use client"

import { Button } from "@/components/ui/button"
import { Loading03Icon, ArrowReloadHorizontalIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

interface RefreshButtonProps {
  isRefreshing: boolean
  onRefresh: () => void
}

export function RefreshButton({ isRefreshing, onRefresh }: RefreshButtonProps) {
  return (
    <Button
      onClick={onRefresh}
      disabled={isRefreshing}
      className="bg-primary hover:bg-primary/90"
    >
      <HugeiconsIcon
        icon={isRefreshing ? Loading03Icon : ArrowReloadHorizontalIcon}
        className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
      />
      {isRefreshing ? "Refreshing..." : "Refresh AR Intelligence"}
    </Button>
  )
}
