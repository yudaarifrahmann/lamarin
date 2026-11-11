import { Database } from './database'
import type { TemplateLayoutConfig } from './template-layout'

export type EmailSettingsRow = Database['public']['Tables']['email_settings']['Row']
export type EmailSettingsInsert = Database['public']['Tables']['email_settings']['Insert']
export type EmailSettingsUpdate = Database['public']['Tables']['email_settings']['Update']

export type EmailTemplateRow = Omit<Database['public']['Tables']['email_templates']['Row'], 'layout_config'> & {
  layout_config?: TemplateLayoutConfig | null
}
export type EmailTemplateInsert = Database['public']['Tables']['email_templates']['Insert']
export type EmailTemplateUpdate = Database['public']['Tables']['email_templates']['Update']

export * from './template-layout'

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
