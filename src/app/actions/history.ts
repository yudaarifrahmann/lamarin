'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResponse } from '@/app/actions/documents'
import type { ApplicationOutcomeStatus } from '@/types/application'

/**
 * Server Action: Update the manual application outcome status ('pending' | 'accepted' | 'rejected')
 */
export async function updateApplicationStatusAction(
  id: string,
  status: ApplicationOutcomeStatus
): Promise<ActionResponse<{ id: string; status: ApplicationOutcomeStatus }>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Sesi login telah berakhir. Silakan login kembali.' }
    }

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return { success: false, error: 'Status hasil lamaran tidak valid.' }
    }

    const { error } = await supabase
      .from('email_logs')
      .update({ application_status: status })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      if (error.message.includes('application_status') || error.message.includes('schema cache')) {
        return {
          success: false,
          error:
            'Kolom "application_status" belum ada di database Supabase. Silakan jalankan script migrasi SQL di Supabase SQL Editor.',
        }
      }
      return { success: false, error: `Gagal memperbarui status hasil lamaran: ${error.message}` }
    }

    revalidatePath('/riwayat-lamaran')
    revalidatePath('/')
    return { success: true, data: { id, status } }
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan sistem saat memperbarui status lamaran.',
    }
  }
}

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
