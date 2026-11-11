import { PDFDocument } from 'pdf-lib'

export interface PdfInputItem {
  name: string
  buffer: Buffer
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
 * Merges multiple PDF buffers in the specified order into a single PDF buffer.
 * Throws explicit errors if any PDF is corrupted, password-protected, or unreadable.
 */
export async function mergePdfBuffers(pdfItems: PdfInputItem[]): Promise<Buffer> {
  if (pdfItems.length === 0) {
    throw new Error('Tidak ada dokumen PDF untuk digabungkan.')
  }

  if (pdfItems.length === 1) {
    return pdfItems[0].buffer
  }

  const mergedPdf = await PDFDocument.create()

  for (const item of pdfItems) {
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

