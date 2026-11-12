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
  'image/jpg',
  'image/png',
  'image/webp',
]

export interface ActionResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Server Action: Upload document to private storage bucket and create DB record
 * 
 * @deprecated Prefer the two-step direct upload flow:
 *   1. Client uploads directly to Supabase Storage via browser (see document-upload-modal.tsx)
 *   2. Client calls saveDocumentMetadataAction() to persist the DB record
 * 
 * This action is kept for compatibility but should NOT be used for new uploads because
 * routing the file binary through Next.js Server Action adds latency and can silently
 * hang under serverless platform time limits.
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

    // 6. Determine next sort_order for this user (max + 1)
    let nextSortOrder: number | null = null
    try {
      const { data: maxOrderData, error: maxOrderError } = await supabase
        .from('documents')
        .select('sort_order')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!maxOrderError && maxOrderData) {
        nextSortOrder = maxOrderData.sort_order != null ? maxOrderData.sort_order + 1 : 1
      } else if (!maxOrderError) {
        nextSortOrder = 1
      }
    } catch {
      nextSortOrder = null
    }

    // 7. Save metadata record to PostgreSQL documents table
    const baseInsertPayload = {
      user_id: user.id,
      document_name: documentName,
      original_filename: file.name,
      storage_path: storagePath,
      mime_type: mimeType,
      file_size: file.size,
    }

    let dbData: DocumentRow | null = null
    let dbError: { message: string } | null = null

    if (nextSortOrder !== null) {
      const resultWithOrder = await supabase
        .from('documents')
        .insert({
          ...baseInsertPayload,
          sort_order: nextSortOrder,
        })
        .select()
        .single()

      dbData = resultWithOrder.data
      dbError = resultWithOrder.error
    }

    // Fallback: If sort_order column is not yet present in PostgREST schema cache
    if (!dbData && (nextSortOrder === null || (dbError && dbError.message.includes('sort_order')))) {
      const fallbackResult = await supabase
        .from('documents')
        .insert(baseInsertPayload)
        .select()
        .single()

      dbData = fallbackResult.data
      dbError = fallbackResult.error
    }

    if (dbError || !dbData) {
      // Rollback: delete uploaded file from storage if DB insert fails
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath])
      return { success: false, error: `Gagal menyimpan metadata dokumen: ${dbError?.message}` }
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
 * Server Action: Save document metadata to DB after a client-side direct upload to Supabase Storage.
 *
 * This is part of the two-step direct-upload flow:
 *   Step 1 (browser): Upload file bytes directly from browser → Supabase Storage (bypasses Next.js)
 *   Step 2 (server):  Call this action to persist the DB record (tiny payload — no file bytes)
 *
 * Advantages over uploadDocumentAction:
 *   - No file bytes travel through Next.js → no bodySizeLimit constraint
 *   - Browser can track real upload progress via XMLHttpRequest
 *   - No server-side timeout risk from large file transfer
 *   - Rollback: if DB insert fails, we delete the orphaned file from Storage
 */
