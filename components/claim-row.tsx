"use client"

import { ClaimRowCollapsed } from "@/components/claim-row-collapsed"
import { ClaimRowExpanded } from "@/components/claim-row-expanded"
import type { ClaimInquiryResult } from "@/types/optum.types"

interface ClaimRowProps {
  result: ClaimInquiryResult
  isExpanded: boolean
  activeTab: "action" | "detail" | "raw"
  onToggle: () => void
  onTabChange: (tab: "action" | "detail" | "raw") => void
}

export function ClaimRow({ result, isExpanded, activeTab, onToggle, onTabChange }: ClaimRowProps) {
  if (result.error) return null

  return (
    <>
      <ClaimRowCollapsed result={result} onToggle={onToggle} />
      {isExpanded && (
        <ClaimRowExpanded
          result={result}
          activeTab={activeTab}
          onTabChange={onTabChange}
          onCollapse={onToggle}
        />
      )}
    </>
  )
}
