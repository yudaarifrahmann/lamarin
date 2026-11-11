import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/types/database'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase environment is not configured, do not block the initial dev view
  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl === 'https://your-project-id.supabase.co' ||
    supabaseAnonKey === 'your-supabase-anon-key'
  ) {
    return supabaseResponse
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: getUser() refreshes the auth token and validates it with Supabase Auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isPublicRoute =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/verify-otp' ||
    pathname === '/privacy' ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api/auth')

  // 1. Unauthenticated users trying to access protected routes must be redirected to /login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 2. If user is logged in but hasn't confirmed email yet, restrict access to protected dashboard
  if (user && !user.email_confirmed_at) {
    if (!isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/verify-otp'
      if (user.email) {
        url.searchParams.set('email', user.email)
      }
      return NextResponse.redirect(url)
    }
  }

  // 3. Fully confirmed authenticated users trying to access login or register must be redirected to dashboard root (/)
  if (user && user.email_confirmed_at && (pathname === '/login' || pathname === '/register')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
