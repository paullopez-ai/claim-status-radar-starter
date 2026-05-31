let cachedToken: string | null = null
let tokenExpiry: number = 0

export async function getOptumBearerToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken

  const clientId = process.env.OPTUM_CLIENT_ID
  const clientSecret = process.env.OPTUM_CLIENT_SECRET
  const authUrl = process.env.OPTUM_AUTH_URL

  if (!clientId || !clientSecret || !authUrl) {
    throw new Error('Missing Optum API credentials. Set OPTUM_CLIENT_ID, OPTUM_CLIENT_SECRET, and OPTUM_AUTH_URL.')
  }

  const response = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!response.ok) {
    throw new Error(`Optum auth failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const responseToken = data.access_token as string

  if (!responseToken) {
    throw new Error('Optum auth response missing access_token')
  }

  cachedToken = responseToken
  tokenExpiry = Date.now() + (3600 * 1000) - (60 * 1000) // 1 hour minus 60s safety buffer
  return cachedToken
}