export async function saveDocumentMetadataAction(payload: {
  storagePath: string
  documentName: string
  originalFilename: string
  mimeType: string
  fileSize: number
}): Promise<ActionResponse<DocumentRow>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Sesi login telah berakhir. Silakan login kembali.' }
    }

    const { storagePath, documentName, originalFilename, mimeType, fileSize } = payload

    // Security: storage path must start with the authenticated user's ID
    if (!storagePath.startsWith(`${user.id}/`)) {
      return { success: false, error: 'Path dokumen tidak valid atau akses tidak sah.' }
    }

    // Validate mimeType server-side (defence-in-depth: browser already checked)
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      // Orphan cleanup
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath])
      return { success: false, error: `Tipe file '${mimeType}' tidak didukung.` }
    }

    if (fileSize > MAX_FILE_SIZE) {
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath])
      return { success: false, error: `Ukuran file (${(fileSize / (1024 * 1024)).toFixed(2)}MB) melebihi batas 10MB.` }
    }

    // Validate document name
    const trimmedName = documentName?.trim()
    if (!trimmedName) {
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath])
      return { success: false, error: 'Nama dokumen tidak boleh kosong.' }
    }

    // Determine next sort_order for this user (max + 1)
    let nextSortOrder: number | null = null
    try {
      const { data: maxOrderData, error: maxOrderError } = await supabase
        .from('documents')
        .select('sort_order')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!maxOrderError && maxOrderData) {
        nextSortOrder = maxOrderData.sort_order != null ? maxOrderData.sort_order + 1 : 1
      } else if (!maxOrderError) {
        nextSortOrder = 1
      }
    } catch {
      nextSortOrder = null
    }

    const baseInsertPayload = {
      user_id: user.id,
      document_name: trimmedName,
      original_filename: originalFilename,
      storage_path: storagePath,
      mime_type: mimeType,
      file_size: fileSize,
    }

    let dbData: DocumentRow | null = null
    let dbError: { message: string } | null = null

    if (nextSortOrder !== null) {
      const resultWithOrder = await supabase
        .from('documents')
        .insert({ ...baseInsertPayload, sort_order: nextSortOrder })
        .select()
        .single()

      dbData = resultWithOrder.data
      dbError = resultWithOrder.error
    }

    // Fallback: sort_order column not yet in schema cache
    if (!dbData && (nextSortOrder === null || (dbError && dbError.message.includes('sort_order')))) {
      const fallbackResult = await supabase
        .from('documents')
        .insert(baseInsertPayload)
        .select()
        .single()

      dbData = fallbackResult.data
      dbError = fallbackResult.error
    }

    if (dbError || !dbData) {
      // Rollback: delete the already-uploaded file so it doesn't become an orphan
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath])
      return { success: false, error: `Gagal menyimpan metadata dokumen: ${dbError?.message}` }
    }

    revalidatePath('/manajemen-dokumen')
    revalidatePath('/kirim-lamaran')
    return { success: true, data: dbData }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan metadata dokumen.',
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

/**
 * Server Action: Batch update sort_order for a user's documents
 */
export async function updateDocumentOrdersAction(
  orders: { id: string; sort_order: number }[]
): Promise<ActionResponse<null>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Sesi login telah berakhir. Silakan login kembali.' }
    }

    if (!Array.isArray(orders) || orders.length === 0) {
      return { success: false, error: 'Data urutan dokumen kosong.' }
    }

    // Validate each entry
    for (const item of orders) {
      if (!item.id || typeof item.id !== 'string') {
        return { success: false, error: 'ID dokumen tidak valid.' }
      }
      if (!Number.isInteger(item.sort_order) || item.sort_order <= 0) {
        return { success: false, error: 'Nomor urutan harus berupa bilangan bulat positif (minimal 1).' }
      }
    }

    // Validate no duplicates
    const orderNums = orders.map((o) => o.sort_order)
    if (new Set(orderNums).size !== orderNums.length) {
      return { success: false, error: 'Terdapat nomor urutan yang sama (duplikat). Setiap dokumen harus memiliki nomor urutan yang berbeda.' }
    }

    // Validate sequential starting from 1
    const sortedNums = [...orderNums].sort((a, b) => a - b)
    if (sortedNums[0] !== 1) {
      return { success: false, error: `Nomor urutan harus dimulai dari angka 1 (saat ini dimulai dari ${sortedNums[0]}).` }
    }
    for (let i = 0; i < sortedNums.length; i++) {
      if (sortedNums[i] !== i + 1) {
        return { success: false, error: `Nomor urutan harus berurutan tanpa celah. Ditemukan celah pada nomor ${i + 1}.` }
      }
    }

    // Verify all document IDs belong to current user
    const docIds = orders.map((o) => o.id)
    const { data: userDocs, error: fetchError } = await supabase
      .from('documents')
      .select('id')
      .in('id', docIds)
      .eq('user_id', user.id)

    if (fetchError) {
      return { success: false, error: `Gagal memverifikasi dokumen: ${fetchError.message}` }
    }

    if (!userDocs || userDocs.length !== docIds.length) {
      return { success: false, error: 'Beberapa dokumen tidak ditemukan atau tidak memiliki akses.' }
    }

    // Batch update sort_order per document
    for (const item of orders) {
      const { error: updateError } = await supabase
        .from('documents')
        .update({ sort_order: item.sort_order })
        .eq('id', item.id)
        .eq('user_id', user.id)

      if (updateError) {
        return { success: false, error: `Gagal memperbarui urutan dokumen: ${updateError.message}` }
      }
    }

    revalidatePath('/manajemen-dokumen')
    revalidatePath('/kirim-lamaran')
    return { success: true, data: null }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal menyimpan urutan dokumen.',
    }
  }
}

