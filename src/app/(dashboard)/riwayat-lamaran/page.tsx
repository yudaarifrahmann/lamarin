import * as React from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, History, CheckCircle2, Clock, XCircle, MailCheck } from 'lucide-react'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { ApplicationHistoryList } from '@/components/history/application-history-list'
import type { EmailLogRow } from '@/types/application'
import { cn } from '@/lib/utils'

export const instant = false

export default async function RiwayatLamaranPage() {
  await connection()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let logs: EmailLogRow[] = []
  let statsTotal = 0
  let statsSent = 0
  let statsPending = 0
  let statsAccepted = 0
  let statsRejected = 0

  if (user) {
    const { data } = await supabase
      .from('email_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      logs = data as EmailLogRow[]
      statsTotal = logs.length
      statsSent = logs.filter((l) => l.status === 'sent' || l.status === 'delivered').length
      statsPending = logs.filter((l) => (l.application_status || 'pending') === 'pending').length
      statsAccepted = logs.filter((l) => l.application_status === 'accepted').length
      statsRejected = logs.filter((l) => l.application_status === 'rejected').length
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-xs font-medium text-foreground">Riwayat Lamaran</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Riwayat Lamaran
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Kelola perkembangan hasil lamaran dan pantau status pengiriman email lamaran Anda.
          </p>
        </div>

        <Link
          href="/kirim-lamaran"
          className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5 shadow-xs w-fit shrink-0')}
        >
          <Send className="h-3.5 w-3.5" />
          <span>Kirim Lamaran Baru</span>
        </Link>
      </div>

      {/* Stats Row (Status Pengiriman & Status Hasil Lamaran) */}
      {statsTotal > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Total */}
          <div className="rounded-xl border border-border/70 bg-card p-3 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <History className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground truncate">Total Lamaran</p>
              <p className="text-lg font-bold text-foreground">{statsTotal}</p>
            </div>
          </div>

          {/* Email Terkirim (Status Pengiriman) */}
          <div className="rounded-xl border border-border/70 bg-card p-3 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 shrink-0">
              <MailCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground truncate">Email Terkirim</p>
              <p className="text-lg font-bold text-foreground">{statsSent}</p>
            </div>
          </div>

          {/* Pending (Status Hasil) */}
          <div className="rounded-xl border border-border/70 bg-card p-3 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 shrink-0">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground truncate">Hasil: Pending</p>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{statsPending}</p>
            </div>
          </div>

          {/* Diterima (Status Hasil) */}
          <div className="rounded-xl border border-border/70 bg-card p-3 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 shrink-0">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground truncate">Hasil: Diterima</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{statsAccepted}</p>
            </div>
          </div>

          {/* Ditolak (Status Hasil) */}
          <div className="rounded-xl border border-border/70 bg-card p-3 flex items-center gap-2.5 col-span-2 sm:col-span-1">
            <div className="p-2 rounded-lg bg-destructive/10 shrink-0">
              <XCircle className="h-4 w-4 text-destructive" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground truncate">Hasil: Ditolak</p>
              <p className="text-lg font-bold text-destructive">{statsRejected}</p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive List (Client Component) */}
      <ApplicationHistoryList initialLogs={logs} />
    </div>
  )
}
