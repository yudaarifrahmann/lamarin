import * as React from 'react'
import Link from 'next/link'
import { Building2, Calendar, Send, CheckCircle2, Clock, AlertTriangle, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { EmptyState } from '@/components/common/empty-state'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

export interface RecentCompanyItem {
  companyName: string
  lastSentAt: string
  latestStatus: string
  applicationCount: number
}

interface RecentCompaniesProps {
  companies: RecentCompanyItem[]
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'sent':
      return (
        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] gap-1 px-2 py-0.5">
          <CheckCircle2 className="h-3 w-3" />
          <span>Terkirim</span>
        </Badge>
      )
    case 'queued':
      return (
        <Badge
          variant="secondary"
          className="bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] gap-1 px-2 py-0.5 border border-amber-500/30"
        >
          <Clock className="h-3 w-3" />
          <span>Diproses</span>
        </Badge>
      )
    case 'delivered':
      return (
        <Badge className="bg-purple-600 hover:bg-purple-600 text-white text-[10px] gap-1 px-2 py-0.5">
          <ShieldCheck className="h-3 w-3" />
          <span>Diterima</span>
        </Badge>
      )
    case 'failed':
      return (
        <Badge variant="destructive" className="text-[10px] gap-1 px-2 py-0.5">
          <AlertTriangle className="h-3 w-3" />
          <span>Gagal</span>
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="text-[10px] px-2 py-0.5">
          {status}
        </Badge>
      )
  }
}

export function RecentCompanies({ companies }: RecentCompaniesProps) {
  return (
    <Card className="border-border/80 bg-card">
      <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
        <div className="space-y-0.5">
          <CardTitle className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <span>Perusahaan Terakhir Dilamar</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Daftar instansi atau perusahaan yang menerima lamaran Anda
          </CardDescription>
        </div>
        <Link
          href="/riwayat-lamaran"
          className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
        >
          <span>Semua Riwayat</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        {companies.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Building2}
              title="Belum Ada Perusahaan"
              description="Belum ada perusahaan yang dilamar. Mulai kirimkan CV Anda ke lowongan pekerjaan pertama."
              action={
                <Link
                  href="/kirim-lamaran"
                  className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5 shadow-xs')}
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Kirim Lamaran</span>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {companies.map((company) => (
              <div
                key={company.companyName}
                className="p-4 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0 border border-border/60">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {company.companyName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="h-3 w-3 text-muted-foreground/70" />
                        <span>{formatDate(company.lastSentAt)}</span>
                      </span>
                      <span>&bull;</span>
                      <span className="text-[11px] font-medium">
                        {company.applicationCount}x dilamar
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={company.latestStatus} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

