import { createClient } from '@/lib/supabase/client'
import type {
  EmailLogRow,
  EmailLogInsert,
  EmailLogUpdate,
  ApplicationStats,
  EmailLogFilter,
} from '@/types/application'

export const applicationService = {
  /**
   * Fetch applications (email logs) for the current authenticated user
   */
  async getApplications(filter?: EmailLogFilter): Promise<{ data: EmailLogRow[] | null; error: Error | null }> {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { data: null, error: new Error('Pengguna belum terautentikasi.') }
    }

    let query = supabase
      .from('email_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (filter?.status) {
      query = query.eq('status', filter.status)
    }

    if (filter?.search) {
      query = query.or(
        `company_name.ilike.%${filter.search}%,subject.ilike.%${filter.search}%`
      )
    }

    const { data, error } = await query
    return { data, error: error ? new Error(error.message) : null }
  },

  /**
   * Fetch aggregated statistics for current authenticated user
   */
  async getStats(): Promise<{ stats: ApplicationStats; error: Error | null }> {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    const stats: ApplicationStats = {
      total: 0,
      sent: 0,
      queued: 0,
      delivered: 0,
      failed: 0,
      pendingOutcome: 0,
      acceptedOutcome: 0,
      rejectedOutcome: 0,
    }

    if (userError || !user) {
      return { stats, error: new Error('Pengguna belum terautentikasi.') }
    }

    const { data, error } = await supabase
      .from('email_logs')
      .select('status, application_status')
      .eq('user_id', user.id)

    if (error || !data) {
      return { stats, error: error ? new Error(error.message) : null }
    }

    stats.total = data.length
    data.forEach((log) => {
      if (log.status === 'sent') stats.sent += 1
      if (log.status === 'queued') stats.queued += 1
      if (log.status === 'delivered') stats.delivered += 1
      if (log.status === 'failed') stats.failed += 1

      const outcome = log.application_status || 'pending'
      if (outcome === 'accepted') stats.acceptedOutcome = (stats.acceptedOutcome || 0) + 1
      else if (outcome === 'rejected') stats.rejectedOutcome = (stats.rejectedOutcome || 0) + 1
      else stats.pendingOutcome = (stats.pendingOutcome || 0) + 1
    })

    return { stats, error: null }
  },

  /**
   * Create a new email log entry bound to the current user
   */
  async createApplication(
    payload: Omit<EmailLogInsert, 'user_id'>
  ): Promise<{ data: EmailLogRow | null; error: Error | null }> {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { data: null, error: new Error('Pengguna belum terautentikasi.') }
    }

    const { data, error } = await supabase
      .from('email_logs')
      .insert({
        ...payload,
        user_id: user.id,
      })
      .select()
      .single()

    return { data, error: error ? new Error(error.message) : null }
  },

  /**
   * Update email log status or details
   */
  async updateApplication(
    id: string,
    payload: EmailLogUpdate
  ): Promise<{ data: EmailLogRow | null; error: Error | null }> {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { data: null, error: new Error('Pengguna belum terautentikasi.') }
    }

    const { data, error } = await supabase
      .from('email_logs')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    return { data, error: error ? new Error(error.message) : null }
  },
}
