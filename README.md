# Claim Status Radar

## Professional Context and IP Notice

This prototype is a reference design built to demonstrate the type of
work I do as an AI architect in healthcare and enterprise contexts. It
does not contain proprietary information, client data, trade secrets,
internal systems knowledge, or confidential materials from any current
or former employer or their clients. All data is synthetic, all
architecture patterns are based on publicly available technologies and
standards, and all code was written independently on personal equipment
outside of employment obligations.

The scenarios and domain context (prior authorization, denial
management, payer operations) reflect publicly understood healthcare
industry problems, not any specific client engagement or internal system.

---

> **Live demo:** https://claim-status-radar-starter.vercel.app/
> To see a live working demo, contact me.

AR Intelligence Feed for medical practice billing teams. Third POC in the Optum Real API series, following Eligibility Explorer (POC 7) and Patient Cost Clarity (POC 4).

**Stack:** Next.js, TypeScript, Tailwind v4, shadcn/ui, Anthropic Claude, Optum Real API

---

## What This App Does

This is a dashboard that simulates a small medical practice's accounts receivable workflow. It takes 8 synthetic outstanding claims across 6 different payers (UnitedHealthcare, Cigna, Aetna, BCBS, Humana, Medicare), queries the Optum Real Claim Inquiry API for each claim's current status in parallel, and then sends all 8 responses to Claude for AI-powered analysis.

Claude produces two things simultaneously:

1. **Per-claim action recommendations** for each of the 8 claims (what to do, by when, with numbered steps)
2. **A macro AR intelligence summary** across all claims (what the billing team needs to do today, an honest practice health assessment, and one non-obvious insight)

The key demo narrative: a billing coordinator spends 30-40% of their time logging into payer portals one at a time to check claim statuses. This app checks all 8 claims in parallel in ~320ms, runs Claude analysis in ~1.8s, and delivers prioritized action recommendations. Total: 2.1 seconds vs. 40+ minutes of manual portal work.

---

## The 8 Claims (Mock Data)

The mock dataset tells a complete AR story. These are the patients and scenarios:

| # | Patient | Payer | Billed | Scenario | Priority | Days Out |
|---|---------|-------|--------|----------|----------|----------|
| 1 | Marcus Williams | UnitedHealthcare | $285 | Processing on schedule | ON_TRACK | 12 |
| 2 | Sofia Hernandez | Cigna | $195 | Payment pending (EFT in transit) | ON_TRACK | 27 |
| 3 | James Okafor | BCBS of Texas | $18,500 | Payer requesting operative report | ACTION_REQUIRED | 22 |
| 4 | Patricia Chen | Aetna | $220 | Denied: missing modifier (CARC 4) | ACTION_REQUIRED | 35 |
| 5 | Robert Yamamoto | Humana | $3,200 | Denied: medical necessity (CARC 50) | ACTION_REQUIRED | 40 |
| 6 | Dorothy Washington | Cigna | $425 | **Timely filing at risk: 8 days left** | **URGENT** | **82** |
| 7 | Linda Patel | Medicare/BCBS Medigap | $165 | Secondary claim pending crossover | MONITOR | 15 |
| 8 | Kevin O'Brien | UnitedHealthcare | $2,850 | Appeal in progress (30-day review) | MONITOR | 55 |

**Total billed outstanding:** ~$25,840
**Estimated collectable:** ~$19,200 (accounting for denial write-offs and appeal probability)

Dorothy Washington is the star of the demo. Her Cigna claim has only 8 days left in the 90-day timely filing window. She always sorts to the top. When you expand her row, Claude flags it as URGENT with a "call Cigna today" action step. This is the moment in the demo where executives lean forward.

---

## How It Works Under the Hood

### Data Flow

