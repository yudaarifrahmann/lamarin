export interface PlaceholderVariable {
  tag: string
  label: string
  sample: string
  description: string
}

export const SUPPORTED_PLACEHOLDERS: PlaceholderVariable[] = [
  {
    tag: '{company_name}',
    label: 'Nama Perusahaan',
    sample: 'PT Inovasi Digital Indonesia',
    description: 'Nama perusahaan yang dituju (misal: PT Maju Bersama)',
  },
  {
    tag: '{sender_name}',
    label: 'Nama Pengirim',
    sample: 'Budi Pratama',
    description: 'Nama lengkap Anda sebagai pelamar kerja',
  },
]

/**
 * Replace dynamic placeholders in subject or message body with preview values
 */
export function replacePlaceholders(
  content: string,
  variables: { company_name?: string; sender_name?: string }
): string {
  if (!content) return ''
  return content
    .replace(/\{company_name\}/g, variables.company_name || 'PT Inovasi Digital Indonesia')
    .replace(/\{sender_name\}/g, variables.sender_name || 'Budi Pratama')
}

