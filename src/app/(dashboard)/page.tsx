import * as React from 'react'
import Link from 'next/link'
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ArrowRight,
  Database,
  Mail,
  AlertCircle,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/common/stat-card'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { EmailLogRow } from '@/types/application'
import { ActivityChart, type DailyActivityItem } from '@/components/dashboard/activity-chart'
import { RecentActivities } from '@/components/dashboard/recent-activities'
import { RecentCompanies, type RecentCompanyItem } from '@/components/dashboard/recent-companies'
import { QuickActions } from '@/components/dashboard/quick-actions'

export const instant = false

function getPast14Days(): { date: string; label: string; dayName: string }[] {
  const days: { date: string; label: string; dayName: string }[] = []
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ]

  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const dateKey = `${year}-${month}-${day}`
    const label = `${d.getDate()} ${monthNames[d.getMonth()]}`
    const dayName = dayNames[d.getDay()]
    days.push({ date: dateKey, label, dayName })
  }

  return days
}

export default async function DashboardPage() {
  await connection()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let allLogs: EmailLogRow[] = []
  let savedDocumentsCount = 0
  let gmailConnection: { gmail_email: string; connected_at: string } | null = null

  if (user) {
    const [logsResult, docsResult, gmailResult] = await Promise.all([
      supabase
        .from('email_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('documents')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
      supabase
        .from('gmail_connections')
        .select('gmail_email, connected_at')
        .eq('user_id', user.id)
        .maybeSingle(),
    ])

    if (logsResult.data) {
      allLogs = logsResult.data as EmailLogRow[]
    }

    if (docsResult.count !== null && docsResult.count !== undefined) {
      savedDocumentsCount = docsResult.count
    }

    if (gmailResult.data) {
      gmailConnection = gmailResult.data
    }
  }

  // 1. Total statistik aktual dari Supabase
  const totalApplications = allLogs.length
  const successfulEmails = allLogs.filter(
    (log) => log.status === 'sent' || log.status === 'delivered'
  ).length
  const failedEmails = allLogs.filter(
    (log) => log.status === 'failed' || log.status === 'bounced'
  ).length

  // 2. Data grafik aktivitas 14 hari terakhir
  const past14Days = getPast14Days()
  const countsByDate = new Map<string, number>()
  for (const day of past14Days) {
    countsByDate.set(day.date, 0)
  }

  for (const log of allLogs) {
    const dateStr = log.sent_at || log.created_at
    if (dateStr) {
      const dateKey = dateStr.slice(0, 10)
      if (countsByDate.has(dateKey)) {
        countsByDate.set(dateKey, (countsByDate.get(dateKey) || 0) + 1)
      }
    }
  }

  const dailyActivities: DailyActivityItem[] = past14Days.map((d) => ({
    date: d.date,
    label: d.label,
    dayName: d.dayName,
    count: countsByDate.get(d.date) || 0,
  }))

  // 3. Aktivitas pengiriman terbaru (5 terakhir)
  const recentLogs = allLogs.slice(0, 5)

  // 4. Perusahaan terakhir dilamar (5 instansi unik terakhir)
  const companyMap = new Map<string, RecentCompanyItem>()
  for (const log of allLogs) {
    const company = log.company_name?.trim()
    if (!company) continue

    const existing = companyMap.get(company)
    if (existing) {
      existing.applicationCount += 1
    } else {
      companyMap.set(company, {
        companyName: company,
        lastSentAt: log.sent_at || log.created_at,
        latestStatus: log.status,
        applicationCount: 1,
      })
    }
  }
  const recentCompanies = Array.from(companyMap.values()).slice(0, 5)

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Header Banner - Clean Minimalist (No Gradient, No Emoji) */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-3 py-1 text-xs font-medium text-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Sistem Aktif
              </div>

              {/* Status Koneksi Gmail */}
              {gmailConnection ? (
                <Badge
                  variant="outline"
                  className="text-xs px-2.5 py-0.5 gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono"
                >
                  <Mail className="h-3 w-3 text-emerald-500" />
                  <span>Gmail: {gmailConnection.gmail_email}</span>
                </Badge>
              ) : (
                <Link href="/konfigurasi-email">
                  <Badge
                    variant="outline"
                    className="text-xs px-2.5 py-0.5 gap-1.5 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 cursor-pointer"
                  >
                    <AlertCircle className="h-3 w-3 text-amber-500" />
                    <span>Gmail Belum Terhubung</span>
                  </Badge>
                </Link>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Dashboard Lamarin
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Pusat kendali otomasi pengiriman lamaran kerja. Pantau statistik riil, kelola arsip dokumen, dan kirimkan resume resmi ke HRD melalui Google Gmail API.
            </p>
          </div>

          {/* Quick Buttons in Header */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/kirim-lamaran"
              className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5 shadow-xs')}
            >
              <Send className="h-3.5 w-3.5" />
              <span>Kirim Lamaran</span>
            </Link>

            <Link
              href="/manajemen-dokumen"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5')}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Kelola Dokumen</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Alert jika Gmail belum terhubung */}
      {!gmailConnection && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Akun Gmail Belum Terhubung</p>
              <p className="text-muted-foreground mt-0.5">
                Hubungkan akun Gmail pribadi Anda melalui Google OAuth 2.0 agar sistem dapat mengirimkan email lamaran kerja langsung dari alamat Anda.
              </p>
            </div>
          </div>
          <Link
            href="/konfigurasi-email"
            className={cn(
              buttonVariants({ size: 'sm' }),
              'gap-1.5 shadow-xs text-xs shrink-0 bg-amber-600 hover:bg-amber-700 text-white'
            )}
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Hubungkan Gmail</span>
          </Link>
        </div>
      )}

      {/* 4 Statistik Aktual dari Supabase */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Lamaran"
          value={totalApplications}
          description="Total lamaran yang pernah dikirim"
          icon={Send}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Berhasil Terkirim"
          value={successfulEmails}
          description="Email sampai ke inbox tujuan"
          icon={CheckCircle2}
          iconColor="text-emerald-500"
        />
        <StatCard
          title="Pengiriman Gagal"
          value={failedEmails}
          description="Email yang mengalami kendala"
          icon={AlertTriangle}
          iconColor="text-destructive"
        />
        <StatCard
          title="Dokumen Tersimpan"
          value={savedDocumentsCount}
          description="CV & sertifikat di storage privat"
          icon={FileText}
          iconColor="text-purple-500"
        />
      </div>

      {/* Shortcut Menuju Kirim Lamaran & Manajemen Dokumen */}
      <QuickActions />

      {/* Grafik Aktivitas Pengiriman Berdasarkan Tanggal */}
      <ActivityChart data={dailyActivities} />

      {/* 2 Kolom: Aktivitas Pengiriman Terbaru & Perusahaan Terakhir Dilamar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivities logs={recentLogs} />
        <RecentCompanies companies={recentCompanies} />
      </div>
    </div>
  )
}
