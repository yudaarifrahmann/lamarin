'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Search,
  Building2,
  Briefcase,
  Mail,
  Calendar,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  Trash2,
  Send,
  ChevronLeft,
  ChevronRight,
  History,
  Filter,
  X,
  Loader2,
  ChevronDown,
  XCircle,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'
import type { EmailLogRow, EmailLogStatus, ApplicationOutcomeStatus } from '@/types/application'
import { formatDate } from '@/lib/format'
import { deleteApplicationLogAction, updateApplicationStatusAction } from '@/app/actions/history'
import { ApplicationDetailModal } from '@/components/history/application-detail-modal'
import { EmptyState } from '@/components/common/empty-state'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 10

interface ApplicationHistoryListProps {
  initialLogs: EmailLogRow[]
}

/**
 * Badge for Email Delivery Status (Kondisi Pengiriman Email)
 * Terkirim / Diproses / Gagal
 */
export function DeliveryStatusBadge({ status }: { status: EmailLogStatus }) {
  switch (status) {
    case 'sent':
    case 'delivered':
      return (
        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] gap-1 px-2 py-0.5">
          <CheckCircle2 className="h-3 w-3 shrink-0" />
          <span>Pengiriman: Terkirim</span>
        </Badge>
      )
    case 'queued':
      return (
        <Badge
          variant="secondary"
          className="bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] gap-1 px-2 py-0.5 border border-amber-500/30"
        >
          <Clock className="h-3 w-3 shrink-0" />
          <span>Pengiriman: Diproses</span>
        </Badge>
      )
    case 'failed':
    case 'bounced':
      return (
        <Badge variant="destructive" className="text-[10px] gap-1 px-2 py-0.5">
          <AlertTriangle className="h-3 w-3 shrink-0" />
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

/**
 * Dropdown selector for Application Outcome Status (Status Hasil Lamaran)
 * Pending / Diterima / Ditolak
 */
export function ApplicationStatusDropdown({
  currentStatus,
  isUpdating,
  onSelectStatus,
}: {
  currentStatus: ApplicationOutcomeStatus
  isUpdating: boolean
  onSelectStatus: (status: ApplicationOutcomeStatus) => void
}) {
  const renderTriggerBadge = () => {
    switch (currentStatus) {
      case 'accepted':
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] gap-1 px-2 py-0.5 cursor-pointer shadow-2xs transition-colors">
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            <span className="font-semibold">Lamaran: Diterima</span>
            <ChevronDown className="h-2.5 w-2.5 opacity-80" />
          </Badge>
        )
      case 'rejected':
        return (
          <Badge
            variant="destructive"
            className="text-[10px] gap-1 px-2 py-0.5 cursor-pointer shadow-2xs hover:bg-destructive/90 transition-colors"
          >
            <XCircle className="h-3 w-3 shrink-0" />
            <span className="font-semibold">Lamaran: Ditolak</span>
            <ChevronDown className="h-2.5 w-2.5 opacity-80" />
          </Badge>
        )
      case 'pending':
      default:
        return (
          <Badge
            variant="outline"
            className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] gap-1 px-2 py-0.5 cursor-pointer hover:bg-amber-500/20 shadow-2xs transition-colors"
          >
            <Clock className="h-3 w-3 shrink-0" />
            <span className="font-semibold">Lamaran: Pending</span>
            <ChevronDown className="h-2.5 w-2.5 opacity-80" />
          </Badge>
        )
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            disabled={isUpdating}
            className="inline-flex items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer disabled:opacity-50"
            title="Klik untuk mengubah status hasil lamaran"
          />
        }
      >
        {isUpdating ? (
          <Badge
            variant="outline"
            className="text-[10px] gap-1 px-2 py-0.5 text-muted-foreground animate-pulse"
          >
            <Loader2 className="h-3 w-3 animate-spin shrink-0" />
            <span>Menyimpan...</span>
          </Badge>
        ) : (
          renderTriggerBadge()
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Ubah Status Hasil Lamaran
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => onSelectStatus('pending')}
          className="gap-2 cursor-pointer text-xs"
        >
          <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <div className="flex-1">
            <span className="font-medium">Pending</span>
            <span className="text-[10px] text-muted-foreground block">Menunggu tanggapan</span>
          </div>
          {currentStatus === 'pending' && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onSelectStatus('accepted')}
          className="gap-2 cursor-pointer text-xs text-emerald-600 dark:text-emerald-400 focus:text-emerald-600 dark:focus:text-emerald-400"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <div className="flex-1">
            <span className="font-medium">Diterima</span>
            <span className="text-[10px] text-muted-foreground block">Lolos seleksi / diterima</span>
          </div>
          {currentStatus === 'accepted' && (
            <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onSelectStatus('rejected')}
          className="gap-2 cursor-pointer text-xs text-destructive focus:text-destructive"
        >
          <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
          <div className="flex-1">
            <span className="font-medium">Ditolak</span>
            <span className="text-[10px] text-muted-foreground block">Belum berhasil</span>
          </div>
          {currentStatus === 'rejected' && (
            <Check className="h-3.5 w-3.5 text-destructive shrink-0" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
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
  const [logs, setLogs] = React.useState<EmailLogRow[]>(initialLogs)
  const [search, setSearch] = React.useState('')
  const [deliveryFilter, setDeliveryFilter] = React.useState<EmailLogStatus | ''>('')
  const [outcomeFilter, setOutcomeFilter] = React.useState<ApplicationOutcomeStatus | ''>('')
  const [dateFrom, setDateFrom] = React.useState('')
  const [dateTo, setDateTo] = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [selectedLog, setSelectedLog] = React.useState<EmailLogRow | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<EmailLogRow | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const [updatingLogId, setUpdatingLogId] = React.useState<string | null>(null)

  // Keep internal state synchronized when initialLogs updates from server
  React.useEffect(() => {
    setLogs(initialLogs)
  }, [initialLogs])

  // --- Filtering ---
  const filtered = React.useMemo(() => {
    return logs.filter((log) => {
      const q = search.toLowerCase()
      const matchesSearch =
        q === '' ||
        log.company_name.toLowerCase().includes(q) ||
        (Boolean(log.position) && log.position.toLowerCase().includes(q)) ||
        log.recipient_email.toLowerCase().includes(q)

      const matchesDelivery = deliveryFilter === '' || log.status === deliveryFilter

      const logOutcome = log.application_status || 'pending'
      const matchesOutcome = outcomeFilter === '' || logOutcome === outcomeFilter

      const sentAt = log.sent_at || log.created_at
      const sentDate = sentAt ? sentAt.slice(0, 10) : ''
      const matchesFrom = dateFrom === '' || sentDate >= dateFrom
      const matchesTo = dateTo === '' || sentDate <= dateTo

      return matchesSearch && matchesDelivery && matchesOutcome && matchesFrom && matchesTo
    })
  }, [logs, search, deliveryFilter, outcomeFilter, dateFrom, dateTo])

  // Reset to page 1 on filter change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [search, deliveryFilter, outcomeFilter, dateFrom, dateTo])

  // --- Pagination ---
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const hasActiveFilters =
    search !== '' ||
    deliveryFilter !== '' ||
    outcomeFilter !== '' ||
    dateFrom !== '' ||
    dateTo !== ''

  function resetFilters() {
    setSearch('')
    setDeliveryFilter('')
    setOutcomeFilter('')
    setDateFrom('')
    setDateTo('')
  }

  // --- Update Outcome Status ---
  async function handleUpdateOutcome(logId: string, newStatus: ApplicationOutcomeStatus) {
    const targetLog = logs.find((l) => l.id === logId)
    const company = targetLog?.company_name || 'perusahaan'

    setUpdatingLogId(logId)

    // Optimistically update local list state
    setLogs((prev) =>
      prev.map((item) =>
        item.id === logId ? { ...item, application_status: newStatus } : item
      )
    )

    // Also update selectedLog if modal is currently open
    if (selectedLog && selectedLog.id === logId) {
      setSelectedLog((prev) => (prev ? { ...prev, application_status: newStatus } : null))
    }

    try {
      const result = await updateApplicationStatusAction(logId, newStatus)
      if (result.success) {
        const labelMap: Record<ApplicationOutcomeStatus, string> = {
          pending: 'Pending',
          accepted: 'Diterima',
          rejected: 'Ditolak',
        }
        toast.success(
          `Status lamaran ke ${company} berhasil diperbarui menjadi "${labelMap[newStatus]}".`
        )
      } else {
        // Rollback on failure
        setLogs(initialLogs)
        toast.error(result.error || 'Gagal memperbarui status hasil lamaran.')
      }
    } catch {
      setLogs(initialLogs)
      toast.error('Terjadi kesalahan jaringan saat memperbarui status.')
    } finally {
      setUpdatingLogId(null)
    }
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
        setLogs((prev) => prev.filter((item) => item.id !== deleteTarget.id))
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
        {/* Search + Selects */}
        <div className="flex flex-col md:flex-row items-stretch gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Cari perusahaan, posisi pekerjaan, atau email HRD..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Status Pengiriman */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <select
                value={deliveryFilter}
                onChange={(e) => setDeliveryFilter(e.target.value as EmailLogStatus | '')}
                className="h-9 pl-8 pr-7 rounded-md border border-input bg-background text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer appearance-none"
                title="Filter berdasarkan status pengiriman email"
              >
                <option value="">Semua Pengiriman</option>
                <option value="sent">Pengiriman: Terkirim</option>
                <option value="queued">Pengiriman: Diproses</option>
                <option value="failed">Pengiriman: Gagal</option>
              </select>
            </div>

            {/* Filter Status Hasil Lamaran */}
            <div className="relative">
              <select
                value={outcomeFilter}
                onChange={(e) => setOutcomeFilter(e.target.value as ApplicationOutcomeStatus | '')}
                className="h-9 px-3 rounded-md border border-input bg-background text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                title="Filter berdasarkan status hasil lamaran"
              >
                <option value="">Semua Hasil Lamaran</option>
                <option value="pending">Lamaran: Pending</option>
                <option value="accepted">Lamaran: Diterima</option>
                <option value="rejected">Lamaran: Ditolak</option>
              </select>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground shrink-0 h-9"
              >
                <X className="h-3.5 w-3.5" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Date range & Result count */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground shrink-0">Dari:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-8 px-2.5 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring w-full sm:w-auto"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-muted-foreground shrink-0">s.d.:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-8 px-2.5 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring w-full sm:w-auto"
            />
          </div>

          {/* Result count */}
          <span className="text-xs text-muted-foreground sm:ml-auto">
            Menampilkan {filtered.length} dari {logs.length} lamaran
          </span>
        </div>
      </div>

      {/* List */}
      {paginated.length === 0 ? (
        hasActiveFilters ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 border border-dashed rounded-xl bg-muted/20">
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
        <div className="flex flex-col gap-3">
          {paginated.map((log) => {
            const attachCount = getAttachmentCount(log)
            const sentAt = log.sent_at || log.created_at
            const outcomeStatus: ApplicationOutcomeStatus = log.application_status || 'pending'
            const isUpdatingThisLog = updatingLogId === log.id

            return (
              <div
                key={log.id}
                className="group relative rounded-xl border border-border/70 bg-card hover:border-primary/40 hover:shadow-sm transition-all duration-200 p-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left content: Company, Position, Dual Status, and Meta */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Header Row: Company + Position */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Building2 className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-semibold text-sm text-foreground truncate">
                          {log.company_name}
                        </span>
                      </div>

                      {log.position && (
                        <Badge
                          variant="outline"
                          className="text-[11px] gap-1 font-medium bg-muted/40 border-border/80 text-foreground/90"
                        >
                          <Briefcase className="h-3 w-3 text-primary" />
                          <span>{log.position}</span>
                        </Badge>
                      )}
                    </div>

                    {/* DUA STATUS TERPISAH (Pemisahan Jelas Sesuai Permintaan) */}
                    <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
                      {/* Status 1: Status Pengiriman Email */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground font-medium">Status Pengiriman:</span>
                        <DeliveryStatusBadge status={log.status} />
                      </div>

                      <span className="text-muted-foreground/40 hidden sm:inline">•</span>

                      {/* Status 2: Status Hasil Lamaran (Dapat diubah manual) */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground font-medium">Status Lamaran:</span>
                        <ApplicationStatusDropdown
                          currentStatus={outcomeStatus}
                          isUpdating={isUpdatingThisLog}
                          onSelectStatus={(newStatus) => handleUpdateOutcome(log.id, newStatus)}
                        />
                      </div>
                    </div>

                    {/* Email Recipient & Subject */}
                    <div className="space-y-0.5 text-xs text-muted-foreground pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="font-mono truncate">{log.recipient_email}</span>
                      </div>
                      <p className="truncate text-foreground/75">
                        <span className="text-muted-foreground">Subject: </span>
                        {log.subject}
                      </p>
                    </div>

                    {/* Meta row: Date & Attachments */}
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(sentAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Paperclip className="h-3 w-3" />
                        <span>{attachCount} lampiran</span>
                      </div>
                      {log.status === 'failed' && (
                        <span className="text-destructive font-medium">
                          Pengiriman gagal
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center gap-2 shrink-0 self-end lg:self-center border-t lg:border-t-0 pt-2 lg:pt-0 w-full lg:w-auto justify-end">
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
        onStatusChange={(logId, newStatus) => handleUpdateOutcome(logId, newStatus)}
        isUpdatingStatus={updatingLogId === selectedLog?.id}
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
