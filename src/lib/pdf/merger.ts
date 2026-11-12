import { PDFDocument } from 'pdf-lib'
import sharp from 'sharp'

export interface PdfInputItem {
  name: string
  buffer: Buffer
  /** Original MIME type — used to trigger image-to-PDF conversion when not a PDF */
  mimeType?: string
}

/** MIME types that can be converted to PDF via sharp */
const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
])

/** Returns true if the MIME type or filename indicates an image we can convert */
export function isImageDocument(mimeType?: string | null, filename?: string | null): boolean {
  if (mimeType && IMAGE_MIME_TYPES.has(mimeType.toLowerCase())) return true
  if (filename) {
    const ext = filename.toLowerCase().split('.').pop()
    if (ext && ['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return true
  }
  return false
}

/**
 * Converts an image buffer (JPEG/PNG/WebP) to a single-page PDF buffer.
 * The image is fitted within A4 dimensions (595 × 842 pt at 72 dpi)
 * while preserving aspect ratio and maintaining readability.
 */
export async function convertImageToPdfBuffer(
  imageBuffer: Buffer,
  documentName: string
): Promise<Buffer> {
  // A4 at 72 dpi (PDF points)
  const A4_WIDTH_PT = 595
  const A4_HEIGHT_PT = 842
  // Margin in points (≈ 1.27 cm)
  const MARGIN_PT = 36

  const availableWidth = A4_WIDTH_PT - MARGIN_PT * 2
  const availableHeight = A4_HEIGHT_PT - MARGIN_PT * 2

  // Convert to PNG via sharp (consistent, lossless for PDF embedding)
  let pngBuffer: Buffer
  try {
    pngBuffer = await sharp(imageBuffer)
      .resize(availableWidth * 3, availableHeight * 3, {
        // 3× oversampling for crisp text in PDF; fit preserves aspect ratio
        fit: 'inside',
        withoutEnlargement: false,
      })
      .png({ quality: 100 })
      .toBuffer()
  } catch (sharpErr: unknown) {
    const msg = sharpErr instanceof Error ? sharpErr.message : String(sharpErr)
    throw new Error(`Gagal memproses gambar "${documentName}": ${msg}`)
  }

  // Get actual pixel dimensions post-resize
  const meta = await sharp(pngBuffer).metadata()
  if (!meta.width || !meta.height) {
    throw new Error(`Gambar "${documentName}" tidak memiliki dimensi yang valid.`)
  }

  // Scale pixel dimensions back down to PDF points so it fits within A4
  const scale = Math.min(availableWidth / (meta.width / 3), availableHeight / (meta.height / 3))
  const pdfImgWidth = (meta.width / 3) * scale
  const pdfImgHeight = (meta.height / 3) * scale

  const pdf = await PDFDocument.create()
  const page = pdf.addPage([A4_WIDTH_PT, A4_HEIGHT_PT])

  let pdfImage
  try {
    pdfImage = await pdf.embedPng(pngBuffer)
  } catch (embedErr: unknown) {
    const msg = embedErr instanceof Error ? embedErr.message : String(embedErr)
    throw new Error(`Gagal menyematkan gambar "${documentName}" ke PDF: ${msg}`)
  }

  // Center horizontally; pin to top margin
  const x = MARGIN_PT + (availableWidth - pdfImgWidth) / 2
  const y = A4_HEIGHT_PT - MARGIN_PT - pdfImgHeight

  page.drawImage(pdfImage, {
    x,
    y,
    width: pdfImgWidth,
    height: pdfImgHeight,
  })

  const bytes = await pdf.save()
  return Buffer.from(bytes)
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

/**
 * Merges multiple PDF and/or image buffers in the specified order into a single PDF buffer.
 *
 * - PDF items: pages are copied directly.
 * - Image items (JPEG/PNG/WebP): converted to a single A4 PDF page via sharp + pdf-lib.
 *
 * Throws explicit errors if any document is corrupted, password-protected, or unreadable.
 */
export async function mergePdfBuffers(pdfItems: PdfInputItem[]): Promise<Buffer> {
  if (pdfItems.length === 0) {
    throw new Error('Tidak ada dokumen untuk digabungkan.')
  }

  // Normalise every item to a PDF buffer first
  const resolvedPdfBuffers: { name: string; buffer: Buffer }[] = []

  for (const item of pdfItems) {
    if (isImageDocument(item.mimeType, item.name)) {
      // Convert image → single-page A4 PDF
      const imgPdfBuffer = await convertImageToPdfBuffer(item.buffer, item.name)
      resolvedPdfBuffers.push({ name: item.name, buffer: imgPdfBuffer })
    } else {
      resolvedPdfBuffers.push({ name: item.name, buffer: item.buffer })
    }
  }

  if (resolvedPdfBuffers.length === 1) {
    return resolvedPdfBuffers[0].buffer
  }

  const mergedPdf = await PDFDocument.create()

  for (const item of resolvedPdfBuffers) {
    let srcDoc: PDFDocument
    try {
      srcDoc = await PDFDocument.load(item.buffer, {
        ignoreEncryption: false,
      })
    } catch (loadErr: unknown) {
      const errMessage = loadErr instanceof Error ? loadErr.message : String(loadErr)
      if (
        errMessage.toLowerCase().includes('encrypt') ||
        errMessage.toLowerCase().includes('password')
      ) {
        throw new Error(
          `Dokumen "${item.name}" terenkripsi atau dilindungi kata sandi sehingga tidak dapat digabungkan.`
        )
      }
      throw new Error(
        `Berkas "${item.name}" rusak atau tidak berformat PDF valid: ${errMessage}`
      )
    }

    const pageIndices = srcDoc.getPageIndices()
    if (pageIndices.length === 0) {
      throw new Error(`Dokumen "${item.name}" kosong atau tidak memiliki halaman valid.`)
    }

    try {
      const copiedPages = await mergedPdf.copyPages(srcDoc, pageIndices)
      for (const page of copiedPages) {
        mergedPdf.addPage(page)
      }
    } catch (copyErr: unknown) {
      const errMessage = copyErr instanceof Error ? copyErr.message : String(copyErr)
      throw new Error(
        `Gagal menggabungkan halaman dari dokumen "${item.name}": ${errMessage}`
      )
    }
  }

  try {
    const mergedBytes = await mergedPdf.save()
    return Buffer.from(mergedBytes)
  } catch (saveErr: unknown) {
    const errMessage = saveErr instanceof Error ? saveErr.message : String(saveErr)
    throw new Error(`Gagal menyimpan file PDF hasil penggabungan: ${errMessage}`)
  }
}

