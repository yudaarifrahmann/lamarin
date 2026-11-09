'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { DocumentRow } from '@/types/document'

const STORAGE_BUCKET = 'application-documents'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
]

export interface ActionResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Server Action: Upload document to private storage bucket and create DB record
 */
export async function uploadDocumentAction(formData: FormData): Promise<ActionResponse<DocumentRow>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Sesi login telah berakhir. Silakan login kembali.' }
    }

    const file = formData.get('file') as File | null
    const documentNameRaw = formData.get('document_name') as string | null

    if (!file || !(file instanceof File) || file.size === 0) {
      return { success: false, error: 'Berkas dokumen wajib dipilih.' }
    }

    // 1. Validate File Size (Max 10MB)
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `Ukuran file melebihi batas maksimum 10MB (${(file.size / (1024 * 1024)).toFixed(2)}MB).`,
      }
    }

    // 2. Validate MIME Type
    const mimeType = file.type || 'application/octet-stream'
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return {
        success: false,
        error: `Tipe file '${mimeType}' tidak didukung. Format yang diizinkan: PDF, DOC, DOCX, JPG, PNG.`,
      }
    }

    // 3. Format document name
    const fallbackName = file.name.replace(/\.[^/.]+$/, '')
    const documentName = (documentNameRaw && documentNameRaw.trim()) || fallbackName

    // 4. Sanitize file name for storage path: <user_id>/<timestamp>-<sanitized_name>
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `${user.id}/${Date.now()}-${sanitizedFileName}`

    // 5. Upload to Supabase Storage (Private bucket)
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, {
        contentType: mimeType,
        upsert: false,
      })

    if (uploadError) {
      return { success: false, error: `Gagal mengunggah file ke Storage: ${uploadError.message}` }
    }

    // 6. Save metadata record to PostgreSQL documents table
    const { data: dbData, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        document_name: documentName,
        original_filename: file.name,
        storage_path: storagePath,
        mime_type: mimeType,
        file_size: file.size,
      })
      .select()
      .single()

    if (dbError) {
      // Rollback: delete uploaded file from storage if DB insert fails
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath])
      return { success: false, error: `Gagal menyimpan metadata dokumen: ${dbError.message}` }
    }

    revalidatePath('/manajemen-dokumen')
    return { success: true, data: dbData }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat mengunggah dokumen.',
    }
  }
}

/**
 * Server Action: Rename document in PostgreSQL
 */
export async function renameDocumentAction(
  id: string,
  newDocumentName: string
): Promise<ActionResponse<DocumentRow>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Sesi login telah berakhir.' }
    }

    const trimmedName = newDocumentName.trim()
    if (!trimmedName) {
      return { success: false, error: 'Nama dokumen tidak boleh kosong.' }
    }

    const { data, error } = await supabase
      .from('documents')
      .update({ document_name: trimmedName })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return { success: false, error: `Gagal mengubah nama dokumen: ${error.message}` }
    }

    revalidatePath('/manajemen-dokumen')
    return { success: true, data }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal memperbarui nama dokumen.',
    }
  }
}

/**
 * Server Action: Delete document from database and Storage bucket
 */
export async function deleteDocumentAction(
  id: string,
  storagePath: string
): Promise<ActionResponse<{ id: string }>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Sesi login telah berakhir.' }
    }

    // Security check: storagePath must belong to the user's folder
    if (!storagePath.startsWith(`${user.id}/`)) {
      return { success: false, error: 'Akses tidak sah ke path dokumen ini.' }
    }

    // 1. Delete file from Storage bucket
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath])

    if (storageError) {
      console.warn('Storage deletion warning:', storageError.message)
    }

    // 2. Delete record from database
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (dbError) {
      return { success: false, error: `Gagal menghapus dokumen dari database: ${dbError.message}` }
    }

    revalidatePath('/manajemen-dokumen')
    return { success: true, data: { id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal menghapus dokumen.',
    }
  }
}

/**
 * Server Action: Generate short-lived signed URL for secure viewing/downloading (NEVER public URL)
 */
export async function getSignedUrlAction(
  storagePath: string
): Promise<ActionResponse<{ signedUrl: string }>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Sesi login telah berakhir.' }
    }

    // Security check: storagePath must belong to user's folder
    if (!storagePath.startsWith(`${user.id}/`)) {
      return { success: false, error: 'Akses tidak sah ke dokumen ini.' }
    }

    // 60 seconds expiration for private secure access
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, 60)

    if (error || !data?.signedUrl) {
      return { success: false, error: `Gagal membuat tautan unduhan aman: ${error?.message}` }
    }

    return { success: true, data: { signedUrl: data.signedUrl } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal mengakses berkas dokumen.',
    }
  }
}

