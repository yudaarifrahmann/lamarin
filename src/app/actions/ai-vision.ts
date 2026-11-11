'use server'

import type { TemplateLayoutConfig, TemplateBlock } from '@/types/template-layout'
import { createDefaultLayoutConfig, DEFAULT_PAGE_SETTINGS } from '@/lib/templates/layout-engine'

export interface VisionAnalysisResponse {
  success: boolean
  data?: TemplateLayoutConfig
  extractedSubject?: string
  suggestedTemplateName?: string
  error?: string
  needsApiKey?: boolean
}

/**
 * Server Action: Analyze an image of a job application letter using Google Gemini Vision API
 * Extracts visual layout and structured blocks directly into TemplateLayoutConfig.
 */
export async function analyzeLetterImageAction(
  formData: FormData
): Promise<VisionAnalysisResponse> {
  try {
    const file = formData.get('image') as File | null
    const customApiKey = (formData.get('api_key') as string)?.trim()

    if (!file || !(file instanceof File)) {
      return { success: false, error: 'Berkas gambar surat lamaran wajib diunggah.' }
    }

    // Validate size (max 8MB for AI Vision)
    if (file.size > 8 * 1024 * 1024) {
      return { success: false, error: 'Ukuran gambar melebihi batas maksimum 8MB.' }
    }

    // Validate mime type
    const mimeType = file.type || 'image/jpeg'
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic'].includes(mimeType)) {
      return {
        success: false,
        error: 'Format gambar tidak didukung. Harap gunakan berkas JPG, PNG, atau WebP.',
      }
    }

    const apiKey = customApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString('base64')

    if (!apiKey) {
      return {
        success: false,
        needsApiKey: true,
        error:
          'Kunci GEMINI_API_KEY belum dikonfigurasi di server. Anda dapat memasukkan Gemini API Key pribadi Anda pada input di bawah untuk melanjutkan analisis gambar.',
      }
    }

    const prompt = `
Anda adalah asisten AI ahli tata letak dokumen surat formal.
Tugas Anda adalah menganalisis gambar surat lamaran kerja ini secara visual dan mengekstrak struktur serta tata letak visualnya secara akurat menjadi format JSON.

Perhatikan:
1. Posisi tanggal (kiri, kanan, tengah). Jika terdapat tanggal, pertahankan atau gantikan dengan placeholder "{{today_date}}".
2. Posisi alamat tujuan / Kepada Yth (biasanya di kiri). Gunakan placeholder "{{company_name}}" dan "{{position}}" jika sesuai.
3. Salam pembuka (misal: "Dengan hormat,").
4. Susunan paragraf narasi pembuka, isi, dan penutup.
5. Bagian data diri / biodata: Jika berbentuk tabel atau baris titik dua (Nama :, TTL :, dll.), ekstrak menjadi format biodata dengan daftar field { label, value } dan gunakan placeholder "{{sender_name}}", "{{position}}", "{{sender_email}}", "{{sender_phone}}".
6. Salam penutup dan susunan tanda tangan / nama pelamar: Deteksi apakah posisinya di kanan, kiri, atau tengah. Gunakan "{{sender_name}}".
7. Perkirakan styling: font (Arial / Times New Roman / Calibri / Georgia), perataan teks per blok (left / center / right / justify), margin (atas, bawah, kiri, kanan dalam pixel).

KEMBALIKAN HANYA JSON MURNI TANPA BACKTICKS ATAU MARKDOWN:
{
  "templateName": "Nama Template berdasarkan gambar",
  "suggestedSubject": "Lamaran Pekerjaan: {{position}} - {{company_name}}",
  "layoutConfig": {
    "version": 1,
    "pageSettings": {
      "paperSize": "a4",
      "maxWidth": 680,
      "marginTop": 36,
      "marginBottom": 36,
      "marginLeft": 40,
      "marginRight": 40,
      "fontFamily": "Arial",
      "fontSize": 14,
      "lineHeight": 1.6,
      "textColor": "#1f2937",
      "backgroundColor": "#ffffff",
      "sectionSpacing": 16
    },
    "blocks": [
      {
        "id": "block_1",
        "type": "date",
        "content": "Jakarta, {{today_date}}",
        "align": "right",
        "style": { "marginBottom": 16, "fontWeight": "normal" }
      },
      ...
    ]
  }
}
`

    // Model configuration with default fallback to gemini-3.8-flash
    const model = (process.env.GEMINI_MODEL || 'gemini-3.8-flash').trim()

    // Call Gemini Developer API via REST endpoint
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            response_mime_type: 'application/json',
          },
        }),
      }
    )

    if (!response.ok) {
      let errMessage = `HTTP ${response.status}`
      try {
        const errBody = await response.text()
        console.error('Gemini API Error:', errBody)
        const parsedErr = JSON.parse(errBody)
        if (parsedErr.error?.message) {
          errMessage = parsedErr.error.message
        }
      } catch {
        // fallback to default HTTP status
      }

      // Ensure API Key is never leaked in the returned error message
      if (apiKey) {
        errMessage = errMessage.replaceAll(apiKey, '[REDACTED_API_KEY]')
      }

      if (response.status === 400 || response.status === 403) {
        return {
          success: false,
          needsApiKey: true,
          error: `Kunci Gemini API tidak valid atau izin ditolak (${errMessage}). Silakan periksa kembali API Key Anda.`,
        }
      }

      if (response.status === 404) {
        return {
          success: false,
          error: `Model AI '${model}' tidak ditemukan atau belum didukung untuk endpoint ini (${errMessage}). Anda dapat menyesuaikan konfigurasi GEMINI_MODEL.`,
        }
      }

      return {
        success: false,
        error: `Gagal menganalisis gambar via AI Gemini (${errMessage}). Silakan coba lagi.`,
      }
    }

    const resJson = await response.json()
    const candidateText =
      resJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''

    if (!candidateText) {
      return { success: false, error: 'AI tidak mengembalikan hasil analisis tata letak.' }
    }

    // Clean JSON markdown fences if present
    const cleanJson = candidateText
      .replace(/^```json/i, '')
      .replace(/^```/i, '')
      .replace(/```$/, '')
      .trim()

    const parsed = JSON.parse(cleanJson)

    if (!parsed.layoutConfig || !Array.isArray(parsed.layoutConfig.blocks)) {
      return {
        success: false,
        error: 'Format struktur tata letak dari AI tidak sesuai standar.',
      }
    }

    // Ensure IDs and default settings
    const blocks: TemplateBlock[] = parsed.layoutConfig.blocks.map(
      (b: Partial<TemplateBlock>, idx: number) => ({
        id: b.id || `vision_block_${idx + 1}`,
        type: b.type || 'paragraph',
        content: b.content || '',
        align: b.align || 'left',
        style: b.style || { marginBottom: 14 },
      })
    )

    const finalConfig: TemplateLayoutConfig = {
      version: 1,
      pageSettings: {
        ...DEFAULT_PAGE_SETTINGS,
        ...(parsed.layoutConfig.pageSettings || {}),
      },
      blocks,
    }

    return {
      success: true,
      data: finalConfig,
      extractedSubject: parsed.suggestedSubject || 'Lamaran Pekerjaan: {{position}} - {{company_name}}',
      suggestedTemplateName: parsed.templateName || file.name.replace(/\.[^/.]+$/, ''),
    }
  } catch (err) {
    console.error('Vision analysis exception:', err)
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan sistem saat menganalisis gambar surat.',
    }
  }
}

