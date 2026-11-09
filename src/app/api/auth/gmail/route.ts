import { NextResponse, type NextRequest } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { generateGoogleAuthUrl, getGoogleOAuthCredentials } from '@/lib/gmail/oauth'

export async function GET(request: NextRequest) {
  try {
    // 1. Verify user authentication via Supabase Auth
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // 2. Check Google OAuth credentials
    const { clientId, clientSecret } = getGoogleOAuthCredentials()
    if (!clientId || !clientSecret) {
      const configUrl = new URL('/konfigurasi-email', request.url)
      configUrl.searchParams.set('error', 'credentials_missing')
      return NextResponse.redirect(configUrl)
    }

    // 3. Generate CSRF state token
    const stateToken = crypto.randomBytes(32).toString('hex')

    // Determine effective redirect URI
    const origin = request.nextUrl.origin
    const defaultRedirectUri = `${origin}/api/auth/gmail/callback`
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || defaultRedirectUri

    // 4. Generate Google authorization consent URL
    const authUrl = generateGoogleAuthUrl(stateToken, redirectUri)

    // 5. Store state in an HTTP-only secure cookie for validation in callback
    const response = NextResponse.redirect(authUrl)
    response.cookies.set('gmail_oauth_state', stateToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 10, // 10 minutes
    })

    return response
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      typeof (error as { digest: string }).digest === 'string' &&
      ((error as { digest: string }).digest.startsWith('NEXT_') ||
        (error as { digest: string }).digest === 'HANGING_PROMISE_REJECTION')
    ) {
      throw error
    }

    console.error('Error initiating Google OAuth flow:', error)
    const errorUrl = new URL('/konfigurasi-email', request.url)
    errorUrl.searchParams.set('error', 'oauth_init_failed')
    return NextResponse.redirect(errorUrl)
  }
}
