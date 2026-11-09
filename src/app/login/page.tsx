'use client'

import * as React from 'react'
import { useActionState } from 'react'
import { Send, Lock, Mail, Eye, EyeOff, Loader2, ShieldAlert } from 'lucide-react'
import { loginAction, type AuthState } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme/theme-toggle'

const initialState: AuthState = {
  error: null,
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState)
  const [showPassword, setShowPassword] = React.useState(false)

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
              Gunakan email dan kata sandi yang telah didaftarkan di Supabase
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Private Access Notice */}
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-400">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Akses Terbatas:</strong> Registrasi publik tidak dibuka. Akun pemilik dikelola langsung melalui Supabase Dashboard (Auth Users).
              </p>
            </div>

            {/* Error Message */}
            {state?.error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in-50">
                {state.error}
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
          </CardContent>
        </Card>

        {/* Security & RLS notice */}
        <p className="text-center text-[11px] text-muted-foreground">
          Dilindungi oleh Supabase Row-Level Security (RLS) & enkripsi sesi SSL.
        </p>
      </div>
    </div>
  )
}

