'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Unlink,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { formatDate } from '@/lib/format'
import { disconnectGmailAction } from '@/app/actions/gmail'
import type { GmailConnectionStatus } from '@/types/gmail'
import { cn } from '@/lib/utils'

interface GmailConnectionCardProps {
  initialStatus: GmailConnectionStatus
}

export function GmailConnectionCard({ initialStatus }: GmailConnectionCardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = React.useState<GmailConnectionStatus>(initialStatus)
  const [isDisconnecting, setIsDisconnecting] = React.useState(false)
  const [confirmDisconnect, setConfirmDisconnect] = React.useState(false)

  // Handle URL callback parameters feedback
  React.useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success === 'gmail_connected') {
      toast.success('Akun Gmail berhasil terhubung via OAuth 2.0!')
      // Clean query params from URL
      router.replace('/konfigurasi-email')
    } else if (error) {
      let message = 'Gagal menghubungkan akun Gmail.'
      if (error === 'google_access_denied') {
        message = 'Otorisasi Gmail dibatalkan oleh pengguna.'
      } else if (error === 'invalid_csrf_state') {
        message = 'Validasi keamanan CSRF gagal. Silakan coba klik tombol Hubungkan kembali.'
      } else if (error === 'credentials_missing') {
        message = 'Kredensial GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET belum dikonfigurasi di server.'
      } else if (error === 'no_refresh_token') {
        message = 'Google tidak mengembalikan refresh token. Pastikan opsi consent disetujui.'
      }
      toast.error(message)
      router.replace('/konfigurasi-email')
    }
  }, [searchParams, router])

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      const result = await disconnectGmailAction()
      if (result.success) {
        setStatus({ isConnected: false })
        setConfirmDisconnect(false)
        toast.success('Koneksi akun Gmail berhasil diputuskan.')
      } else {
        toast.error(result.error || 'Gagal memutuskan koneksi Gmail.')
      }
    } catch {
      toast.error('Terjadi kesalahan saat memutuskan koneksi Gmail.')
    } finally {
      setIsDisconnecting(false)
    }
  }

  return (
    <Card className="border-border/80 bg-card">
      <CardHeader className="pb-3 border-b border-border/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold text-foreground">
              Koneksi Akun Gmail (OAuth 2.0)
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Hubungkan akun Gmail pribadi Anda untuk mengirimkan email lamaran kerja resmi secara langsung
          </CardDescription>
        </div>

        <div>
          {status.isConnected ? (
            <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-xs gap-1.5 px-2.5 py-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Gmail Terhubung</span>
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs gap-1 px-2.5 py-1 text-muted-foreground">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Belum Terhubung</span>
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-4">
        {status.isConnected ? (
          /* Connected State */
          <div className="space-y-4">
            <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
                <span className="text-xs text-muted-foreground font-medium">
                  Alamat Gmail Terhubung:
                </span>
                <span className="text-sm font-semibold text-foreground font-mono">
                  {status.gmailEmail}
                </span>
              </div>

              {status.connectedAt && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground font-medium">
                    Waktu Terhubung:
                  </span>
                  <span className="text-muted-foreground font-mono">
                    {formatDate(status.connectedAt)}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Refresh token tersimpan aman dengan enkripsi AES-256-GCM di server.
                </span>
              </div>
            </div>

            {/* Actions for connected state */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <a
                href="/api/auth/gmail"
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5 text-xs')}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Hubungkan Ulang Akun</span>
              </a>

              {confirmDisconnect ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Yakin putuskan?</span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={isDisconnecting}
                    onClick={handleDisconnect}
                    className="h-8 text-xs gap-1"
                  >
                    {isDisconnecting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Unlink className="h-3.5 w-3.5" />
                    )}
                    <span>Ya, Putuskan</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isDisconnecting}
                    onClick={() => setConfirmDisconnect(false)}
                    className="h-8 text-xs"
                  >
                    Batal
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDisconnect(true)}
                  className="text-xs text-muted-foreground hover:text-destructive gap-1.5 h-8"
                >
                  <Unlink className="h-3.5 w-3.5" />
                  <span>Putuskan Koneksi</span>
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* Disconnected State */
          <div className="space-y-4">
            <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-2 text-xs text-muted-foreground leading-relaxed">
              <p className="font-medium text-foreground">
                Kirim lamaran kerja langsung dari akun Gmail pribadi Anda:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground/90 pl-1">
                <li>Menggunakan Google OAuth 2.0 resmi dengan otorisasi aman (scope <code className="text-foreground font-mono">gmail.send</code>).</li>
                <li>Refresh token dienkripsi menggunakan standar militer <strong>AES-256-GCM</strong> di sisi server.</li>
                <li>Email lamaran kerja yang dikirim akan otomatis masuk ke folder <em>Terkirim (Sent)</em> di akun Gmail Anda.</li>
              </ul>
            </div>

            <div className="pt-1">
              <a
                href="/api/auth/gmail"
                className={cn(
                  buttonVariants({ size: 'default' }),
                  'gap-2 shadow-xs font-semibold'
                )}
              >
                <Mail className="h-4 w-4" />
                <span>Hubungkan Gmail</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </a>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

