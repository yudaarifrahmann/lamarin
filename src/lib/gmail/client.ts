import { google } from 'googleapis'
import { getGoogleOAuthCredentials } from '@/lib/gmail/oauth'

/**
 * Check whether Google OAuth application credentials (Client ID & Secret) are configured
 */
export function isGoogleOAuthAppConfigured(): boolean {
  const { clientId, clientSecret } = getGoogleOAuthCredentials()
  return Boolean(clientId && clientSecret)
}

/**
 * Creates an authenticated Gmail API v1 client from a decrypted user refresh token
 */
export function createGmailClientFromRefreshToken(refreshToken: string) {
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthCredentials()

  if (!clientId || !clientSecret) {
    throw new Error(
      'Kredensial Google OAuth 2.0 (GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET) belum dikonfigurasi di server.'
    )
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  )

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  })

  return google.gmail({ version: 'v1', auth: oauth2Client })
}

/**
 * Fallback static Gmail client for backward compatibility if GMAIL_REFRESH_TOKEN env is provided
 */
export function getGmailClient() {
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthCredentials()
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Kredensial Gmail API belum lengkap. Pastikan akun Gmail telah terhubung atau GMAIL_REFRESH_TOKEN diatur.'
    )
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  )

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  })

  return google.gmail({ version: 'v1', auth: oauth2Client })
}
