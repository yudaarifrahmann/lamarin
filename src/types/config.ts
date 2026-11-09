import { Database } from './database'

export type EmailSettingsRow = Database['public']['Tables']['email_settings']['Row']
export type EmailSettingsInsert = Database['public']['Tables']['email_settings']['Insert']
export type EmailSettingsUpdate = Database['public']['Tables']['email_settings']['Update']

export type EmailTemplateRow = Database['public']['Tables']['email_templates']['Row']
export type EmailTemplateInsert = Database['public']['Tables']['email_templates']['Insert']
export type EmailTemplateUpdate = Database['public']['Tables']['email_templates']['Update']

export interface EmailSendPayload {
  to: string | string[]
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}
