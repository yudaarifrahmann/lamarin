export interface PlaceholderVariable {
  tag: string
  label: string
  sample: string
  description: string
}

export const SUPPORTED_PLACEHOLDERS: PlaceholderVariable[] = [
  {
    tag: '{{company_name}}',
    label: 'Nama Perusahaan',
    sample: 'PT Inovasi Digital Indonesia',
    description: 'Nama perusahaan yang dituju (misal: PT Maju Bersama)',
  },
  {
    tag: '{{position}}',
    label: 'Posisi yang Dilamar',
    sample: 'Software Engineer',
    description: 'Posisi atau lowongan pekerjaan yang dilamar (misal: Full Stack Developer)',
  },
  {
    tag: '{{sender_name}}',
    label: 'Nama Pengirim',
    sample: 'Budi Pratama',
    description: 'Nama lengkap Anda sebagai pelamar kerja',
  },
  {
    tag: '{{sender_city}}',
    label: 'Kota Pengirim',
    sample: 'Jakarta',
    description: 'Kota tempat tinggal pengirim (digunakan pada baris tanggal surat)',
  },
  {
    tag: '{{today_date}}',
    label: 'Tanggal Hari Ini',
    sample: '13 November 2026',
    description: 'Tanggal otomatis saat surat dibuat, dalam zona waktu Asia/Jakarta (WIB)',
  },
]

export interface PlaceholderValues {
  company_name?: string
  position?: string
  sender_name?: string
  sender_city?: string
  /** Tanggal dalam format Indonesia, e.g. "13 November 2026". Jika tidak diisi, digenerate otomatis saat kirim. */
  today_date?: string
}

/**
 * Format today's date in formal Indonesian (e.g. "13 November 2026").
 * Always uses Asia/Jakarta timezone.
 */
export function getFormattedTodayDate(): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ]
  const formatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = formatter.formatToParts(new Date())
  const day = parseInt(parts.find((p) => p.type === 'day')!.value, 10)
  const month = parseInt(parts.find((p) => p.type === 'month')!.value, 10)
  const year = parseInt(parts.find((p) => p.type === 'year')!.value, 10)
  return `${day} ${months[month - 1]} ${year}`
}

/**
 * Replace dynamic placeholders in subject or message body with actual or sample values.
 * Supports both {{variable}} and {variable} notation.
 * `today_date` defaults to getFormattedTodayDate() (Asia/Jakarta) if not explicitly provided.
 */
export function replacePlaceholders(
  content: string,
  variables: PlaceholderValues
): string {
  if (!content) return ''

  // Resolve today_date once — always use Asia/Jakarta if not explicitly provided
  const resolvedTodayDate = variables.today_date || getFormattedTodayDate()

  return content
    .replace(
      /\{\{?company_name\}\}?/gi,
      variables.company_name !== undefined && variables.company_name !== ''
        ? variables.company_name
        : 'PT Inovasi Digital Indonesia'
    )
    .replace(
      /\{\{?position\}\}?/gi,
      variables.position !== undefined && variables.position !== ''
        ? variables.position
        : 'Software Engineer'
    )
    .replace(
      /\{\{?sender_name\}\}?/gi,
      variables.sender_name !== undefined && variables.sender_name !== ''
        ? variables.sender_name
        : 'Pelamar Kerja'
    )
    .replace(
      /\{\{?sender_city\}\}?/gi,
      // Empty string when not configured — do NOT show raw placeholder
      variables.sender_city ?? ''
    )
    .replace(
      /\{\{?today_date\}\}?/gi,
      resolvedTodayDate
    )
}

