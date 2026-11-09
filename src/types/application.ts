import { Database } from './database'

export type EmailLogRow = Database['public']['Tables']['email_logs']['Row']
export type EmailLogInsert = Database['public']['Tables']['email_logs']['Insert']
export type EmailLogUpdate = Database['public']['Tables']['email_logs']['Update']

export type EmailLogStatus = EmailLogRow['status']

export interface EmailLogFilter {
  status?: EmailLogStatus
  search?: string
  startDate?: string
  endDate?: string
}

export interface ApplicationStats {
  total: number
  sent: number
  queued: number
  delivered: number
  failed: number
}
