'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResponse } from '@/app/actions/documents'
import type { GmailConnectionStatus } from '@/types/gmail'

/**
 * Fetch Gmail connection status for the authenticated user
 * Never returns the encrypted refresh token to the frontend
 */
export async function getGmailConnectionStatusAction(): Promise<ActionResponse<GmailConnectionStatus>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Sesi login tidak valid.' }
    }

    const { data: connection, error } = await supabase
      .from('gmail_connections')
      .select('gmail_email, connected_at')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      return { success: false, error: `Gagal memuat status Gmail: ${error.message}` }
    }

    if (!connection) {
      return {
        success: true,
        data: {
          isConnected: false,
        },
      }
    }

    return {
      success: true,
      data: {
        isConnected: true,
        gmailEmail: connection.gmail_email,
        connectedAt: connection.connected_at,
      },
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat memeriksa status Gmail.',
    }
  }
}

/**
 * Disconnect/remove Gmail OAuth connection for authenticated user
 */
export async function disconnectGmailAction(): Promise<ActionResponse<{ disconnected: boolean }>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Sesi login tidak valid.' }
    }

    const { error } = await supabase
      .from('gmail_connections')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: `Gagal memutuskan koneksi Gmail: ${error.message}` }
    }

    revalidatePath('/konfigurasi-email')
    revalidatePath('/')
    revalidatePath('/kirim-lamaran')

    return { success: true, data: { disconnected: true } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat memutuskan Gmail.',
    }
  }
}

