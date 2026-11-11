import type {
  TemplateLayoutConfig,
  TemplateBlock,
  PageSettings,
  AlignOption,
  BiodataField,
} from '@/types/template-layout'
import type { PlaceholderValues } from '@/lib/placeholders'
import { replacePlaceholders } from '@/lib/placeholders'

/**
 * Format today's date in formal Indonesian (e.g. 11 November 2026)
 */
export function getFormattedTodayDate(): string {
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ]
  const today = new Date()
  const day = today.getDate()
  const month = months[today.getMonth()]
  const year = today.getFullYear()
  return `${day} ${month} ${year}`
}

/**
 * Replace all placeholders including date, email, phone, and standard variables
 */
export function applyAllPlaceholders(
  text: string,
  variables: PlaceholderValues & {
    sender_email?: string
    sender_phone?: string
    today_date?: string
  }
): string {
  if (!text) return ''

  const today = variables.today_date || getFormattedTodayDate()

  // First apply standard variables
  let result = replacePlaceholders(text, variables)

  // Then apply extended variables
  result = result
    .replace(/\{\{?today_date\}\}?/gi, today)
    .replace(/\{\{?sender_email\}\}?/gi, variables.sender_email || 'pelamar@email.com')
    .replace(/\{\{?sender_phone\}\}?/gi, variables.sender_phone || '0812-3456-7890')

  return result
}

/**
 * Sanitize text for HTML injection while preserving line breaks
 */
function escapeHtml(str: string): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Default Page Settings for formal letter
 */
export const DEFAULT_PAGE_SETTINGS: PageSettings = {
  paperSize: 'a4',
  maxWidth: 680,
  marginTop: 36,
  marginBottom: 36,
  marginLeft: 40,
  marginRight: 40,
  fontFamily: 'Arial',
  fontSize: 14,
  lineHeight: 1.6,
  textColor: '#1f2937',
  backgroundColor: '#ffffff',
  sectionSpacing: 16,
}

/**
 * Create default structured layout configuration
 */
export function createDefaultLayoutConfig(
  senderName?: string,
  overrides?: Partial<PageSettings>
): TemplateLayoutConfig {
  const defaultBlocks: TemplateBlock[] = [
    {
      id: 'block_date',
      type: 'date',
      content: 'Jakarta, {{today_date}}',
      align: 'right',
      style: {
        marginBottom: 16,
        fontWeight: 'normal',
      },
    },
    {
      id: 'block_recipient',
      type: 'recipient',
      content:
        'Hal: Lamaran Pekerjaan - {{position}}\n\nKepada Yth.\nBapak/Ibu HRD {{company_name}}\ndi Tempat',
      align: 'left',
      style: {
        marginBottom: 16,
        fontWeight: 'normal',
      },
    },
    {
      id: 'block_salutation',
      type: 'salutation',
      content: 'Dengan hormat,',
      align: 'left',
      style: {
        marginBottom: 14,
        fontWeight: 'normal',
      },
    },
    {
      id: 'block_p1',
      type: 'paragraph',
      content:
        'Sehubungan dengan informasi lowongan pekerjaan yang saya peroleh terkait posisi {{position}} di {{company_name}}, melalui surat ini saya bermaksud untuk mengajukan diri guna bergabung dengan perusahaan yang Bapak/Ibu pimpin.',
      align: 'justify',
      style: {
        marginBottom: 14,
      },
    },
    {
      id: 'block_biodata',
      type: 'biodata',
      content: 'Berikut adalah data singkat mengenai diri saya:',
      align: 'left',
      style: {
        marginBottom: 14,
        biodataFormat: 'table',
        biodataFields: [
          { label: 'Nama Lengkap', value: '{{sender_name}}' },
          { label: 'Posisi yang Dilamar', value: '{{position}}' },
          { label: 'Email', value: '{{sender_email}}' },
          { label: 'Nomor Telepon / WhatsApp', value: '{{sender_phone}}' },
        ],
      },
    },
    {
      id: 'block_p2',
      type: 'paragraph',
      content:
        'Saya memiliki komitmen tinggi, integritas, serta antusiasme yang kuat untuk terus berkembang dan berkontribusi secara optimal bagi kemajuan {{company_name}}. Bersama surat lamaran ini, saya lampirkan dokumen pendukung sebagai bahan pertimbangan.',
      align: 'justify',
      style: {
        marginBottom: 14,
      },
    },
    {
      id: 'block_closing',
      type: 'closing',
      content:
        'Demikian surat lamaran ini saya sampaikan. Besar harapan saya untuk diberikan kesempatan menghadiri sesi wawancara guna menjelaskan kualifikasi serta potensi saya lebih lanjut. Atas perhatian dan kesempatan yang Bapak/Ibu berikan, saya ucapkan terima kasih.',
      align: 'justify',
      style: {
        marginBottom: 24,
      },
    },
    {
      id: 'block_signature',
      type: 'signature',
      content: 'Hormat saya,\n\n\n{{sender_name}}',
      align: 'right',
      style: {
        signaturePosition: 'right',
        marginBottom: 0,
        fontWeight: 'normal',
      },
    },
  ]

  return {
    version: 1,
    pageSettings: {
      ...DEFAULT_PAGE_SETTINGS,
      ...overrides,
    },
    blocks: defaultBlocks,
  }
}

