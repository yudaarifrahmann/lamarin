'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Search,
  Building2,
  Mail,
  Calendar,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Eye,
  Trash2,
  Send,
  ChevronLeft,
  ChevronRight,
  History,
  Filter,
  X,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import type { EmailLogRow, EmailLogStatus } from '@/types/application'
import { formatDate } from '@/lib/format'
import { deleteApplicationLogAction } from '@/app/actions/history'
import { ApplicationDetailModal } from '@/components/history/application-detail-modal'
import { EmptyState } from '@/components/common/empty-state'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 10

interface ApplicationHistoryListProps {
  initialLogs: EmailLogRow[]
}

function StatusBadge({ status }: { status: EmailLogStatus }) {
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
        <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] gap-1 px-2 py-0.5 border border-amber-500/30">
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
    case 'bounced':
      return (
        <Badge variant="outline" className="text-[10px] gap-1 px-2 py-0.5 text-muted-foreground">
          <X className="h-3 w-3" />
          <span>Bounced</span>
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

export function ApplicationHistoryList({ initialLogs }: ApplicationHistoryListProps) {
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<EmailLogStatus | ''>('')
  const [dateFrom, setDateFrom] = React.useState('')
  const [dateTo, setDateTo] = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [selectedLog, setSelectedLog] = React.useState<EmailLogRow | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<EmailLogRow | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  // --- Filtering ---
  const filtered = React.useMemo(() => {
    return initialLogs.filter((log) => {
      const q = search.toLowerCase()
      const matchesSearch =
        q === '' ||
        log.company_name.toLowerCase().includes(q) ||
        log.recipient_email.toLowerCase().includes(q)

      const matchesStatus = statusFilter === '' || log.status === statusFilter

      const sentAt = log.sent_at || log.created_at
      const sentDate = sentAt ? sentAt.slice(0, 10) : ''
      const matchesFrom = dateFrom === '' || sentDate >= dateFrom
      const matchesTo = dateTo === '' || sentDate <= dateTo

      return matchesSearch && matchesStatus && matchesFrom && matchesTo
    })
  }, [initialLogs, search, statusFilter, dateFrom, dateTo])

  // Reset to page 1 on filter change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter, dateFrom, dateTo])

  // --- Pagination ---
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const hasActiveFilters = search !== '' || statusFilter !== '' || dateFrom !== '' || dateTo !== ''

  function resetFilters() {
    setSearch('')
    setStatusFilter('')
    setDateFrom('')
    setDateTo('')
  }

  // --- Detail ---
  function openDetail(log: EmailLogRow) {
    setSelectedLog(log)
    setDetailOpen(true)
  }

  // --- Delete ---
  function confirmDelete(log: EmailLogRow) {
    setDeleteTarget(log)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const result = await deleteApplicationLogAction(deleteTarget.id)
      if (result.success) {
        toast.success('Riwayat lamaran berhasil dihapus.')
        setDeleteTarget(null)
      } else {
        toast.error(result.error || 'Gagal menghapus riwayat lamaran.')
      }
    } catch {
      toast.error('Terjadi kesalahan saat menghapus riwayat.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      {/* Filter Bar */}
      <div className="flex flex-col gap-3">
        {/* Search + Status */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Cari perusahaan atau email penerima..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Status select */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as EmailLogStatus | '')}
                className="h-9 pl-8 pr-8 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer appearance-none w-full sm:w-auto"
              >
                <option value="">Semua Status</option>
                <option value="sent">Terkirim</option>
                <option value="queued">Sedang Diproses</option>
                <option value="delivered">Diterima</option>
                <option value="failed">Gagal</option>
                <option value="bounced">Bounced</option>
              </select>
            </div>

            {/* Reset filters */}
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground shrink-0"
              >
                <X className="h-3.5 w-3.5" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Date range */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground shrink-0">Dari:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring w-full sm:w-auto"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-muted-foreground shrink-0">s.d.:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring w-full sm:w-auto"
            />
          </div>

          {/* Result count */}
          <span className="text-xs text-muted-foreground ml-auto">
            {filtered.length} lamaran ditemukan
          </span>
        </div>
      </div>

      {/* List */}
      {paginated.length === 0 ? (
        hasActiveFilters ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Search className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground text-center">
              Tidak ada riwayat yang cocok dengan filter yang dipilih.
            </p>
            <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
              Reset Filter
            </Button>
          </div>
        ) : (
          <EmptyState
            icon={History}
            title="Belum Ada Riwayat Lamaran"
            description="Belum ada catatan lamaran kerja yang tersimpan. Begitu kamu mengirimkan email lamaran, riwayat dan statusnya akan otomatis tercatat di sini."
            action={
              <Link
                href="/kirim-lamaran"
                className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5 shadow-xs')}
              >
                <Send className="h-3.5 w-3.5" />
                <span>Buat Lamaran Pertama</span>
              </Link>
            }
          />
        )
      ) : (
        <div className="flex flex-col gap-2">
          {paginated.map((log) => {
            const attachCount = getAttachmentCount(log)
            const sentAt = log.sent_at || log.created_at
            return (
              <div
                key={log.id}
                className="group relative rounded-xl border border-border/70 bg-card hover:border-primary/30 hover:shadow-sm transition-all duration-200 p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Left content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    {/* Company + status */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Building2 className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-semibold text-sm text-foreground truncate">
                        {log.company_name}
                      </span>
                      <StatusBadge status={log.status} />
                    </div>

                    {/* Recipient */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="font-mono truncate">{log.recipient_email}</span>
                    </div>

                    {/* Subject */}
                    <p className="text-xs text-foreground/70 truncate">
                      <span className="text-muted-foreground">Subj: </span>
                      {log.subject}
                    </p>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 pt-0.5">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(sentAt || log.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Paperclip className="h-3 w-3" />
                        <span>{attachCount} lampiran</span>
                      </div>
                      {log.status === 'failed' && (
                        <span className="text-[10px] text-destructive font-medium">
                          Pengiriman gagal
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openDetail(log)}
                      className="gap-1.5 text-xs h-8"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Detail</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => confirmDelete(log)}
                      className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                      title="Hapus riwayat ini"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            Halaman {currentPage} dari {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...')
                acc.push(p)
                return acc
              }, [])
              .map((p, idx) =>
                p === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-xs text-muted-foreground">
                    …
                  </span>
                ) : (
                  <Button
                    key={p}
                    type="button"
                    variant={currentPage === p ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(p as number)}
                    className="h-8 w-8 p-0 text-xs"
                  >
                    {p}
                  </Button>
                )
              )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <ApplicationDetailModal
        log={selectedLog}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteTarget(null)}
          />
          <div className="relative bg-background rounded-xl border border-border shadow-xl max-w-sm w-full p-6 space-y-4 animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-destructive/10 shrink-0 mt-0.5">
                <Trash2 className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">Hapus Riwayat Lamaran?</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Riwayat lamaran ke{' '}
                  <span className="font-semibold text-foreground">
                    {deleteTarget.company_name}
                  </span>{' '}
                  akan dihapus secara permanen dan tidak bisa dikembalikan.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={deleting}
                onClick={handleDelete}
                className="gap-1.5"
              >
                {deleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                <span>{deleting ? 'Menghapus...' : 'Hapus'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

