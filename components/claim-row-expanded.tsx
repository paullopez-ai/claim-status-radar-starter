"use client"

import { TableRow, TableCell } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClaimActionTab } from "@/components/claim-action-tab"
import { ClaimDetailTab } from "@/components/claim-detail-tab"
import { ClaimRawResponseTab } from "@/components/claim-raw-response-tab"
import type { ClaimInquiryResult } from "@/types/optum.types"

interface ClaimRowExpandedProps {
  result: ClaimInquiryResult
  activeTab: "action" | "detail" | "raw"
  onTabChange: (tab: "action" | "detail" | "raw") => void
  onCollapse: () => void
}

export function ClaimRowExpanded({ result, activeTab, onTabChange, onCollapse }: ClaimRowExpandedProps) {
  return (
    <TableRow>
      <TableCell colSpan={9} className="p-0">
        <div className="p-4 bg-muted/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-sans font-medium">
              {result.claim.patientFirstName} {result.claim.patientLastName} — {result.claim.procedureDescription}
            </span>
            <button
              onClick={onCollapse}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Collapse
            </button>
          </div>
          <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as "action" | "detail" | "raw")}>
            <TabsList>
              <TabsTrigger value="action" className="text-xs">Action Recommendation</TabsTrigger>
              <TabsTrigger value="detail" className="text-xs">Claim Detail</TabsTrigger>
              <TabsTrigger value="raw" className="text-xs">Raw Response</TabsTrigger>
            </TabsList>
            <TabsContent value="action">
              <ClaimActionTab action={result.claimAction} />
            </TabsContent>
            <TabsContent value="detail">
              <ClaimDetailTab claim={result.claim} response={result.inquiryResponse} />
            </TabsContent>
            <TabsContent value="raw">
              <ClaimRawResponseTab response={result.inquiryResponse} />
            </TabsContent>
          </Tabs>
        </div>
      </TableCell>
    </TableRow>
  )
}
