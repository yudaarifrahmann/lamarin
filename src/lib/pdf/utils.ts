/**
 * Client-safe PDF & image helper functions and types.
 * Pure logic only — NO native Node.js modules, NO sharp, NO pdf-lib.
 * Can be safely imported in Client Components ('use client') or Server Components.
 */

export interface PdfInputItem {
  name: string
  buffer: Buffer
  /** Original MIME type — used to trigger image-to-PDF conversion when not a PDF */
  mimeType?: string
}

/** MIME types that can be converted to PDF */
export const CONVERTIBLE_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
])

/**
 * Checks whether a document is an image that can be converted to a PDF page
 */
export function isImageDocument(mimeType?: string | null, filename?: string | null): boolean {
  if (mimeType && CONVERTIBLE_IMAGE_MIME_TYPES.has(mimeType.toLowerCase())) return true
  if (filename) {
    const ext = filename.toLowerCase().split('.').pop()
    if (ext && ['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return true
  }
  return false
}

/**
 * Checks whether a document is a PDF based on its MIME type or file extension
 */
export function isPdfDocument(mimeType?: string | null, filename?: string | null): boolean {
  if (mimeType && mimeType.toLowerCase().includes('pdf')) {
    return true
  }
  if (filename && filename.toLowerCase().endsWith('.pdf')) {
    return true
  }
  return false
}

/**
 * Checks whether a document can be processed into a merged PDF (PDF or convertible image)
 */
export function isProcessableDocument(mimeType?: string | null, filename?: string | null): boolean {
  return isPdfDocument(mimeType, filename) || isImageDocument(mimeType, filename)
}

/**
 * Generates a clean, professional filename for merged PDF documents.
 * Format: Dokumen_Lamaran_[Nama_Perusahaan].pdf
 */
export function generateMergedPdfFilename(companyName?: string): string {
  if (!companyName || !companyName.trim()) {
    return 'Dokumen_Lamaran.pdf'
  }

  // Remove invalid filename characters: / \ ? * : | " < >
  const sanitized = companyName
    .trim()
    .replace(/[/\\?%*:|"<>]/g, '')
    .replace(/\s+/g, '_')

  return `Dokumen_Lamaran_${sanitized || 'Perusahaan'}.pdf`
}

