'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type {
  EmailSettingsRow,
  EmailSettingsInsert,
  EmailTemplateRow,
  EmailTemplateInsert,
  EmailTemplateUpdate,
  TemplateLayoutConfig,
} from '@/types/config'
import type { ActionResponse } from '@/app/actions/documents'

/**
 * Save or update user's email sender identity and default message/subject in email_settings
 */
export async function saveEmailSettingsAction(payload: {
  sender_name: string
  sender_email: string
  default_subject?: string
  default_message?: string
}): Promise<ActionResponse<EmailSettingsRow>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Sesi login telah berakhir. Silakan login kembali.' }
    }

    const senderName = payload.sender_name?.trim()
    const senderEmail = payload.sender_email?.trim()

    if (!senderName) {
      return { success: false, error: 'Nama pengirim wajib diisi.' }
    }

    if (!senderEmail || !senderEmail.includes('@')) {
      return { success: false, error: 'Format email pengirim tidak valid.' }
    }

    const { data, error } = await supabase
      .from('email_settings')
      .upsert(
        {
          user_id: user.id,
          sender_name: senderName,
          sender_email: senderEmail,
          default_subject: payload.default_subject?.trim() || null,
          default_message: payload.default_message || null,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (error) {
      return { success: false, error: `Gagal menyimpan konfigurasi email: ${error.message}` }
    }

    revalidatePath('/konfigurasi-email')
    return { success: true, data }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan pengaturan.',
    }
  }
}

/**
 * Create a new email template in email_templates
 */
export async function createTemplateAction(payload: {
  template_name: string
  subject: string
  message: string
  is_default: boolean
  layout_config?: TemplateLayoutConfig | null
}): Promise<ActionResponse<EmailTemplateRow>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Sesi login telah berakhir.' }
    }

    const templateName = payload.template_name?.trim()
    const subject = payload.subject?.trim()
    const message = payload.message?.trim()

    if (!templateName) {
      return { success: false, error: 'Nama template wajib diisi.' }
    }
    if (!subject) {
      return { success: false, error: 'Subject email wajib diisi.' }
    }
    if (!message) {
      return { success: false, error: 'Isi pesan template wajib diisi.' }
    }

    // Constraint: Only ONE default template per user
    if (payload.is_default) {
      await supabase
        .from('email_templates')
        .update({ is_default: false })
        .eq('user_id', user.id)
    }

    let { data, error } = await supabase
      .from('email_templates')
      .insert({
        user_id: user.id,
        template_name: templateName,
        subject,
        message: payload.message,
        is_default: payload.is_default,
        layout_config: (payload.layout_config as any) || null,
      })
      .select()
      .single()

    // Graceful fallback if layout_config column is not in PostgREST schema cache yet
    if (error && error.message.includes('layout_config')) {
      const fallback = await supabase
        .from('email_templates')
        .insert({
          user_id: user.id,
          template_name: templateName,
          subject,
          message: payload.message,
          is_default: payload.is_default,
        })
        .select()
        .single()

      data = fallback.data
      error = fallback.error
    }

    if (error) {
      return { success: false, error: `Gagal membuat template: ${error.message}` }
    }

    revalidatePath('/konfigurasi-email')
    return { success: true, data: data as unknown as EmailTemplateRow }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal membuat template email.',
    }
  }
}

/**
 * Update an existing email template
 */
export async function updateTemplateAction(
  id: string,
  payload: {
    template_name: string
    subject: string
    message: string
    is_default: boolean
    layout_config?: TemplateLayoutConfig | null
  }
): Promise<ActionResponse<EmailTemplateRow>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Sesi login telah berakhir.' }
    }

    const templateName = payload.template_name?.trim()
    const subject = payload.subject?.trim()
    const message = payload.message?.trim()

    if (!templateName) {
      return { success: false, error: 'Nama template wajib diisi.' }
    }
    if (!subject) {
      return { success: false, error: 'Subject email wajib diisi.' }
    }
    if (!message) {
      return { success: false, error: 'Isi pesan template wajib diisi.' }
    }

    // Constraint: Only ONE default template per user
    if (payload.is_default) {
      await supabase
        .from('email_templates')
        .update({ is_default: false })
        .eq('user_id', user.id)
    }

    let { data, error } = await supabase
      .from('email_templates')
      .update({
        template_name: templateName,
        subject,
        message: payload.message,
        is_default: payload.is_default,
        layout_config: (payload.layout_config as any) || null,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    // Graceful fallback if layout_config column is not in PostgREST schema cache yet
    if (error && error.message.includes('layout_config')) {
      const fallback = await supabase
        .from('email_templates')
        .update({
          template_name: templateName,
          subject,
          message: payload.message,
          is_default: payload.is_default,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      data = fallback.data
      error = fallback.error
    }

    if (error) {
      return { success: false, error: `Gagal memperbarui template: ${error.message}` }
    }

    revalidatePath('/konfigurasi-email')
    return { success: true, data: data as unknown as EmailTemplateRow }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal memperbarui template.',
    }
  }
}

/**
 * Set a template as the default template
 */
export async function setDefaultTemplateAction(id: string): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Sesi login telah berakhir.' }
    }

    // 1. Clear default on all templates for this user
    await supabase
      .from('email_templates')
      .update({ is_default: false })
      .eq('user_id', user.id)

    // 2. Set this template as default
    const { error } = await supabase
      .from('email_templates')
      .update({ is_default: true })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: `Gagal menjadikan template default: ${error.message}` }
    }

    revalidatePath('/konfigurasi-email')
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal mengubah status template default.',
    }
  }
}

/**
 * Delete a template from email_templates
 */
export async function deleteTemplateAction(id: string): Promise<ActionResponse<{ id: string }>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Sesi login telah berakhir.' }
    }

    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: `Gagal menghapus template: ${error.message}` }
    }

    revalidatePath('/konfigurasi-email')
    return { success: true, data: { id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal menghapus template.',
    }
  }
}

