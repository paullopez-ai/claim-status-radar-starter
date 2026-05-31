"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { LoginForm } from "@/components/login-form"
import { MockModeBanner } from "@/components/mock-mode-banner"
import { SandboxModeBanner } from "@/components/sandbox-mode-banner"
import { SandboxDevConsole } from "@/components/sandbox-dev-console"
import { SandboxDisclosure } from "@/components/sandbox-disclosure"
import { ThemeToggle } from "@/components/theme-toggle"
import { ModeToggle } from "@/components/mode-toggle"
import { RefreshButton } from "@/components/refresh-button"
import { ARStatsBar } from "@/components/ar-stats-bar"
import { ARSummaryPanel } from "@/components/ar-summary-panel"
import { ClaimFeedControls } from "@/components/claim-feed-controls"
import { ClaimFeedTable } from "@/components/claim-feed-table"
import { LoadingOverlay } from "@/components/loading-overlay"
import { TimingBadges } from "@/components/timing-badges"
import { ConsoleLogPanel } from "@/components/console-log-panel"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { loadMockFeedData } from "@/lib/mock/mock-loader"
import { sortClaims, filterClaims } from "@/lib/claim-utils"
import type { ClaimStatusFeedResult, ClaimInquiryResult, ConsoleLogEntry } from "@/types/optum.types"
import type { ClaudeARAnalysis } from "@/types/claude.types"
import type { SandboxNarrative } from "@/types/sandbox.types"
import type { ClaimSortField, SortDirection, ClaimPriority, ClaimFeedFilters } from "@/types/claim.types"

type AppMode = "mock" | "sandbox"
type FeedStatus = "idle" | "refreshing" | "success" | "partial_error" | "total_error"

interface DashboardState {
  feedStatus: FeedStatus
  claimResults: ClaimInquiryResult[]
  arAnalysis: ClaudeARAnalysis | null
  filters: ClaimFeedFilters
  sortField: ClaimSortField
  sortDirection: SortDirection
  expandedClaims: Record<string, boolean>
  activeTabs: Record<string, "action" | "detail" | "raw">
  timing: { parallelInquiryMs: number; claudeMs: number; totalMs: number } | null
  sandboxNarrative: SandboxNarrative | null
  error: string | null
}

function getInitialMode(): AppMode {
  const env = process.env.NEXT_PUBLIC_APP_ENV
  if (env === "sandbox") return "sandbox"
  return "mock"
}