/**
 * Intelligently parse raw plain text into structured layout blocks
 */
export function parseTextToLayoutConfig(
  rawText: string,
  senderName?: string
): TemplateLayoutConfig {
  if (!rawText || !rawText.trim()) {
    return createDefaultLayoutConfig(senderName)
  }

  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  if (lines.length === 0) {
    return createDefaultLayoutConfig(senderName)
  }

  const blocks: TemplateBlock[] = []
  let blockIndex = 1

  // Detect date at beginning
  let startIdx = 0
  const firstLine = lines[0]
  if (
    firstLine.match(
      /(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember|\d{4}|today_date)/i
    )
  ) {
    blocks.push({
      id: `block_${blockIndex++}`,
      type: 'date',
      content: firstLine,
      align: 'right',
      style: { marginBottom: 16 },
    })
    startIdx = 1
  }

  // Detect recipient (Kepada Yth / Hal:)
  const recipientLines: string[] = []
  while (startIdx < lines.length) {
    const l = lines[startIdx]
    if (
      l.toLowerCase().startsWith('kepada') ||
      l.toLowerCase().startsWith('yth') ||
      l.toLowerCase().startsWith('hal:') ||
      l.toLowerCase().startsWith('perihal:') ||
      l.toLowerCase().startsWith('di ') ||
      l.toLowerCase().startsWith('tempat') ||
      l.toLowerCase().includes('pt ') ||
      l.toLowerCase().includes('company_name')
    ) {
      recipientLines.push(l)
      startIdx++
    } else {
      break
    }
  }

  if (recipientLines.length > 0) {
    blocks.push({
      id: `block_${blockIndex++}`,
      type: 'recipient',
      content: recipientLines.join('\n'),
      align: 'left',
      style: { marginBottom: 16 },
    })
  }

  // Detect salutation
  if (startIdx < lines.length && lines[startIdx].toLowerCase().includes('hormat')) {
    blocks.push({
      id: `block_${blockIndex++}`,
      type: 'salutation',
      content: lines[startIdx],
      align: 'left',
      style: { marginBottom: 14 },
    })
    startIdx++
  }

  // Detect signature at the end (Hormat saya / Pelamar)
  let endIdx = lines.length
  const signatureLines: string[] = []
  if (lines.length > startIdx) {
    const last1 = lines[lines.length - 1]
    const last2 = lines.length > 1 ? lines[lines.length - 2] : ''

    if (
      last1.toLowerCase().includes('hormat') ||
      last2.toLowerCase().includes('hormat') ||
      last1.includes('{{sender_name}}') ||
      last1.includes('{sender_name}')
    ) {
      if (last2.toLowerCase().includes('hormat')) {
        signatureLines.push(last2, '', last1)
        endIdx = lines.length - 2
      } else {
        signatureLines.push(last1)
        endIdx = lines.length - 1
      }
    }
  }

  // Middle content: paragraphs and biodata
  for (let i = startIdx; i < endIdx; i++) {
    const line = lines[i]

    // Check if line looks like biodata (e.g. Nama : Budi / Nama: Budi)
    if (line.includes(':') && line.split(':').length === 2 && line.length < 100) {
      const bioFields: BiodataField[] = []
      let j = i
      while (j < endIdx && lines[j].includes(':') && lines[j].split(':').length === 2) {
        const parts = lines[j].split(':')
        bioFields.push({
          label: parts[0].trim(),
          value: parts[1].trim(),
        })
        j++
      }

      blocks.push({
        id: `block_${blockIndex++}`,
        type: 'biodata',
        content: 'Data Diri:',
        align: 'left',
        style: {
          marginBottom: 14,
          biodataFormat: 'table',
          biodataFields: bioFields,
        },
      })
      i = j - 1
      continue
    }

    // Closing statement detection
    if (
      line.toLowerCase().startsWith('demikian') ||
      line.toLowerCase().includes('atas perhatian') ||
      line.toLowerCase().includes('besar harapan')
    ) {
      blocks.push({
        id: `block_${blockIndex++}`,
        type: 'closing',
        content: line,
        align: 'justify',
        style: { marginBottom: 20 },
      })
      continue
    }

    // Normal paragraph
    blocks.push({
      id: `block_${blockIndex++}`,
      type: 'paragraph',
      content: line,
      align: 'justify',
      style: { marginBottom: 14 },
    })
  }

  // Push signature block
  if (signatureLines.length > 0) {
    blocks.push({
      id: `block_${blockIndex++}`,
      type: 'signature',
      content: signatureLines.join('\n'),
      align: 'right',
      style: {
        signaturePosition: 'right',
        marginBottom: 0,
      },
    })
  } else {
    // Add default signature if omitted
    blocks.push({
      id: `block_${blockIndex++}`,
      type: 'signature',
      content: 'Hormat saya,\n\n\n{{sender_name}}',
      align: 'right',
      style: {
        signaturePosition: 'right',
        marginBottom: 0,
      },
    })
  }

  return {
    version: 1,
    pageSettings: DEFAULT_PAGE_SETTINGS,
    blocks,
  }
}

