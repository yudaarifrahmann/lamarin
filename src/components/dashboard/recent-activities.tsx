import * as React from 'react'
import Link from 'next/link'
import {
  Send,
  Building2,
  Briefcase,
  Mail,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Inbox,
  XCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { EmptyState } from '@/components/common/empty-state'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { EmailLogRow } from '@/types/application'

interface RecentActivitiesProps {
  logs: EmailLogRow[]
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'sent':
      return (
        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] gap-1 px-2 py-0.5">
          <CheckCircle2 className="h-3 w-3" />
          <span>Pengiriman: Terkirim</span>
        </Badge>
      )
    case 'queued':
      return (
        <Badge
          variant="secondary"
          className="bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] gap-1 px-2 py-0.5 border border-amber-500/30"
        >
          <Clock className="h-3 w-3" />
          <span>Pengiriman: Diproses</span>
        </Badge>
      )
    case 'delivered':
      return (
        <Badge className="bg-purple-600 hover:bg-purple-600 text-white text-[10px] gap-1 px-2 py-0.5">
          <ShieldCheck className="h-3 w-3" />
          <span>Pengiriman: Diterima</span>
        </Badge>
      )
    case 'failed':
      return (
        <Badge variant="destructive" className="text-[10px] gap-1 px-2 py-0.5">
          <AlertTriangle className="h-3 w-3" />
          <span>Pengiriman: Gagal</span>
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="text-[10px] px-2 py-0.5">
          Pengiriman: {status}
        </Badge>
      )
  }
}

function OutcomeBadge({ status }: { status?: string }) {
  switch (status) {
    case 'accepted':
      return (
        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] gap-1 px-2 py-0.5">
          <CheckCircle2 className="h-3 w-3" />
          <span>Lamaran: Diterima</span>
        </Badge>
      )
    case 'rejected':
      return (
        <Badge variant="destructive" className="text-[10px] gap-1 px-2 py-0.5">
          <XCircle className="h-3 w-3" />
          <span>Lamaran: Ditolak</span>
        </Badge>
      )
    case 'pending':
    default:
      return (
        <Badge
          variant="outline"
          className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] gap-1 px-2 py-0.5"
        >
          <Clock className="h-3 w-3" />
          <span>Lamaran: Pending</span>
        </Badge>
      )
  }
}

function getAttachmentCount(log: EmailLogRow): number {
  if (!log.selected_documents) return 0
  try {
    if (Array.isArray(log.selected_documents)) return log.selected_documents.length
    if (typeof log.selected_documents === 'string') {
      return JSON.parse(log.selected_documents).length
    }
  } catch {
    return 0
  }
  return 0
}

export function RecentActivities({ logs }: RecentActivitiesProps) {
  return (
    <Card className="border-border/80 bg-card">
      <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
        <div className="space-y-0.5">
          <CardTitle className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
            <Send className="h-4 w-4 text-primary" />
            <span>Aktivitas Pengiriman Terbaru</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Log pengiriman email lamaran kerja terkini yang tercatat di database
          </CardDescription>
        </div>
        <Link
          href="/riwayat-lamaran"
          className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        {logs.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Inbox}
              title="Belum Ada Aktivitas Pengiriman"
              description="Anda belum pernah mengirimkan lamaran kerja. Buat lamaran baru untuk memulai pengiriman otomatis."
              action={
                <Link
                  href="/kirim-lamaran"
                  className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5 shadow-xs')}
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Kirim Lamaran Pertama</span>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {logs.map((log) => {
              const attachCount = getAttachmentCount(log)
              const timestamp = log.sent_at || log.created_at

              return (
                <div
                  key={log.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Building2 className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-semibold text-sm text-foreground truncate">
                        {log.company_name}
                      </span>
                      {log.position && (
                        <Badge variant="outline" className="text-[10px] gap-1 font-medium bg-muted/40 border-border/80 text-foreground/90 py-0 h-5">
                          <Briefcase className="h-2.5 w-2.5 text-primary" />
                          <span>{log.position}</span>
                        </Badge>
                      )}
                      <StatusBadge status={log.status} />
                      <OutcomeBadge status={log.application_status} />
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono truncate">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{log.recipient_email}</span>
                    </div>

                    <p className="text-xs text-foreground/75 truncate">
                      <span className="text-muted-foreground">Subject: </span>
                      {log.subject}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end text-xs text-muted-foreground pt-1 sm:pt-0">
                    <div className="flex items-center gap-1 text-[11px]">
                      <Paperclip className="h-3.5 w-3.5 text-muted-foreground/70" />
                      <span>{attachCount} berkas</span>
                    </div>

                    <span className="text-[11px] font-mono">
                      {formatDate(timestamp)}
                    </span>

                    <Link
                      href="/riwayat-lamaran"
                      className={cn(
                        buttonVariants({ variant: 'outline', size: 'sm' }),
                        'h-7 px-2.5 text-xs'
                      )}
                    >
                      Detail
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

