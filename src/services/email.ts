import { createGmailClientFromRefreshToken, getGmailClient } from '@/lib/gmail/client'
import { buildMimeMessage, type EmailAttachment } from '@/lib/gmail/mime'

export interface SendEmailPayload {
  from?: string
  senderName?: string
  to: string
  subject: string
  html: string
  attachments?: EmailAttachment[]
  refreshToken?: string
}

export const emailService = {
  /**
   * Send application email directly via Google Gmail API OAuth 2.0 (gmail.send)
   */
  async sendApplicationEmail(payload: SendEmailPayload): Promise<{ id?: string; error: Error | null }> {
    try {
      const gmail = payload.refreshToken
        ? createGmailClientFromRefreshToken(payload.refreshToken)
        : getGmailClient()

      const fromEmail = payload.from || 'me'

      const raw = buildMimeMessage({
        from: fromEmail,
        senderName: payload.senderName,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        attachments: payload.attachments,
      })

      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw,
        },
      })

      if (!response.data.id) {
        return { error: new Error('Google Gmail API tidak mengembalikan ID pesan.') }
      }

      return { id: response.data.id, error: null }
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error('Terjadi kesalahan saat memanggil Google Gmail API'),
      }
    }
  },
}