/**
 * Convert structured LayoutConfig back to plain text for email message fallback
 */
export function layoutConfigToPlainText(config: TemplateLayoutConfig): string {
  if (!config || !Array.isArray(config.blocks)) return ''

  return config.blocks
    .map((block) => {
      if (block.type === 'biodata' && block.style.biodataFormat === 'table') {
        const fields = block.style.biodataFields || []
        const prefix = block.content ? `${block.content}\n` : ''
        const tableText = fields
          .map((f) => `  - ${f.label}: ${f.value}`)
          .join('\n')
        return `${prefix}${tableText}`
      }
      return block.content
    })
    .filter(Boolean)
    .join('\n\n')
}

/**
 * Render structured layout configuration into clean, cross-client Gmail-compatible HTML email
 */
export function renderLayoutToHtml(
  config: TemplateLayoutConfig,
  variables: PlaceholderValues & {
    sender_email?: string
    sender_phone?: string
    today_date?: string
  },
  options: {
    mode?: 'desktop' | 'mobile'
    forEmail?: boolean
  } = {}
): string {
  const { mode = 'desktop', forEmail = false } = options
  const page = config.pageSettings || DEFAULT_PAGE_SETTINGS
  const blocks = config.blocks || []

  const isMobile = mode === 'mobile'
  const containerMaxWidth = isMobile ? '100%' : `${page.maxWidth}px`
  const padTop = isMobile ? Math.min(page.marginTop, 24) : page.marginTop
  const padBottom = isMobile ? Math.min(page.marginBottom, 24) : page.marginBottom
  const padLeft = isMobile ? Math.min(page.marginLeft, 20) : page.marginLeft
  const padRight = isMobile ? Math.min(page.marginRight, 20) : page.marginRight

  const blocksHtml = blocks
    .map((block) => {
      const align = block.align || 'left'
      const marginBottom =
        block.style.marginBottom !== undefined
          ? block.style.marginBottom
          : page.sectionSpacing
      const fontWeight = block.style.fontWeight || 'normal'
      const fontStyle = block.style.fontStyle || 'normal'
      const fontSize = block.style.fontSize || page.fontSize
      const color = block.style.color || page.textColor

      const blockStyle = [
        `text-align: ${align};`,
        `font-size: ${fontSize}px;`,
        `font-weight: ${fontWeight};`,
        `font-style: ${fontStyle};`,
        `color: ${color};`,
        `line-height: ${page.lineHeight};`,
        `margin-bottom: ${marginBottom}px;`,
        `word-break: break-word;`,
      ].join(' ')

      // Render Biodata block with table format
      if (block.type === 'biodata' && block.style.biodataFormat === 'table') {
        const fields = block.style.biodataFields || []
        const headerText = block.content
          ? applyAllPlaceholders(block.content, variables)
          : ''

        const rowsHtml = fields
          .map((f) => {
            const label = applyAllPlaceholders(f.label, variables)
            const val = applyAllPlaceholders(f.value, variables)
            return `
              <tr>
                <td style="padding: 3px 12px 3px 0; font-weight: 500; color: ${color}; width: 35%; vertical-align: top; font-size: ${fontSize}px;">
                  ${escapeHtml(label)}
                </td>
                <td style="padding: 3px 8px; color: ${color}; width: 3%; vertical-align: top; font-size: ${fontSize}px;">:</td>
                <td style="padding: 3px 0 3px 8px; color: ${color}; vertical-align: top; font-size: ${fontSize}px;">
                  ${escapeHtml(val)}
                </td>
              </tr>
            `
          })
          .join('')

        return `
          <div style="${blockStyle}">
            ${headerText ? `<p style="margin: 0 0 8px 0;">${escapeHtml(headerText)}</p>` : ''}
            <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 100%; border-collapse: collapse; margin-left: 4px;">
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        `
      }

      // Render Signature block
      if (block.type === 'signature') {
        const sigPos = block.style.signaturePosition || block.align || 'right'
        const sigAlign =
          sigPos === 'center' ? 'center' : sigPos === 'left' ? 'left' : 'right'
        const rawContent = applyAllPlaceholders(block.content, variables)
        const lines = rawContent.split('\n')

        const sigHtml = lines
          .map((line) => {
            if (!line.trim()) {
              return '<div style="height: 18px;"></div>'
            }
            return `<div style="margin: 0;">${escapeHtml(line)}</div>`
          })
          .join('')

        return `
          <div style="margin-bottom: ${marginBottom}px; width: 100%;">
            <div style="display: inline-block; text-align: ${sigAlign}; float: ${sigAlign === 'center' ? 'none' : sigAlign}; font-size: ${fontSize}px; line-height: ${page.lineHeight}; color: ${color};">
              ${sigHtml}
            </div>
            <div style="clear: both;"></div>
          </div>
        `
      }

      // Default text block
      const processedText = applyAllPlaceholders(block.content, variables)
      const formattedText = escapeHtml(processedText).replace(/\n/g, '<br/>')

      return `
        <div style="${blockStyle}">
          ${formattedText}
        </div>
      `
    })
    .join('')

  if (forEmail) {
    return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Surat Lamaran Kerja</title>
</head>
<body style="margin: 0; padding: 20px 10px; background-color: #f3f4f6; font-family: ${page.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center">
        <!-- Main A4 Email Container -->
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: ${containerMaxWidth}; background-color: ${page.backgroundColor}; border: 1px solid #e5e7eb; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding: ${padTop}px ${padRight}px ${padBottom}px ${padLeft}px; font-family: ${page.fontFamily}, sans-serif; font-size: ${page.fontSize}px; line-height: ${page.lineHeight}; color: ${page.textColor};">
              ${blocksHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  }

  // Visual in-app preview container
  return `
    <div style="max-width: ${containerMaxWidth}; width: 100%; margin: 0 auto; background-color: ${page.backgroundColor}; padding: ${padTop}px ${padRight}px ${padBottom}px ${padLeft}px; font-family: ${page.fontFamily}, sans-serif; font-size: ${page.fontSize}px; line-height: ${page.lineHeight}; color: ${page.textColor}; box-sizing: border-box;">
      ${blocksHtml}
    </div>
  `.trim()
}

