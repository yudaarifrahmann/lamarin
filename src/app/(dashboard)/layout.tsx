import * as React from 'react'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import type { ProfileData } from '@/services/auth'

export const instant = false

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await connection()
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect all dashboard routes: redirect unauthenticated users to /login
  if (!user) {
    redirect('/login')
  }

  // Ensure email has been confirmed via OTP
  if (!user.email_confirmed_at) {
    redirect(`/verify-otp?email=${encodeURIComponent(user.email || '')}`)
  }

  // Fetch user profile from public.profiles
  let profile: ProfileData | null = null
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (profileData) {
    profile = profileData as ProfileData
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased">
      {/* Desktop Navigation Sidebar */}
      <Sidebar user={user} profile={profile} />

      {/* Main View Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header user={user} profile={profile} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}
