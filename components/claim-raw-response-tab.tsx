"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { ClaimInquiryResponse } from "@/types/optum.types"

export function ClaimRawResponseTab({ response }: { response: ClaimInquiryResponse }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="border-l-4 border-l-primary/40 border-t-0 border-r border-b">
      <CardContent className="p-4">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger
            className="flex w-full items-center justify-between rounded-md px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
          >
            <span className="font-mono text-xs text-primary">Raw API Response</span>
            <HugeiconsIcon icon={isOpen ? ArrowUp01Icon : ArrowDown01Icon} className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <pre className="mt-2 p-4 bg-muted/50 overflow-x-auto text-xs font-mono leading-relaxed">
              {JSON.stringify(response, null, 2)}
            </pre>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
