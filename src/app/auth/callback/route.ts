import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encryptToken } from '@/lib/encryption'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data?.session && data?.user) {
      const { session, user } = data
      const gmailEmail = user.email

      // 1. If Google returned provider_refresh_token, encrypt via AES-256-GCM and store in gmail_connections
      if (session.provider_refresh_token && gmailEmail) {
        try {
          const encryptedRefreshToken = encryptToken(session.provider_refresh_token)

          await supabase
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
        } catch (encErr) {
          console.error('Failed to encrypt or persist Gmail connection from OAuth:', encErr)
        }
      } else if (gmailEmail) {
        // 2. If provider_refresh_token was omitted by Google on repeated login,
        // safely preserve the existing valid refresh token and never overwrite with null!
        const { data: existingConnection } = await supabase
          .from('gmail_connections')
          .select('id, refresh_token_encrypted')
          .eq('user_id', user.id)
          .maybeSingle()

        if (existingConnection && existingConnection.refresh_token_encrypted) {
          await supabase
            .from('gmail_connections')
            .update({
              gmail_email: gmailEmail,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id)
        }
      }

      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // If code exchange failed or was rejected, return to login with error parameter
  const loginUrl = new URL('/login', requestUrl.origin)
  loginUrl.searchParams.set('error', 'Otentikasi Google gagal. Silakan coba login kembali.')
  return NextResponse.redirect(loginUrl)
}
