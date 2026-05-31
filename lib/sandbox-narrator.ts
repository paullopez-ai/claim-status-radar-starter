import type { SandboxLogEntry, SandboxLogLevel, SandboxNarrative } from '@/types/sandbox.types'

export class SandboxNarrator {
  private logs: SandboxLogEntry[] = []
  private startTime: number
  private startedAt: string

  constructor() {
    this.startTime = Date.now()
    this.startedAt = new Date().toISOString()
  }

  log(step: string, level: SandboxLogLevel, message: string) {
    this.logs.push({
      offsetMs: Date.now() - this.startTime,
      step,
      level,
      message,
    })
  }

  finish(): SandboxNarrative {
    const completedAt = new Date().toISOString()
    return {
      logs: this.logs,
      startedAt: this.startedAt,
      completedAt,
      totalMs: Date.now() - this.startTime,
    }
  }
}
