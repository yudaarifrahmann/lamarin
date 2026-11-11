'use client'

import * as React from 'react'
import Link from 'next/link'
import { Send, Shield, Lock, FileText, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FooterProps {
  className?: string
  variant?: 'default' | 'compact'
}

export function Footer({ className, variant = 'default' }: FooterProps) {
  const [currentYear, setCurrentYear] = React.useState<number | string>(2026)

  React.useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  if (variant === 'compact') {
    return (
      <footer className={cn('py-4 px-4 text-center border-t border-border/50 text-xs text-muted-foreground', className)}>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span>&copy; {currentYear} Lamarin</span>
          <span>&bull;</span>
          <Link
            href="/privacy"
            className="hover:text-foreground underline underline-offset-4 transition-colors font-medium inline-flex items-center gap-1"
          >
            <Shield className="h-3 w-3 text-primary" />
            <span>Kebijakan Privasi (Privacy Policy)</span>
          </Link>
          <span>&bull;</span>
          <span className="inline-flex items-center gap-1 text-[11px]">
            <Lock className="h-2.5 w-2.5 text-primary" />
            <span>AES-256-GCM &amp; Supabase RLS</span>
          </span>
        </div>
      </footer>
    )
  }

  return (
    <footer className={cn('border-t border-border/60 bg-muted/20 py-8 px-4 sm:px-6 lg:px-8 mt-auto', className)}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Description */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-xs">
              <Send className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground">
              lamarin
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              Personal Mailer
            </span>
          </div>
          <p className="text-xs text-muted-foreground max-w-sm">
            Otomatisasi pengiriman lamaran kerja resmi via Google Gmail API dan Supabase PostgreSQL dengan enkripsi keamanan tingkat tinggi.
          </p>
        </div>

        {/* Links & Legal */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <Link
            href="/"
            className="hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/kirim-lamaran"
            className="hover:text-foreground transition-colors"
          >
            Kirim Lamaran
          </Link>
          <Link
            href="/manajemen-dokumen"
            className="hover:text-foreground transition-colors"
          >
            Dokumen
          </Link>
          <Link
            href="/konfigurasi-email"
            className="hover:text-foreground transition-colors"
          >
            Konfigurasi
          </Link>
          <Link
            href="/riwayat-lamaran"
            className="hover:text-foreground transition-colors"
          >
            Riwayat
          </Link>
          <Link
            href="/privacy"
            className="font-medium text-foreground hover:text-primary transition-colors inline-flex items-center gap-1 underline underline-offset-4"
          >
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span>Kebijakan Privasi (Privacy Policy)</span>
          </Link>
        </div>
      </div>

      {/* Bottom Legal bar */}
      <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground">
        <p>
          &copy; {currentYear} Lamarin. Seluruh hak cipta dilindungi.
        </p>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <Lock className="h-3 w-3 text-emerald-500" />
            <span>Token Terenkripsi AES-256-GCM</span>
          </span>
          <span>&bull;</span>
          <span className="inline-flex items-center gap-1">
            <Shield className="h-3 w-3 text-primary" />
            <span>Google Limited Use Compliant</span>
          </span>
        </div>
      </div>
    </footer>
  )
}

