import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

export interface ProfileData {
  id: string
  full_name: string | null
  created_at: string
  updated_at: string
}

export const authService = {
  /**
   * Get current authenticated user on client-side
   */
  async getCurrentUser(): Promise<User | null> {
    const supabase = createBrowserClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null
    return user
  },

  /**
   * Get user profile data from public.profiles
   */
  async getUserProfile(userId: string): Promise<{ profile: ProfileData | null; error: Error | null }> {
    const supabase = createBrowserClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    return {
      profile: data,
      error: error ? new Error(error.message) : null,
    }
  },

  /**
   * Sign out user and clear session
   */
  async signOut(): Promise<{ error: Error | null }> {
    const supabase = createBrowserClient()
    const { error } = await supabase.auth.signOut()
    return { error: error ? new Error(error.message) : null }
  },
}

