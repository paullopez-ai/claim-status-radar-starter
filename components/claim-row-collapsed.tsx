"use client"

import { TableRow, TableCell } from "@/components/ui/table"
import { ClaimPriorityBadge } from "@/components/claim-priority-badge"
import { ClaimStatusBadge } from "@/components/claim-status-badge"
import { ClaimAgeIndicator } from "@/components/claim-age-indicator"
import { TimelyFilingCountdown } from "@/components/timely-filing-countdown"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { ClaimInquiryResult } from "@/types/optum.types"

interface ClaimRowCollapsedProps {
  result: ClaimInquiryResult
  onToggle: () => void
}

export function ClaimRowCollapsed({ result, onToggle }: ClaimRowCollapsedProps) {
  const { claim, inquiryResponse } = result

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={onToggle}
    >
      <TableCell>
        <div className="flex flex-col">
          <span className="text-sm font-sans font-medium">{claim.patientFirstName} {claim.patientLastName}</span>
          <span className="text-xs text-muted-foreground font-mono">{claim.claimControlNumber}</span>
        </div>
      </TableCell>
      <TableCell className="text-xs font-sans">{claim.payerName}</TableCell>
      <TableCell>
        <ClaimStatusBadge
          statusCode={inquiryResponse.claimStatus.statusCode}
          statusDescription={inquiryResponse.claimStatus.statusCodeDescription}
        />
      </TableCell>
      <TableCell>
        <ClaimPriorityBadge priority={claim.priority} />
      </TableCell>
      <TableCell>
        <ClaimAgeIndicator days={claim.daysOutstanding} />
      </TableCell>
      <TableCell className="font-mono text-sm">{claim.billedAmount}</TableCell>
      <TableCell className="text-xs font-mono">{claim.procedureCode}</TableCell>
      <TableCell>
        <TimelyFilingCountdown
          daysRemaining={claim.daysUntilFilingDeadline}
          isUrgent={claim.priority === "URGENT"}
        />
      </TableCell>
      <TableCell>
        <HugeiconsIcon icon={ArrowDown01Icon} className="h-4 w-4 text-muted-foreground" />
      </TableCell>
    </TableRow>
  )
}
