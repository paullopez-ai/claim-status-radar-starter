"use client"

import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ClaimRow } from "@/components/claim-row"
import { ErrorClaimRow } from "@/components/error-claim-row"
import type { ClaimInquiryResult } from "@/types/optum.types"

interface ClaimFeedTableProps {
  claims: ClaimInquiryResult[]
  expandedClaims: Record<string, boolean>
  activeTabs: Record<string, "action" | "detail" | "raw">
  onToggleClaim: (claimId: string) => void
  onTabChange: (claimId: string, tab: "action" | "detail" | "raw") => void
}

export function ClaimFeedTable({
  claims,
  expandedClaims,
  activeTabs,
  onToggleClaim,
  onTabChange,
}: ClaimFeedTableProps) {
  return (
    <div className="border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-sans text-xs">Patient</TableHead>
            <TableHead className="font-sans text-xs">Payer</TableHead>
            <TableHead className="font-sans text-xs">Status</TableHead>
            <TableHead className="font-sans text-xs">Priority</TableHead>
            <TableHead className="font-sans text-xs">Age</TableHead>
            <TableHead className="font-sans text-xs">Billed</TableHead>
            <TableHead className="font-sans text-xs">CPT</TableHead>
            <TableHead className="font-sans text-xs">Filing</TableHead>
            <TableHead className="font-sans text-xs w-8"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {claims.map((result) =>
            result.error ? (
              <ErrorClaimRow key={result.claim.id} result={result} />
            ) : (
              <ClaimRow
                key={result.claim.id}
                result={result}
                isExpanded={expandedClaims[result.claim.id] ?? false}
                activeTab={activeTabs[result.claim.id] ?? "action"}
                onToggle={() => onToggleClaim(result.claim.id)}
                onTabChange={(tab) => onTabChange(result.claim.id, tab)}
              />
            )
          )}
        </TableBody>
      </Table>
    </div>
  )
}
