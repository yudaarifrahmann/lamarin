'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResponse } from '@/app/actions/documents'

/**
 * Server Action: Delete an email log entry
 */
export async function deleteApplicationLogAction(id: string): Promise<ActionResponse<{ id: string }>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Sesi login telah berakhir.' }
    }

    const { error } = await supabase
      .from('email_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: `Gagal menghapus riwayat lamaran: ${error.message}` }
    }

    revalidatePath('/riwayat-lamaran')
    revalidatePath('/')
    return { success: true, data: { id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat menghapus log.',
    }
  }
}

