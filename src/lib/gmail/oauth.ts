import { google } from 'googleapis'

/**
 * Returns OAuth credentials from environment variables.
 * Supports GOOGLE_CLIENT_ID (recommended) and GMAIL_CLIENT_ID fallback.
 */
export function getGoogleOAuthCredentials() {
  const clientId =
    process.env.GOOGLE_CLIENT_ID || process.env.GMAIL_CLIENT_ID
  const clientSecret =
    process.env.GOOGLE_CLIENT_SECRET || process.env.GMAIL_CLIENT_SECRET
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    (process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/gmail/callback`
      : 'http://localhost:3000/api/auth/gmail/callback')

  return {
    clientId,
    clientSecret,
    redirectUri,
  }
}

/**
 * Creates an unauthenticated Google OAuth2 client with configured credentials
 */
export function createOAuth2Client(customRedirectUri?: string) {
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthCredentials()

  if (!clientId || !clientSecret) {
    throw new Error(
      'Kredensial Google OAuth 2.0 belum lengkap. Pastikan GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET telah diatur di environment variables.'
    )
  }

  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    customRedirectUri || redirectUri
  )
}

/**
 * Generates Google OAuth consent screen authorization URL
 */
export function generateGoogleAuthUrl(state: string, customRedirectUri?: string): string {
  const oauth2Client = createOAuth2Client(customRedirectUri)

  const scopes = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.email',
  ]

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // Forces refresh_token issuance
    scope: scopes,
    state,
  })
}

