'use client'

import * as React from 'react'
import { useActionState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Send, Lock, Mail, Eye, EyeOff, Loader2, KeyRound } from 'lucide-react'
import { loginAction, type AuthState } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { GoogleAuthButton } from '@/components/auth/google-auth-button'
import { Footer } from '@/components/layout/footer'

const initialState: AuthState = {
  error: null,
}

function LoginFormContent() {
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')

  const [state, formAction, isPending] = useActionState(loginAction, initialState)
  const [showPassword, setShowPassword] = React.useState(false)

  const activeError = state?.error || urlError

  return (
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
          Aplikasi personal untuk otomatisasi pengiriman lamaran kerja via Supabase & Gmail API
        </p>
      </div>

      {/* Login Card */}
      <Card className="border-border/80 shadow-sm backdrop-blur-sm bg-card/90">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-lg font-semibold text-foreground">
            Masuk ke Akun
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Pilih masuk dengan akun Google atau masukkan email dan kata sandi Anda
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Google OAuth Button */}
          <GoogleAuthButton label="Masuk dengan Google" />

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/70" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                atau masuk dengan email
              </span>
            </div>
          </div>

          {/* Error Message */}
          {activeError && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in-50 space-y-1.5">
              <p>{activeError}</p>
              {state?.unconfirmedEmail && (
                <div className="pt-1">
                  <Link
                    href={`/verify-otp?email=${encodeURIComponent(state.unconfirmedEmail)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary underline"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    <span>Verifikasi Kode OTP Sekarang &rarr;</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">
                Email
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium">
                  Kata Sandi
                </Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••"
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

            <Button
              type="submit"
              className="w-full h-9 font-medium text-xs sm:text-sm shadow-xs mt-2"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>Masuk ke Dashboard</span>
              )}
            </Button>
          </form>

          {/* Registration Link */}
          <div className="text-center pt-2 border-t border-border/50 text-xs text-muted-foreground">
            Belum punya akun?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Daftar di sini
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Security & RLS notice */}
      <div className="text-center text-[11px] text-muted-foreground space-y-1">
        <p>Dilindungi oleh Supabase Row-Level Security (RLS) & enkripsi sesi SSL.</p>
        <p>
          <Link href="/privacy" className="underline hover:text-foreground transition-colors">
            Kebijakan Privasi
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Top Navigation bar with Theme Toggle */}
      <div className="w-full flex items-center justify-end p-4 sm:p-6">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <Suspense
          fallback={
            <div className="w-full max-w-md p-8 rounded-xl border border-border bg-card flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Memuat halaman login...</p>
            </div>
          }
        >
          <LoginFormContent />
        </Suspense>
      </div>

      <Footer variant="compact" />
    </div>
  )
}