```
Page loads --> loadMockFeedData() populates dashboard immediately (no blank state)
                                         |
User clicks "Refresh AR Intelligence" -->|
                                         v
POST /api/optum/claim-status  { mode: "mock" | "sandbox" }
    |
    +--> [Mock mode]  Simulated 2.1s delay, return fixture data
    |
    +--> [Sandbox mode]
           1. OAuth2 token (cached 1 hour) via Optum auth endpoint
           2. Promise.all() -- 8 parallel GraphQL claim inquiries
           3. Sandbox probes: OAuth, GraphQL endpoint, Claude API
           4. Return fixture data + diagnostic narrative
    |
    +--> [Production mode -- future]
           1. OAuth2 token
           2. Promise.all() -- 8 parallel claim inquiries
           3. Claude AR analysis on real responses
           4. Return ClaimStatusFeedResult
```

### The Dashboard Loads Instantly

Unlike a typical app that starts blank and fetches data, this dashboard is populated the moment the page loads. `loadMockFeedData()` runs synchronously on mount and fills the entire dashboard with the 8-claim dataset, AR stats, and Claude analysis. This matters for demos because you never start from a blank screen.

The "Refresh AR Intelligence" button triggers the actual API call cycle through the route handler.

### Mock vs Sandbox Modes

There's a toggle button in the header (next to the Refresh button and theme toggle) that switches between Mock and Sandbox at runtime. No restart needed.

- **Mock:** All data comes from fixture files. No API calls. 2.1-second simulated delay on refresh. This is the demo mode.
- **Sandbox:** Runs real API probes against Optum's sandbox endpoint. The Developer Console (purple collapsible panel) shows diagnostic logs: OAuth token acquisition, GraphQL endpoint connectivity, and Claude API health. The dashboard still shows fixture claim data because Optum's sandbox only provides Eligibility API access, not Claim Status.

The mode toggle sends the selected mode to the API route in the POST body, so the server knows which path to take.

### The Claude Layer

The Claude AR Analyzer (`lib/claude-ar-analyzer.ts`) sends all 8 claim inquiry responses plus practice context to Claude Sonnet with a detailed system prompt. The system prompt includes:

- Priority assignment rules (URGENT / ACTION_REQUIRED / MONITOR / ON_TRACK)
- X12 status code interpretation (A1, F1, F3, R0, etc.)
- Timely filing rules (<=14 days = always URGENT)
- Denial management rules (CARC-specific resubmission vs. appeal guidance)
- Macro summary rules (name specific claim IDs, honest assessments, non-obvious insights)

Claude returns a structured JSON response with per-claim actions and a macro AR summary. Temperature is 0 for deterministic output. If Claude fails, the dashboard still renders with raw claim data.

### Login Gate

There's a simple login page that appears before the dashboard. Credentials are checked against `AUTH_USERNAME` and `AUTH_PASSWORD` environment variables via a server-side API route (`/api/auth/login`). No session persistence. Page refresh requires re-login. This is a UI gate, not real authentication.

---

## Running Locally

```bash
bun install
bun dev
```

Open http://localhost:3000. Mock mode loads with no login. Sandbox mode shows a login page using the credentials you set in `.env.local`.

### Required Environment Variables

Copy `.env.example` and fill in your values:

```bash
# Login credentials — choose your own (only used in sandbox mode)
AUTH_USERNAME=
AUTH_PASSWORD=

# App mode (mock or sandbox -- toggle also available in UI)
NEXT_PUBLIC_APP_ENV=mock

# Optum API (only needed for sandbox mode)
OPTUM_CLIENT_ID=
OPTUM_CLIENT_SECRET=
OPTUM_AUTH_URL=
OPTUM_ELIGIBILITY_URL=
OPTUM_PROVIDER_TAX_ID=

# Claude API (only needed for sandbox mode probes and production)
ANTHROPIC_API_KEY=
```

In mock mode, the only env var you need is `NEXT_PUBLIC_APP_ENV=mock`. Everything else can be blank, and there is no login.

---

## Getting Optum API Access

