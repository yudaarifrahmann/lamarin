import { createClient } from '@/lib/supabase/client'
import type { DocumentRow } from '@/types/document'

const STORAGE_BUCKET = 'application-documents'

export const documentService = {
  /**
   * Fetch all documents for the current authenticated user
   */
  async getDocuments(): Promise<{ data: DocumentRow[] | null; error: Error | null }> {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { data: null, error: new Error('Pengguna belum terautentikasi.') }
    }

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return { data, error: error ? new Error(error.message) : null }
  },

  /**
   * Upload file to Supabase Storage bucket 'application-documents' and register in database
   */
  async uploadDocument(
    file: File,
    documentName: string
  ): Promise<{ data: DocumentRow | null; error: Error | null }> {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { data: null, error: new Error('Pengguna belum terautentikasi.') }
    }

    const fileExt = file.name.split('.').pop()
    const storagePath = `${user.id}/${Date.now()}-${file.name}`

    // 1. Upload to Supabase Storage bucket 'application-documents'
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file)

    if (uploadError) {
      return { data: null, error: new Error(uploadError.message) }
    }

    // 2. Insert record in documents table
    const { data, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        document_name: documentName,
        original_filename: file.name,
        storage_path: storagePath,
        mime_type: file.type || `application/${fileExt}`,
        file_size: file.size,
      })
      .select()
      .single()

    return { data, error: dbError ? new Error(dbError.message) : null }
  },

  /**
   * Delete document from storage and database for authenticated user
   */
  async deleteDocument(id: string, storagePath: string): Promise<{ success: boolean; error: Error | null }> {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: new Error('Pengguna belum terautentikasi.') }
    }

    // 1. Remove from storage
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath])

    if (storageError) {
      return { success: false, error: new Error(storageError.message) }
    }

    // 2. Remove from database
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    return { success: !dbError, error: dbError ? new Error(dbError.message) : null }
  },
}
