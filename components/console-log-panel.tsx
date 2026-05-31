"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { ConsoleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { ConsoleLogEntry } from "@/types/optum.types"

interface ConsoleLogPanelProps {
  entries: ConsoleLogEntry[]
}

const PHASE_COLORS: Record<string, string> = {
  auth: "text-yellow-500",
  claim_inquiry: "text-cyan-400",
  api_request: "text-blue-400",
  api_response: "text-green-400",
  claude_request: "text-purple-400",
  claude_response: "text-purple-300",
  error: "text-red-400",
}

const PHASE_LABELS: Record<string, string> = {
  auth: "AUTH",
  claim_inquiry: "CLM",
  api_request: "REQ",
  api_response: "RES",
  claude_request: "AI→",
  claude_response: "AI←",
  error: "ERR",
}

function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString)
    return d.toLocaleTimeString("en-US", { hour12: false, fractionalSecondDigits: 3 })
  } catch {
    return isoString
  }
}

function JsonBlock({ data }: { data: unknown }) {
  const [expanded, setExpanded] = React.useState(false)
  const json = JSON.stringify(data, null, 2)
  const lines = json.split("\n")
  const isLong = lines.length > 6

  return (
    <div className="mt-1">
      <pre className="text-[10px] font-mono text-emerald-300/80 whitespace-pre-wrap break-all bg-black/30 p-2 border border-white/5">
        {isLong && !expanded ? lines.slice(0, 6).join("\n") + "\n..." : json}
      </pre>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[10px] text-blue-400 hover:text-blue-300 mt-0.5"
        >
          {expanded ? "collapse" : `+${lines.length - 6} more lines`}
        </button>
      )}
    </div>
  )
}

function LogEntry({ entry }: { entry: ConsoleLogEntry }) {
  const [showData, setShowData] = React.useState(false)
  const color = PHASE_COLORS[entry.phase] || "text-gray-400"
  const phaseLabel = PHASE_LABELS[entry.phase] || entry.phase.toUpperCase()

  return (
    <div className="py-2 px-3 hover:bg-white/[0.02] transition-colors group">
      <div className="flex items-start gap-2">
        <span className="text-[10px] font-mono text-gray-500 shrink-0 pt-0.5 w-[72px]">
          {formatTime(entry.timestamp)}
        </span>
        <Badge
          variant="outline"
          className={`text-[9px] font-mono px-1.5 py-0 border-current/30 shrink-0 ${color}`}
        >
          {phaseLabel}
        </Badge>
        <div className="min-w-0 flex-1">
          <p className={`text-[11px] font-medium ${color}`}>{entry.label}</p>
          {entry.detail && (
            <p className="text-[10px] text-gray-400 mt-0.5 break-all">{entry.detail}</p>
          )}
          {entry.durationMs !== undefined && (
            <span className="text-[10px] text-gray-500 font-mono">{entry.durationMs}ms</span>
          )}
        </div>
        {entry.data != null && (
          <button
            onClick={() => setShowData(!showData)}
            className="text-[10px] text-gray-500 hover:text-gray-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {showData ? "hide" : "data"}
          </button>
        )}
      </div>
      {showData && entry.data != null && <JsonBlock data={entry.data} />}
    </div>
  )
}

export function ConsoleLogPanel({ entries }: ConsoleLogPanelProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries.length])

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-gray-300 border-l border-white/10">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 shrink-0">
        <HugeiconsIcon icon={ConsoleIcon} className="h-4 w-4 text-green-400" />
        <span className="text-xs font-semibold text-gray-200">API Console</span>
        <Badge variant="outline" className="text-[9px] border-green-500/30 text-green-400 ml-auto">
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </Badge>
      </div>

      {/* Log entries */}
      <div className="flex-1 min-h-0 overflow-y-auto" ref={scrollRef}>
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <HugeiconsIcon icon={ConsoleIcon} className="h-8 w-8 text-gray-600 mb-3" />
            <p className="text-xs text-gray-500">
              Click Refresh AR Intelligence to see API logging here.
            </p>
            <p className="text-[10px] text-gray-600 mt-1">
              Shows auth, claim inquiries, Claude analysis, and timing.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {entries.map((entry, i) => (
              <LogEntry key={i} entry={entry} />
            ))}
          </div>
        )}
      </div>

      {/* Footer with legend */}
      <div className="px-4 py-2 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-3 text-[9px] text-gray-500 flex-wrap">
          <span className="text-yellow-500/70">AUTH</span>
          <span className="text-cyan-400/70">CLM</span>
          <span className="text-blue-400/70">REQ</span>
          <span className="text-green-400/70">RES</span>
          <span className="text-purple-400/70">AI</span>
          <span className="text-gray-500 ml-auto">hover rows for data</span>
        </div>
      </div>
    </div>
  )
}