This project runs fully in **mock mode** with no credentials — nothing to configure. To call the real Optum APIs (sandbox or production), register for Optum developer access:

1. Sign up at the **Optum Developer Marketplace**: https://marketplace.optum.com
2. Create an application and subscribe to the relevant API for **sandbox** access.
3. Optum issues your `OPTUM_CLIENT_ID`, `OPTUM_CLIENT_SECRET`, the token/API URLs, and your provider tax ID.
4. Copy those into `.env.local` (see `.env.example`) and set your own login credentials — **this repository ships none**.

---

## Deploying to Vercel

1. Connect the GitHub repo in Vercel dashboard
2. Set all env vars from `.env.example` in Vercel's Environment Variables settings
3. Deploy. Framework is auto-detected as Next.js.

No special build configuration needed. The `next.config.ts` is clean (no `__dirname` or Node-specific APIs).

---

## The Demo Script (3 Minutes)

This is the walkthrough for executive audiences:

| Time | What to Show |
|------|--------------|
| 0:00-0:30 | Page loads in dark mode. Dashboard is already populated. Point to the AR Stats Bar: 1 URGENT, 3 ACTION_REQUIRED, 2 MONITOR, 2 ON_TRACK. "$25,840 outstanding." |
| 0:30-1:00 | 8 claims sorted by priority. Dorothy Washington at the top (URGENT, 82 days). Point to the macro AR summary: "Top 3 actions today" with specific claim IDs. |
| 1:00-1:30 | Click Dorothy Washington to expand. Action Recommendation tab (purple border) shows URGENT priority, "Call Cigna today," timely filing countdown: "8 days remain." This is the money moment. |
| 1:30-2:00 | Collapse. Point to macro summary: practice health assessment, estimated collectable, the AI insight (pattern across denials suggesting a coding audit). |
| 2:00-2:30 | Sort by days outstanding. Filter to URGENT only (one claim). Filter to ACTION_REQUIRED (three claims). Reset. |
| 2:30-3:00 | Expand any claim's Raw Response tab (Geist Mono JSON). Point to timing badges at bottom: "8 claims in parallel: 320ms. Claude analysis: 1.8s." Compare to 40 minutes of manual portal checking. |

**Key talking points:**
- "A billing coordinator spends 30-40% of their time checking claim status across payer portals. This does it in 2 seconds."
- "It doesn't just tell you the status. It tells you what to do today, in priority order, with deadlines."
- "The AI insight at the bottom catches patterns across claims that no individual claim review would surface."

---

## Project Structure

