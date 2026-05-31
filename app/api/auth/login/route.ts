import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    const validUsername = process.env.AUTH_USERNAME
    const validPassword = process.env.AUTH_PASSWORD

    if (!validUsername || !validPassword) {
      return NextResponse.json(
        { error: 'Authentication not configured. Set AUTH_USERNAME and AUTH_PASSWORD env vars.' },
        { status: 500 }
      )
    }

    if (username === validUsername && password === validPassword) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Invalid username or password' },
      { status: 401 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
