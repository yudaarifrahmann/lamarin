import { NextResponse, type NextRequest } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@/lib/supabase/server'
import { createOAuth2Client } from '@/lib/gmail/oauth'
import { encryptToken } from '@/lib/encryption'

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin
  const redirectTarget = new URL('/konfigurasi-email', request.url)

  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const errorParam = searchParams.get('error')

    // 1. Handle error from Google OAuth Consent screen (e.g. user cancelled)
    if (errorParam) {
      redirectTarget.searchParams.set('error', `google_${errorParam}`)
      return NextResponse.redirect(redirectTarget)
    }

    // 2. Validate presence of code and state
    if (!code || !state) {
      redirectTarget.searchParams.set('error', 'missing_oauth_params')
      return NextResponse.redirect(redirectTarget)
    }

    // 3. CSRF Protection: Validate state against http-only cookie
    const savedState = request.cookies.get('gmail_oauth_state')?.value
    if (!savedState || savedState !== state) {
      redirectTarget.searchParams.set('error', 'invalid_csrf_state')
      return NextResponse.redirect(redirectTarget)
    }

    // 4. Authenticate current user via Supabase SSR
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // 5. Exchange authorization code for tokens
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/gmail/callback`
    const oauth2Client = createOAuth2Client(redirectUri)

    const { tokens } = await oauth2Client.getToken(code)

    if (!tokens) {
      redirectTarget.searchParams.set('error', 'token_exchange_failed')
      return NextResponse.redirect(redirectTarget)
    }

    // 6. Retrieve authorized Gmail address safely via userinfo
    oauth2Client.setCredentials(tokens)
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const { data: userInfo } = await oauth2.userinfo.get()

    const gmailEmail = userInfo.email

    if (!gmailEmail) {
      redirectTarget.searchParams.set('error', 'email_not_found')
      return NextResponse.redirect(redirectTarget)
    }

    // 7. Check for refresh token and encrypt it using AES-256-GCM
    if (tokens.refresh_token) {
      const encryptedRefreshToken = encryptToken(tokens.refresh_token)

      // 8. Upsert connection record into public.gmail_connections
      const { error: dbError } = await supabase
        .from('gmail_connections')
        .upsert(
          {
            user_id: user.id,
            gmail_email: gmailEmail,
            refresh_token_encrypted: encryptedRefreshToken,
            connected_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )

      if (dbError) {
        console.error('Failed to store gmail_connections:', dbError)
        redirectTarget.searchParams.set('error', 'database_save_failed')
        return NextResponse.redirect(redirectTarget)
      }
    } else {
      // If refresh token wasn't re-issued by Google, verify existing connection exists
      const { data: existingConnection } = await supabase
        .from('gmail_connections')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!existingConnection) {
        redirectTarget.searchParams.set('error', 'no_refresh_token')
        return NextResponse.redirect(redirectTarget)
      }

      // Update email and updated_at
      await supabase
        .from('gmail_connections')
        .update({
          gmail_email: gmailEmail,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
    }

    // 9. Clear the CSRF state cookie and redirect with success parameter
    redirectTarget.searchParams.set('success', 'gmail_connected')
    const response = NextResponse.redirect(redirectTarget)
    response.cookies.delete('gmail_oauth_state')

    return response
  } catch (err) {
    if (
      err &&
      typeof err === 'object' &&
      'digest' in err &&
      typeof (err as { digest: string }).digest === 'string' &&
      ((err as { digest: string }).digest.startsWith('NEXT_') ||
        (err as { digest: string }).digest === 'HANGING_PROMISE_REJECTION')
    ) {
      throw err
    }

    console.error('OAuth callback processing error:', err)
    redirectTarget.searchParams.set('error', 'oauth_callback_exception')
    return NextResponse.redirect(redirectTarget)
  }
}
