export interface EmailAttachment {
  filename: string
  content: Buffer
  contentType?: string
}

export interface CreateMimeMessageOptions {
  from: string
  senderName?: string
  to: string
  subject: string
  html: string
  attachments?: EmailAttachment[]
}

/**
 * Encode a string to RFC 2047 Base64 encoded-word format for email headers
 */
function encodeHeaderValue(value: string): string {
  // If ASCII only without special characters, return as-is
  if (/^[\x20-\x7E]+$/.test(value) && !value.includes('"')) {
    return value
  }
  return `=?utf-8?B?${Buffer.from(value, 'utf-8').toString('base64')}?=`
}

/**
 * Format base64 string into 76-character lines according to RFC 2045
 */
function chunkBase64(base64Str: string): string {
  const chunks = base64Str.match(/.{1,76}/g)
  return chunks ? chunks.join('\r\n') : base64Str
}

/**
 * Construct an RFC 2822 / RFC 2045 compliant MIME message string for Gmail API
 */
export function buildMimeMessage(options: CreateMimeMessageOptions): string {
  const boundary = `====boundary_${Date.now()}_${Math.random().toString(36).substring(2, 10)}====`
  
  // Format From header
  let fromHeader = options.from
  if (options.senderName) {
    const encodedName = encodeHeaderValue(options.senderName)
    fromHeader = `"${encodedName}" <${options.from}>`
  }

  // Format Subject header
  const subjectHeader = encodeHeaderValue(options.subject)

  const headers: string[] = [
    `From: ${fromHeader}`,
    `To: ${options.to}`,
    `Subject: ${subjectHeader}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
  ]

  const parts: string[] = []

  // 1. HTML Body part
  const htmlBase64 = chunkBase64(Buffer.from(options.html, 'utf-8').toString('base64'))
  parts.push(
    [
      `--${boundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      'Content-Transfer-Encoding: base64',
      '',
      htmlBase64,
      '',
    ].join('\r\n')
  )

  // 2. Attachments parts
  if (options.attachments && options.attachments.length > 0) {
    for (const attachment of options.attachments) {
      const contentType = attachment.contentType || 'application/octet-stream'
      const encodedFilename = encodeHeaderValue(attachment.filename)
      const fileBase64 = chunkBase64(attachment.content.toString('base64'))

      parts.push(
        [
          `--${boundary}`,
          `Content-Type: ${contentType}; name="${encodedFilename}"`,
          `Content-Disposition: attachment; filename="${encodedFilename}"`,
          'Content-Transfer-Encoding: base64',
          '',
          fileBase64,
          '',
        ].join('\r\n')
      )
    }
  }

  // Final closing boundary
  parts.push(`--${boundary}--`)

  const rawMime = headers.join('\r\n') + '\r\n' + parts.join('\r\n')

  // Encode to web-safe base64url for Gmail API
  return Buffer.from(rawMime, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

