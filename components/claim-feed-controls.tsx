"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowUp01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { ClaimSortField, SortDirection, ClaimPriority } from "@/types/claim.types"

interface ClaimFeedControlsProps {
  sortField: ClaimSortField
  sortDirection: SortDirection
  priorityFilter: ClaimPriority | "ALL"
  payerFilter: string | "ALL"
  payers: string[]
  onSortFieldChange: (field: ClaimSortField) => void
  onSortDirectionChange: (dir: SortDirection) => void
  onPriorityFilterChange: (p: ClaimPriority | "ALL") => void
  onPayerFilterChange: (p: string) => void
}

export function ClaimFeedControls({
  sortField,
  sortDirection,
  priorityFilter,
  payerFilter,
  payers,
  onSortFieldChange,
  onSortDirectionChange,
  onPriorityFilterChange,
  onPayerFilterChange,
}: ClaimFeedControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={sortField} onValueChange={(v) => onSortFieldChange(v as ClaimSortField)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="priority">Priority</SelectItem>
          <SelectItem value="daysOutstanding">Days Outstanding</SelectItem>
          <SelectItem value="billedAmountNumeric">Billed Amount</SelectItem>
          <SelectItem value="payerName">Payer</SelectItem>
          <SelectItem value="daysUntilFilingDeadline">Filing Deadline</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onSortDirectionChange(sortDirection === "asc" ? "desc" : "asc")}
      >
        <HugeiconsIcon
          icon={sortDirection === "asc" ? ArrowUp01Icon : ArrowDown01Icon}
          className="h-4 w-4"
        />
      </Button>

      <Select value={priorityFilter} onValueChange={(v) => onPriorityFilterChange(v as ClaimPriority | "ALL")}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All Priorities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Priorities</SelectItem>
          <SelectItem value="URGENT">Urgent</SelectItem>
          <SelectItem value="ACTION_REQUIRED">Action Required</SelectItem>
          <SelectItem value="MONITOR">Monitor</SelectItem>
          <SelectItem value="ON_TRACK">On Track</SelectItem>
        </SelectContent>
      </Select>

      <Select value={payerFilter} onValueChange={(v) => { if (v !== null) onPayerFilterChange(v) }}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="All Payers" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Payers</SelectItem>
          {payers.map((payer) => (
            <SelectItem key={payer} value={payer}>{payer}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
