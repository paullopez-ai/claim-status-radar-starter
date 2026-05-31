"use client"

import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { SandboxNarrative, SandboxLogLevel } from "@/types/sandbox.types"

const levelConfig: Record<SandboxLogLevel, { icon: string; color: string }> = {
  success: { icon: "✓", color: "text-green-600 dark:text-green-400" },
  error: { icon: "✗", color: "text-red-600 dark:text-red-400" },
  warn: { icon: "⚠", color: "text-amber-600 dark:text-amber-400" },
  info: { icon: "·", color: "text-muted-foreground" },
  explain: { icon: "ℹ", color: "text-purple-600 dark:text-purple-400" },
}

interface SandboxDevConsoleProps {
  narrative: SandboxNarrative | null
  isSandbox: boolean
}

export function SandboxDevConsole({ narrative, isSandbox }: SandboxDevConsoleProps) {
  const [isOpen, setIsOpen] = useState(true)

  if (!isSandbox) return null

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border border-purple-500/20 bg-purple-500/5 rounded-lg overflow-hidden">
        <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-sans hover:bg-purple-500/10 transition-colors cursor-pointer">
          <span className="font-medium text-purple-600 dark:text-purple-400">
            Developer Console — API Diagnostics
          </span>
          <HugeiconsIcon
            icon={isOpen ? ArrowUp01Icon : ArrowDown01Icon}
            className="h-4 w-4 text-purple-600 dark:text-purple-400"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-purple-500/20 px-4 py-3">
            {!narrative ? (
              <p className="text-sm text-muted-foreground font-sans italic">
                Press <span className="font-medium text-foreground">Refresh AR Intelligence</span> to run sandbox API diagnostics.
              </p>
            ) : (
              <>
                <ScrollArea className="h-[240px]">
                  <div className="space-y-1 font-mono text-xs">
                    {narrative.logs.map((entry, i) => {
                      const config = levelConfig[entry.level]
                      return (
                        <div key={i} className="flex gap-2 leading-relaxed">
                          <span className="text-muted-foreground/60 w-16 text-right shrink-0">
                            +{entry.offsetMs}ms
                          </span>
                          <span className="text-muted-foreground/60 w-20 shrink-0 truncate">
                            [{entry.step}]
                          </span>
                          <span className={`shrink-0 w-4 text-center ${config.color}`}>
                            {config.icon}
                          </span>
                          <span className={entry.level === 'explain' ? config.color : 'text-foreground'}>
                            {entry.message}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>

                <div className="mt-3 pt-3 border-t border-purple-500/10 text-xs font-sans text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">What sandbox proves:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-1">
                    <li>OAuth client_credentials flow works with your Optum credentials</li>
                    <li>Optum GraphQL endpoint is reachable and authenticated</li>
                    <li>Claude API key is valid and the model responds</li>
                    <li>The full data pipeline renders correctly in the dashboard</li>
                  </ul>
                  <p className="font-medium text-foreground mt-2">Why claim inquiries don&apos;t return data:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-1">
                    <li>The sandbox only exposes the Eligibility API (checkEligibility queries)</li>
                    <li>Claim Status is a separate Optum API product requiring its own subscription</li>
                    <li>The &quot;FieldUndefined&quot; errors confirm the endpoint is live — it just doesn&apos;t have a claim inquiry schema</li>
                    <li>Production claim status requires an Optum Claim Status API subscription with real claim IDs</li>
                  </ul>
                  <p className="text-muted-foreground/60 mt-2">
                    Completed in {narrative.totalMs}ms
                  </p>
                </div>
              </>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
