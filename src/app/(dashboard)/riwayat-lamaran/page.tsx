import * as React from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, History, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { ApplicationHistoryList } from '@/components/history/application-history-list'
import type { EmailLogRow } from '@/types/application'
import { cn } from '@/lib/utils'

export const instant = false

export default async function RiwayatLamaranPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let logs: EmailLogRow[] = []
  let statsTotal = 0
  let statsSent = 0
  let statsFailed = 0
  let statsQueued = 0

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
      statsFailed = logs.filter((l) => l.status === 'failed' || l.status === 'bounced').length
      statsQueued = logs.filter((l) => l.status === 'queued').length
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
            Log lengkap lamaran kerja yang telah dikirim beserta status pengiriman email.
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

      {/* Stats Row */}
      {statsTotal > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-border/70 bg-card p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <History className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Total Lamaran</p>
              <p className="text-lg font-bold text-foreground">{statsTotal}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 shrink-0">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Terkirim</p>
              <p className="text-lg font-bold text-foreground">{statsSent}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 shrink-0">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Diproses</p>
              <p className="text-lg font-bold text-foreground">{statsQueued}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-3.5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10 shrink-0">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Gagal</p>
              <p className="text-lg font-bold text-foreground">{statsFailed}</p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive List (Client Component) */}
      <ApplicationHistoryList initialLogs={logs} />
    </div>
  )
}
