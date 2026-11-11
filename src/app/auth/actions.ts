'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export interface AuthState {
  error: string | null
  unconfirmedEmail?: string
  success?: boolean
}

/**
 * Server Action: Login with Email & Password
 */
export async function loginAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email dan kata sandi wajib diisi.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Email atau kata sandi tidak sesuai. Silakan periksa kembali.' }
    }
    if (error.message.includes('Email not confirmed')) {
      return {
        error: 'Email Anda belum diverifikasi. Silakan masukkan kode OTP yang telah dikirim ke email Anda.',
        unconfirmedEmail: email,
      }
    }
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

/**
 * Server Action: Register new user with Email, Password & Full Name
 * Initiates Supabase OTP email verification.
 */
export async function registerAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const fullName = (formData.get('full_name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (!fullName || !email || !password || !confirmPassword) {
    return { error: 'Seluruh kolom wajib diisi.' }
  }

  if (fullName.length < 2) {
    return { error: 'Nama lengkap minimal 2 karakter.' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { error: 'Format alamat email tidak valid.' }
  }

  if (password.length < 6) {
    return { error: 'Kata sandi minimal 6 karakter.' }
  }

  if (password !== confirmPassword) {
    return { error: 'Konfirmasi kata sandi tidak cocok. Silakan ketik ulang kata sandi.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    if (
      error.message.toLowerCase().includes('already registered') ||
      error.message.toLowerCase().includes('already exists')
    ) {
      return { error: 'Alamat email ini sudah terdaftar. Silakan login ke akun Anda.' }
    }
    return { error: error.message }
  }

  // Supabase returns user with empty identities if user already exists (anti-enumeration)
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { error: 'Alamat email ini sudah terdaftar. Silakan login ke akun Anda.' }
  }

  // If email confirmation is disabled in Supabase, user gets immediate session
  if (data.session) {
    revalidatePath('/', 'layout')
    redirect('/')
  }

  // Redirect to OTP verification page
  redirect(`/verify-otp?email=${encodeURIComponent(email)}&sent=true`)
}

/**
 * Server Action: Verify OTP code from email
 */
export async function verifyOtpAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const token = (formData.get('token') as string)?.trim()

  if (!email || !token) {
    return { error: 'Alamat email dan kode OTP wajib diisi.' }
  }

  if (token.length !== 6) {
    return { error: 'Kode OTP harus berjumlah 6 digit angka.' }
  }

  const supabase = await createClient()

  // Verify OTP as signup confirmation
  let { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup',
  })

  // Fallback to type 'email' if needed
  if (error) {
    const fallback = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })
    error = fallback.error
  }

  if (error) {
    if (
      error.message.toLowerCase().includes('expired') ||
      error.message.toLowerCase().includes('invalid') ||
      error.message.toLowerCase().includes('token')
    ) {
      return { error: 'Kode OTP tidak valid atau telah kedaluwarsa. Silakan periksa kembali atau minta kode baru.' }
    }
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

/**
 * Server Action: Resend OTP code to user's email
 */
export async function resendOtpAction(email: string): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email?.trim().toLowerCase()
  if (!cleanEmail) {
    return { success: false, error: 'Alamat email tidak valid.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: cleanEmail,
  })

  if (error) {
    // If rate-limited or failed
    if (error.message.toLowerCase().includes('rate')) {
      return { success: false, error: 'Terlalu banyak permintaan pengiriman OTP. Harap tunggu beberapa saat.' }
    }
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Server Action: Logout user
 */
export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
