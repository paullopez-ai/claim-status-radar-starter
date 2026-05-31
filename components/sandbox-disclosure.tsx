interface SandboxDisclosureProps {
  mode: "mock" | "sandbox"
}

export function SandboxDisclosure({ mode }: SandboxDisclosureProps) {
  const modeText = mode === "mock"
    ? "This application is running in mock mode with fully simulated data. No API calls are made."
    : "Sandbox mode: Optum sandbox provides Eligibility API only — Claim Status is a separate production subscription. Dashboard shows fixture data while the developer console verifies OAuth, endpoint connectivity, and Claude API access. No real patient data."

  return (
    <footer className="border-t border-border bg-muted/30 px-4 py-3 text-center text-xs text-muted-foreground font-sans">
      <p>
        {modeText}
        {" "}Created by Paul Lopez for educational purposes.
      </p>
    </footer>
  )
}
