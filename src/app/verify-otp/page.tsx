'use client'

import * as React from 'react'
import { useActionState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Send, KeyRound, Mail, ArrowLeft, Loader2, RotateCcw, CheckCircle2 } from 'lucide-react'
import { verifyOtpAction, resendOtpAction, type AuthState } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { toast } from 'sonner'

const initialState: AuthState = {
  error: null,
}

const RESEND_COOLDOWN_SECONDS = 60

function VerifyOtpContent() {
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get('email') || ''
  const isJustSent = searchParams.get('sent') === 'true'

  const [email, setEmail] = React.useState(initialEmail)
  const [otpDigits, setOtpDigits] = React.useState(['', '', '', '', '', ''])
  const [countdown, setCountdown] = React.useState(isJustSent ? RESEND_COOLDOWN_SECONDS : 0)
  const [isResending, setIsResending] = React.useState(false)

  const [state, formAction, isPending] = useActionState(verifyOtpAction, initialState)
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer for resend OTP
  React.useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  // Focus first input on mount
  React.useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  // Handle individual digit input
  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric characters
    const cleanVal = value.replace(/\D/g, '')

    if (cleanVal.length > 1) {
      // Pasted multiple digits
      handlePasteDigits(cleanVal)
      return
    }

    const newDigits = [...otpDigits]
    newDigits[index] = cleanVal
    setOtpDigits(newDigits)

    // Auto-advance to next box
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      // Move focus back on backspace
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePasteDigits = (pastedText: string) => {
    const digits = pastedText.replace(/\D/g, '').slice(0, 6).split('')
    const newDigits = [...otpDigits]
    digits.forEach((d, i) => {
      newDigits[i] = d
    })
    setOtpDigits(newDigits)
    const nextIndex = Math.min(digits.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  const handleResendOtp = async () => {
    if (!email || countdown > 0 || isResending) return

    setIsResending(true)
    const result = await resendOtpAction(email)
    setIsResending(false)

    if (result.success) {
      toast.success('Kode OTP baru berhasil dikirim ke email Anda.')
      setCountdown(RESEND_COOLDOWN_SECONDS)
      setOtpDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } else {
      toast.error(result.error || 'Gagal mengirim ulang kode OTP.')
    }
  }

  const fullToken = otpDigits.join('')

  return (
    <div className="w-full max-w-md space-y-6 animate-in fade-in-50 duration-300">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-md mb-1">
          <KeyRound className="h-6 w-6" />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Verifikasi Email
          </h1>
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-normal">
            Supabase OTP
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xs">
          Masukkan 6 digit kode OTP yang telah dikirimkan ke alamat email Anda
        </p>
      </div>

      {/* Verification Card */}
      <Card className="border-border/80 shadow-sm backdrop-blur-sm bg-card/90">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-lg font-semibold text-foreground">
            Konfirmasi Kode OTP
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Kode verifikasi berlaku selama beberapa menit. Periksa folder Inbox atau Spam.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Target Email Banner */}
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 flex items-start gap-2.5 text-xs text-foreground">
            <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="text-muted-foreground text-[11px] block">Terkirim ke:</span>
              <strong className="font-mono text-xs break-all">{email || 'email@domain.com'}</strong>
            </div>
          </div>

          {/* Error Message */}
          {state?.error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in-50">
              {state.error}
            </div>
          )}

          {/* OTP Verification Form */}
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="token" value={fullToken} />

            <div className="space-y-2">
              <Label className="text-xs font-medium block text-center">
                6 Digit Kode OTP
              </Label>

              {/* 6 Individual Digit Inputs */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={(e) => {
                      e.preventDefault()
                      handlePasteDigits(e.clipboardData.getData('text'))
                    }}
                    disabled={isPending}
                    className="w-10 h-12 sm:w-11 sm:h-12 text-center text-lg sm:text-xl font-bold font-mono rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-2xs"
                  />
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending || fullToken.length !== 6}
              className="w-full h-10 font-semibold text-xs sm:text-sm shadow-xs mt-3"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Memverifikasi Kode OTP...</span>
                </>
              ) : (
                <span>Verifikasi & Masuk ke Dashboard</span>
              )}
            </Button>
          </form>

          {/* Resend OTP Section */}
          <div className="pt-3 border-t border-border/50 flex flex-col items-center justify-center gap-2 text-xs">
            <span className="text-muted-foreground">Tidak menerima kode?</span>
            {countdown > 0 ? (
              <span className="text-[11px] font-mono text-muted-foreground">
                Kirim ulang OTP dalam <strong>{countdown} detik</strong>
              </span>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResendOtp}
                disabled={isResending}
                className="h-8 text-xs gap-1.5"
              >
                {isResending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="h-3.5 w-3.5" />
                )}
                <span>Kirim Ulang Kode OTP</span>
              </Button>
            )}
          </div>

          {/* Navigation Links */}
          <div className="text-center pt-2 text-xs text-muted-foreground flex items-center justify-center gap-3">
            <Link href="/register" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
              <ArrowLeft className="h-3 w-3" />
              <span>Ganti Email / Daftar Ulang</span>
            </Link>
            <span>•</span>
            <Link href="/login" className="hover:text-foreground transition-colors font-medium">
              Halaman Login
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-[11px] text-muted-foreground space-y-1">
        <p>Autentikasi diamankan oleh protokol resmi Supabase OTP.</p>
        <p>
          <Link href="/privacy" className="underline hover:text-foreground transition-colors">
            Kebijakan Privasi
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Top Navigation bar with Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <Suspense
        fallback={
          <div className="w-full max-w-md p-8 rounded-xl border border-border bg-card flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Memuat halaman verifikasi...</p>
          </div>
        }
      >
        <VerifyOtpContent />
      </Suspense>
    </div>
  )
}

