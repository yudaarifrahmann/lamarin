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
    sample: 'Jakarta, 12 November 2026',
    description: 'Tanggal otomatis saat surat dibuat, dalam zona waktu Asia/Jakarta',
  },
]

export interface PlaceholderValues {
  company_name?: string
  position?: string
  sender_name?: string
  sender_city?: string
}

/**
 * Replace dynamic placeholders in subject or message body with actual or sample values.
 * Supports both {{variable}} and {variable} notation.
 */
export function replacePlaceholders(
  content: string,
  variables: PlaceholderValues
): string {
  if (!content) return ''
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
}
