'use client'

import * as React from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    // Log safe error in production
    console.error('Dashboard runtime error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 rounded-2xl border border-border/80 bg-card p-6 sm:p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mx-auto border border-destructive/20">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Terjadi Kesalahan
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Sistem mendapati kendala saat memuat data. Silakan coba muat ulang atau kembali ke halaman utama dashboard.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-muted-foreground/60 pt-1">
              Kode referensi error: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => reset()}
            className="w-full sm:w-auto gap-1.5 shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Coba Lagi</span>
          </Button>

          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'w-full sm:w-auto gap-1.5'
            )}
          >
            <Home className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

