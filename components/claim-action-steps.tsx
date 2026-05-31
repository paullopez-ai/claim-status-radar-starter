interface ActionStep {
  stepNumber: number
  step: string
  estimatedTime: string
}

export function ClaimActionSteps({ steps }: { steps: ActionStep[] }) {
  return (
    <div className="space-y-2">
      {steps.map((step) => (
        <div key={step.stepNumber} className="flex items-start gap-3 py-1">
          <div className="flex items-center justify-center h-6 w-6 shrink-0 border border-brand-secondary/30 text-brand-secondary">
            <span className="font-mono text-xs font-bold">{step.stepNumber}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm">{step.step}</p>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{step.estimatedTime}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
