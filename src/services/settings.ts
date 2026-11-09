import { createClient } from '@/lib/supabase/client'
import type {
  EmailSettingsRow,
  EmailSettingsInsert,
  EmailTemplateRow,
  EmailTemplateInsert,
} from '@/types/config'

export const settingsService = {
  /**
   * Get user's email configuration for currently authenticated user
   */
  async getEmailSettings(): Promise<{ data: EmailSettingsRow | null; error: Error | null }> {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { data: null, error: new Error('Pengguna belum terautentikasi.') }
    }

    const { data, error } = await supabase
      .from('email_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    return { data, error: error ? new Error(error.message) : null }
  },

  /**
   * Save or update email settings for authenticated user
   */
  async upsertEmailSettings(
    payload: Omit<EmailSettingsInsert, 'user_id'>
  ): Promise<{ data: EmailSettingsRow | null; error: Error | null }> {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { data: null, error: new Error('Pengguna belum terautentikasi.') }
    }

    const { data, error } = await supabase
      .from('email_settings')
      .upsert(
        {
          ...payload,
          user_id: user.id,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    return { data, error: error ? new Error(error.message) : null }
  },

  /**
   * Get all email templates for authenticated user
   */
  async getTemplates(): Promise<{ data: EmailTemplateRow[] | null; error: Error | null }> {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { data: null, error: new Error('Pengguna belum terautentikasi.') }
    }

    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    return { data, error: error ? new Error(error.message) : null }
  },

  /**
   * Create email template for authenticated user
   */
  async createTemplate(
    payload: Omit<EmailTemplateInsert, 'user_id'>
  ): Promise<{ data: EmailTemplateRow | null; error: Error | null }> {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { data: null, error: new Error('Pengguna belum terautentikasi.') }
    }

    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        ...payload,
        user_id: user.id,
      })
      .select()
      .single()

    return { data, error: error ? new Error(error.message) : null }
  },
}
