import { NextResponse } from 'next/server'

// Reports whether sandbox mode can run, without exposing any secret values to
// the client. Sandbox needs the Optum OAuth credentials; on the public mock
// demo these are unset, so the UI uses this to block the sandbox toggle and
// show a "requires API credentials" notice instead of logging probe failures.
export async function GET() {
  const available = Boolean(
    process.env.OPTUM_CLIENT_ID &&
    process.env.OPTUM_CLIENT_SECRET &&
    process.env.OPTUM_AUTH_URL
  )

  return NextResponse.json({ available })
}
