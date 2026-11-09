'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createGmailClientFromRefreshToken } from '@/lib/gmail/client'
import { buildMimeMessage, type EmailAttachment } from '@/lib/gmail/mime'
import { decryptToken } from '@/lib/encryption'
import { replacePlaceholders } from '@/lib/placeholders'
import type { ActionResponse } from '@/app/actions/documents'

const STORAGE_BUCKET = 'application-documents'
const MAX_TOTAL_ATTACHMENT_SIZE = 25 * 1024 * 1024 // 25MB total limit for Gmail API

export interface SendApplicationPayload {
  recipient_email: string
  company_name: string
  subject?: string
  message?: string
  selected_document_ids: string[]
}

export interface SendApplicationResult {
  logId: string
  resendId: string // Maintained as identifier field for backwards compatibility
  messageId: string
}

/**
 * Convert plain text message to clean, professional responsive HTML email
 */
function formatEmailHtml(message: string): string {
  const sanitized = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background-color: #f9f9fb;
      margin: 0;
      padding: 24px;
    }
    .container {
      max-width: 640px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 32px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .content {
      font-size: 15px;
      color: #1f2937;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #f3f4f6;
      font-size: 12px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">${sanitized}</div>
    <div class="footer">
      Email ini dikirimkan secara langsung melalui akun Gmail pelamar.
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Server Action: Process and send job application email via Google Gmail API (OAuth 2.0)
 */
export async function sendApplicationAction(
  payload: SendApplicationPayload
): Promise<ActionResponse<SendApplicationResult>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Sesi login telah berakhir. Silakan login kembali.' }
    }

    // 1. Fetch user's Gmail connection from public.gmail_connections
    const { data: gmailConn, error: connError } = await supabase
      .from('gmail_connections')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (connError || !gmailConn) {
      return {
        success: false,
        error:
          'Akun Gmail belum terhubung. Silakan hubungkan akun Gmail pribadi Anda di menu Konfigurasi Email sebelum mengirim lamaran.',
      }
    }

    // 2. Decrypt refresh token securely on the server
    let refreshToken: string
    try {
      refreshToken = decryptToken(gmailConn.refresh_token_encrypted)
      if (!refreshToken) {
        throw new Error('Token otorisasi kosong.')
      }
    } catch {
      return {
        success: false,
        error:
          'Gagal mendekripsi token otorisasi Gmail. Silakan hubungkan ulang akun Gmail Anda di menu Konfigurasi Email.',
      }
    }

    // 3. Create authenticated Gmail client using user's refresh token
    let gmailClient
    try {
      gmailClient = createGmailClientFromRefreshToken(refreshToken)
    } catch (clientErr) {
      return {
        success: false,
        error:
          clientErr instanceof Error
            ? clientErr.message
            : 'Gagal menginisialisasi klien Google Gmail API.',
      }
    }

    // 4. Validate recipient email
    const recipientEmail = payload.recipient_email?.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!recipientEmail || !emailRegex.test(recipientEmail)) {
      return { success: false, error: 'Alamat email penerima tidak valid.' }
    }

    // 5. Validate company name
    const companyName = payload.company_name?.trim()
    if (!companyName) {
      return { success: false, error: 'Nama perusahaan wajib diisi.' }
    }

    // 6. Fetch user email_settings & default template from Supabase
    const { data: emailSettings } = await supabase
      .from('email_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    const { data: defaultTemplate } = await supabase
      .from('email_templates')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_default', true)
      .maybeSingle()

    const senderName =
      emailSettings?.sender_name ||
      user.user_metadata?.full_name ||
      'Pelamar Kerja'

    // Authorized Gmail address from user's verified gmail_connections record
    const senderEmail = gmailConn.gmail_email

    // 7. Resolve Subject (Manual -> Default Template -> Email Settings -> Fallback)
    const rawSubject =
      payload.subject?.trim() ||
      defaultTemplate?.subject ||
      emailSettings?.default_subject ||
      'Lamaran Pekerjaan - {sender_name} - {company_name}'

    const resolvedSubject = replacePlaceholders(rawSubject, {
      company_name: companyName,
      sender_name: senderName,
    })

    // 8. Resolve Message Body
    const rawMessage =
      payload.message?.trim() ||
      defaultTemplate?.message ||
      emailSettings?.default_message

    if (!rawMessage) {
      return {
        success: false,
        error:
          'Isi pesan lamaran masih kosong. Harap isi pesan manual atau atur pesan default di menu Konfigurasi Email.',
      }
    }

    const resolvedMessage = replacePlaceholders(rawMessage, {
      company_name: companyName,
      sender_name: senderName,
    })

    // 9. Verify and Download Selected Documents from private Supabase Storage
    const selectedDocIds = payload.selected_document_ids || []
    interface VerifiedDoc {
      id: string
      document_name: string
      original_filename: string
      file_size: number
      mime_type: string
      buffer: Buffer
    }
    const verifiedAttachments: VerifiedDoc[] = []
    let totalAttachmentSize = 0

    if (selectedDocIds.length > 0) {
      const { data: userDocs, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .in('id', selectedDocIds)
        .eq('user_id', user.id)

      if (docsError || !userDocs || userDocs.length !== selectedDocIds.length) {
        return {
          success: false,
          error:
            'Verifikasi dokumen gagal. Pastikan dokumen yang dipilih masih tersedia di akun Anda.',
        }
      }

      for (const doc of userDocs) {
        totalAttachmentSize += doc.file_size || 0

        // Security check: storage_path must strictly belong to current user
        if (!doc.storage_path.startsWith(`${user.id}/`)) {
          return { success: false, error: `Akses dokumen tidak sah: ${doc.document_name}` }
        }

        // Download file binary directly from private Supabase Storage
        const { data: fileData, error: downloadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .download(doc.storage_path)

        if (downloadError || !fileData) {
          return {
            success: false,
            error: `Gagal mengunduh berkas "${doc.document_name}" dari storage: ${downloadError?.message}`,
          }
        }

        const arrayBuffer = await fileData.arrayBuffer()
        verifiedAttachments.push({
          id: doc.id,
          document_name: doc.document_name,
          original_filename: doc.original_filename,
          file_size: doc.file_size,
          mime_type: doc.mime_type || 'application/pdf',
          buffer: Buffer.from(arrayBuffer),
        })
      }

      // Check total attachment size against 25MB limit
      if (totalAttachmentSize > MAX_TOTAL_ATTACHMENT_SIZE) {
        return {
          success: false,
          error: `Ukuran total lampiran (${(totalAttachmentSize / (1024 * 1024)).toFixed(1)} MB) melebihi batas maksimal 25 MB layanan email.`,
        }
      }
    }

    // 10. Snapshot documents data for persistent audit trail in email_logs
    const documentsSnapshot = verifiedAttachments.map((doc) => ({
      id: doc.id,
      document_name: doc.document_name,
      original_filename: doc.original_filename,
      file_size: doc.file_size,
    }))

    // 11. Create initial queued entry in email_logs (Prevents double submission and tracks process)
    const { data: logEntry, error: logInsertError } = await supabase
      .from('email_logs')
      .insert({
        user_id: user.id,
        recipient_email: recipientEmail,
        company_name: companyName,
        subject: resolvedSubject,
        message: resolvedMessage,
        selected_documents: documentsSnapshot,
        status: 'queued',
      })
      .select()
      .single()

    if (logInsertError || !logEntry) {
      return {
        success: false,
        error: `Gagal membuat log pengiriman di database: ${logInsertError?.message}`,
      }
    }

    // 12. Build RFC 2822 / RFC 2045 compliant MIME message
    const gmailAttachments: EmailAttachment[] = verifiedAttachments.map((att) => ({
      filename: att.original_filename,
      content: att.buffer,
      contentType: att.mime_type,
    }))

    const rawMime = buildMimeMessage({
      from: senderEmail,
      senderName,
      to: recipientEmail,
      subject: resolvedSubject,
      html: formatEmailHtml(resolvedMessage),
      attachments: gmailAttachments,
    })

    // 13. Send Email via Google Gmail API (gmail.users.messages.send)
    try {
      const response = await gmailClient.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: rawMime,
        },
      })

      const messageId = response.data.id

      if (!messageId) {
        throw new Error('Google Gmail API tidak mengembalikan ID pesan.')
      }

      // 14. Update log status to 'sent'
      await supabase
        .from('email_logs')
        .update({
          status: 'sent',
          resend_message_id: messageId,
          sent_at: new Date().toISOString(),
          error_message: null,
        })
        .eq('id', logEntry.id)

      revalidatePath('/riwayat-lamaran')
      revalidatePath('/')

      return {
        success: true,
        data: {
          logId: logEntry.id,
          resendId: messageId,
          messageId: messageId,
        },
      }
    } catch (sendErr) {
      let errorMsg = 'Kesalahan saat mengirim email melalui Google Gmail API.'

      if (sendErr instanceof Error) {
        if (
          sendErr.message.includes('invalid_grant') ||
          sendErr.message.includes('Token has been expired or revoked')
        ) {
          errorMsg =
            'Izin akun Gmail telah kedaluwarsa atau dicabut oleh pengguna. Silakan buka menu Konfigurasi Email lalu klik Hubungkan Ulang Akun Gmail.'
        } else {
          errorMsg = sendErr.message
        }
      }

      // Mark log status as 'failed' in database
      await supabase
        .from('email_logs')
        .update({
          status: 'failed',
          error_message: errorMsg,
        })
        .eq('id', logEntry.id)

      return { success: false, error: errorMsg }
    }
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : 'Terjadi kesalahan sistem yang tidak diketahui.',
    }
  }
}