export default function Home() {
  // Mock mode is the public demo — no login required. Sandbox still gates on auth.
  const [isAuthenticated, setIsAuthenticated] = useState(() => getInitialMode() === "mock")
  const [appMode, setAppMode] = useState<AppMode>(getInitialMode)
  const [consoleOpen, setConsoleOpen] = useState(false)
  const [consoleEntries, setConsoleEntries] = useState<ConsoleLogEntry[]>([])

  const isMock = appMode === "mock"
  const isSandbox = appMode === "sandbox"

  const [state, setState] = useState<DashboardState>({
    feedStatus: "idle",
    claimResults: [],
    arAnalysis: null,
    filters: { priority: "ALL", scenario: "ALL", ageCategory: "ALL", payerName: "ALL" },
    sortField: "priority",
    sortDirection: "desc",
    expandedClaims: {},
    activeTabs: {},
    timing: null,
    sandboxNarrative: null,
    error: null,
  })

  // Load mock data on mount
  useEffect(() => {
    const data = loadMockFeedData()
    setState((prev) => ({
      ...prev,
      claimResults: data.claims,
      arAnalysis: data.arAnalysis,
      timing: data.timing,
    }))
  }, [])

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setState((prev) => ({ ...prev, feedStatus: "refreshing", error: null }))

    // Log the frontend request
    const startEntry: ConsoleLogEntry = {
      timestamp: new Date().toISOString(),
      phase: "api_request",
      label: "Frontend → POST /api/optum/claim-status",
      detail: `mode: ${appMode}`,
    }
    setConsoleEntries((prev) => [...prev, startEntry])

    const startMs = Date.now()

    try {
      const response = await fetch("/api/optum/claim-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: appMode }),
      })
      if (!response.ok) throw new Error("API request failed")
      const data: ClaimStatusFeedResult = await response.json()

      // Merge server-side log entries
      if (data.consoleLog) {
        setConsoleEntries((prev) => [...prev, ...data.consoleLog!])
      }

      // Add completion entry
      const totalMs = Date.now() - startMs
      setConsoleEntries((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          phase: "api_response" as const,
          label: "Feed refresh complete",
          detail: `${data.claims.length} claims loaded — ${data.arAnalysis ? "Claude analysis included" : "no AI analysis"}`,
          durationMs: totalMs,
        },
      ])

      setState((prev) => ({
        ...prev,
        feedStatus: data.errorCount > 0 ? "partial_error" : "success",
        claimResults: data.claims,
        arAnalysis: data.arAnalysis,
        timing: data.timing,
        sandboxNarrative: data.sandboxNarrative ?? null,
      }))
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      setConsoleEntries((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          phase: "error" as const,
          label: "Request failed",
          detail: msg,
          durationMs: Date.now() - startMs,
        },
      ])
      setState((prev) => ({
        ...prev,
        feedStatus: "total_error",
        error: msg,
      }))
    }
  }, [appMode])

  // Derive sorted/filtered claims
  const processedClaims = useMemo(() => {
    const filtered = filterClaims(state.claimResults, state.filters)
    return sortClaims(filtered, state.sortField, state.sortDirection)
  }, [state.claimResults, state.filters, state.sortField, state.sortDirection])

  // Unique payers for filter
  const payers = useMemo(() => {
    return [...new Set(state.claimResults.map((r) => r.claim.payerName))]
  }, [state.claimResults])

  // Show login form when not authenticated
  if (!isAuthenticated) {
    return <LoginForm onLogin={() => setIsAuthenticated(true)} />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <MockModeBanner isMock={isMock} />
      <SandboxModeBanner isSandbox={isSandbox} />

      <LoadingOverlay
        isVisible={state.feedStatus === "refreshing"}
        phaseMessages={isSandbox ? ["Running sandbox API probes...", "Preparing diagnostic narrative..."] : undefined}
      />

      <div className={`flex-1 grid ${consoleOpen ? "grid-cols-[1fr_380px]" : "grid-cols-1"}`}>
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-6">
          {isSandbox && <SandboxDevConsole narrative={state.sandboxNarrative} isSandbox={isSandbox} />}
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-4xl font-bold">Claim Status Radar</h1>
              <p className="text-muted-foreground mt-1">AR Intelligence Feed</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={consoleOpen}
                  onCheckedChange={setConsoleOpen}
                  size="sm"
                />
                <Label className="text-xs text-muted-foreground cursor-pointer" onClick={() => setConsoleOpen(!consoleOpen)}>
                  API Console
                </Label>
              </div>
              <ModeToggle mode={appMode} onModeChange={setAppMode} />
              <RefreshButton
                isRefreshing={state.feedStatus === "refreshing"}
                onRefresh={handleRefresh}
              />
              <ThemeToggle />
            </div>
          </div>

          {/* AR Stats Bar */}
          <ARStatsBar summary={state.arAnalysis?.arSummary ?? null} />

          {/* AR Summary Panel */}
          <ARSummaryPanel summary={state.arAnalysis?.arSummary ?? null} />

          {/* Feed Controls */}
          <ClaimFeedControls
            sortField={state.sortField}
            sortDirection={state.sortDirection}
            priorityFilter={state.filters.priority}
            payerFilter={state.filters.payerName}
            payers={payers}
            onSortFieldChange={(field) => setState((prev) => ({ ...prev, sortField: field }))}
            onSortDirectionChange={(dir) => setState((prev) => ({ ...prev, sortDirection: dir }))}
            onPriorityFilterChange={(p) =>
              setState((prev) => ({ ...prev, filters: { ...prev.filters, priority: p } }))
            }
            onPayerFilterChange={(p) =>
              setState((prev) => ({ ...prev, filters: { ...prev.filters, payerName: p } }))
            }
          />

          {/* Claim Feed Table */}
          <ClaimFeedTable
            claims={processedClaims}
            expandedClaims={state.expandedClaims}
            activeTabs={state.activeTabs}
            onToggleClaim={(id) =>
              setState((prev) => ({
                ...prev,
                expandedClaims: { ...prev.expandedClaims, [id]: !prev.expandedClaims[id] },
              }))
            }
            onTabChange={(id, tab) =>
              setState((prev) => ({
                ...prev,
                activeTabs: { ...prev.activeTabs, [id]: tab },
              }))
            }
          />

          {/* Timing Badges */}
          {state.timing && (
            <TimingBadges
              parallelMs={state.timing.parallelInquiryMs}
              claudeMs={state.timing.claudeMs}
              totalMs={state.timing.totalMs}
              claimCount={state.claimResults.length}
            />
          )}

          {/* Error display */}
          {state.error && (
            <div className="bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive">
              {state.error}
            </div>
          )}
        </main>

        {/* API Console Panel */}
        {consoleOpen && (
          <div className="h-screen sticky top-0">
            <ConsoleLogPanel entries={consoleEntries} />
          </div>
        )}
      </div>

      <SandboxDisclosure mode={appMode} />
    </div>
  )
}