```
app/
  page.tsx                    Main dashboard (client component, manages all state)
  layout.tsx                  Root layout, fonts, ThemeProvider
  globals.css                 Tailwind v4, OKLCH brand tokens, sharp corners
  api/
    auth/login/route.ts       Login credential check (server-side)
    optum/claim-status/route.ts  Main API: parallel claims + Claude analysis

components/
  login-form.tsx              Login page UI
  mode-toggle.tsx             Mock/Sandbox runtime switcher
  mock-mode-banner.tsx        Amber banner (mock mode only)
  sandbox-mode-banner.tsx     Purple banner (sandbox mode only)
  sandbox-dev-console.tsx     API diagnostic logs (sandbox only)
  sandbox-disclosure.tsx      Footer with mode disclosure
  ar-stats-bar.tsx            4 summary count cards (URGENT pulses amber)
  ar-summary-panel.tsx        Top 3 actions, practice health, AI insight
  claim-feed-controls.tsx     Sort/filter controls
  claim-feed-table.tsx        Main claims table
  claim-row.tsx               Row container (collapsed/expanded)
  claim-row-collapsed.tsx     One-line claim summary with badges
  claim-row-expanded.tsx      Tabs: Action / Detail / Raw Response
  claim-action-tab.tsx        Claude's per-claim recommendation (purple)
  claim-action-steps.tsx      Numbered action steps with time estimates
  claim-risk-assessment.tsx   Timely filing / denial / appeal risk flags
  claim-detail-tab.tsx        Structured claim data, service lines
  claim-raw-response-tab.tsx  Raw JSON in Geist Mono
  claim-priority-badge.tsx    URGENT / ACTION_REQUIRED / MONITOR / ON_TRACK
  claim-status-badge.tsx      X12 status code with tooltip explanation
  claim-age-indicator.tsx     Days outstanding (amber at 60+)
  timely-filing-countdown.tsx Amber countdown badge (pulses when URGENT)
  loading-overlay.tsx         Two-phase loading animation
  timing-badges.tsx           Parallel + Claude timing display
  refresh-button.tsx          "Refresh AR Intelligence" button
  theme-toggle.tsx            Light/dark mode
  theme-provider.tsx          next-themes wrapper
  error-claim-row.tsx         Error state for failed claim inquiries
  ui/                         shadcn/ui primitives

lib/
  config.ts                   APP_MODE, IS_MOCK, IS_SANDBOX exports
  claims.ts                   8 SyntheticClaim objects (the dataset)
  claim-utils.ts              Sort, filter, age calculation helpers
  optum-auth.ts               OAuth2 token exchange with 1-hour cache
  optum-claim-inquiry.ts      GraphQL claim inquiry wrapper
  claude-ar-analyzer.ts       Claude API call with AR system prompt
  sandbox-narrator.ts         Diagnostic log collector for sandbox mode
  utils.ts                    cn() class merge helper
  mock/
    claim-inquiry-fixtures.ts 8 mock ClaimInquiryResponse objects
    claude-fixtures.ts        Complete ClaudeARAnalysis with all 8 claims
    mock-loader.ts            Synchronous loadMockFeedData() for instant load

types/
  claim.types.ts              SyntheticClaim, scenarios, priorities, filters
  optum.types.ts              ClaimInquiryResponse, FeedResult, GraphQL types
  claude.types.ts             ClaudeClaimAction, ARSummary, ARAnalysis
  sandbox.types.ts            SandboxNarrative, log levels
```

---

## Design System

| Element | Choice |
|---------|--------|
| Blue (`--primary`) | All Optum/claim data, status badges |
| Purple (`--brand-secondary`) | Everything Claude produces: actions, summaries, priorities |
| Amber (`--brand`) | Urgent flags, timely filing warnings, denials, 60+ day aging |
| Fonts | Playfair Display (headings), Raleway (body), Geist Mono (data/codes) |
| Corners | Sharp everywhere (`--radius: 0`) |
| Icons | Hugeicons (never Lucide) |
| Themes | Dark + Light via next-themes |

---

## Sandbox Behavior

The Optum sandbox only provides the Eligibility API. Claim Status is a separate production subscription. When running in Sandbox mode:

- OAuth2 token acquisition works normally
- GraphQL endpoint returns "FieldUndefined" errors for claim inquiry queries (this is expected and correct: the endpoint is live, it just doesn't have a claim inquiry schema)
- The Developer Console logs all of this with timestamps and explanations
- The dashboard still renders fixture claim data so the UI is always populated
- Claude API probe confirms key validity

The sandbox proves connectivity and authentication work. The fixture data proves the dashboard works. Together they validate the full pipeline without requiring a production Claim Status API subscription.

---

## AI Layer Architecture

The Claude AR analyzer (`lib/claude-ar-analyzer.ts`) contains the core billing intelligence: prioritization rules, X12 status code interpretation, timely filing risk assessment, and macro AR summary generation. This logic is designed to be modular and extractable from the dashboard UI and Optum integration layer.

---

*Next.js 16, Bun, TypeScript, Tailwind v4, shadcn/ui, Hugeicons, Framer Motion*
*Optum Real Claim Inquiry API (GraphQL), Anthropic Claude Sonnet*
