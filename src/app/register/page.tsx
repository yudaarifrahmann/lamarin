'use client'

import * as React from 'react'
import { useActionState } from 'react'
import Link from 'next/link'
import { Send, Lock, Mail, User, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { registerAction, type AuthState } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { GoogleAuthButton } from '@/components/auth/google-auth-button'

const initialState: AuthState = {
  error: null,
}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Top Navigation bar with Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6 animate-in fade-in-50 duration-300">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-md mb-1">
            <Send className="h-6 w-6" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              lamarin
            </h1>
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-normal">
              Private Mailer
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xs">
            Daftar akun baru untuk mulai mengirim lamaran kerja otomatis melalui Gmail API
          </p>
        </div>

        {/* Register Card */}
        <Card className="border-border/80 shadow-sm backdrop-blur-sm bg-card/90">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-semibold text-foreground">
              Daftar Akun Baru
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Pilih pendaftaran menggunakan Google atau isi formulir di bawah ini
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Google OAuth Button */}
            <GoogleAuthButton label="Daftar dengan Google" />

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/70" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  atau daftar dengan email
                </span>
              </div>
            </div>

            {/* Error Message */}
            {state?.error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in-50">
                {state.error}
              </div>
            )}

            {/* Registration Form */}
            <form action={formAction} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="full_name" className="text-xs font-medium">
                  Nama Lengkap <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    required
                    placeholder="Contoh: Budi Pratama"
                    className="pl-9 text-xs sm:text-sm h-9"
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium">
                  Alamat Email <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="nama@domain.com"
                    className="pl-9 text-xs sm:text-sm h-9"
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium">
                  Kata Sandi <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    placeholder="Minimal 6 karakter"
                    className="pl-9 pr-9 text-xs sm:text-sm h-9 font-mono"
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm_password" className="text-xs font-medium">
                  Konfirmasi Kata Sandi <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    placeholder="Ulangi kata sandi"
                    className="pl-9 pr-9 text-xs sm:text-sm h-9 font-mono"
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi kata sandi' : 'Tampilkan konfirmasi kata sandi'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-9 font-medium text-xs sm:text-sm shadow-xs mt-3"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Mendaftarkan & Mengirim OTP...</span>
                  </>
                ) : (
                  <span>Daftar & Kirim Kode OTP</span>
                )}
              </Button>
            </form>

            {/* Back to Login Link */}
            <div className="text-center pt-2 border-t border-border/50 text-xs text-muted-foreground">
              Sudah punya akun?{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Masuk di sini
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Security & RLS notice */}
        <p className="text-center text-[11px] text-muted-foreground">
          Dilindungi oleh Supabase Row-Level Security (RLS) & OTP email resmi.
        </p>
      </div>
    </div>
  )
}

