'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  FileText,
  Building2,
  Briefcase,
  Mail,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Send,
  Copy,
  FileCheck,
  XCircle,
  ChevronDown,
  Loader2,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'
import type { EmailLogRow, ApplicationOutcomeStatus, EmailLogStatus } from '@/types/application'
import { formatBytes, formatDate } from '@/lib/format'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ApplicationDetailModalProps {
  log: EmailLogRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange?: (logId: string, newStatus: ApplicationOutcomeStatus) => void
  isUpdatingStatus?: boolean
}

interface DocumentSnapshotItem {
  id: string
  order?: number
  document_name: string
  original_filename: string
  file_size: number
  is_merged_pdf?: boolean
  merged_filename?: string
}

function DeliveryBadge({ status }: { status: EmailLogStatus }) {
  switch (status) {
    case 'sent':
    case 'delivered':
      return (
        <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] gap-1 px-2 py-0.5">
          <CheckCircle2 className="h-3 w-3 shrink-0" />
          <span>Pengiriman: Terkirim</span>
        </Badge>
      )
    case 'queued':
      return (
        <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] gap-1 px-2 py-0.5 border border-amber-500/30">
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

export function ApplicationDetailModal({
  log,
  open,
  onOpenChange,
  onStatusChange,
  isUpdatingStatus,
}: ApplicationDetailModalProps) {
  if (!log) return null

  const outcomeStatus: ApplicationOutcomeStatus = log.application_status || 'pending'

  // Parse snapshot documents safely
  let attachedDocs: DocumentSnapshotItem[] = []
  if (log.selected_documents) {
    try {
      if (Array.isArray(log.selected_documents)) {
        attachedDocs = log.selected_documents as unknown as DocumentSnapshotItem[]
      } else if (typeof log.selected_documents === 'string') {
        attachedDocs = JSON.parse(log.selected_documents)
      }
    } catch {
      attachedDocs = []
    }
  }

  const handleCopyResendId = () => {
    if (log.resend_message_id) {
      navigator.clipboard.writeText(log.resend_message_id)
      toast.success('ID Pesan Gmail berhasil disalin.')
    }
  }

  const renderOutcomeBadge = () => {
    switch (outcomeStatus) {
      case 'accepted':
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] gap-1 px-2 py-0.5 cursor-pointer">
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            <span className="font-semibold">Lamaran: Diterima</span>
            <ChevronDown className="h-2.5 w-2.5 opacity-80" />
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive" className="text-[10px] gap-1 px-2 py-0.5 cursor-pointer hover:bg-destructive/90">
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
            className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] gap-1 px-2 py-0.5 cursor-pointer hover:bg-amber-500/20"
          >
            <Clock className="h-3 w-3 shrink-0" />
            <span className="font-semibold">Lamaran: Pending</span>
            <ChevronDown className="h-2.5 w-2.5 opacity-80" />
          </Badge>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[88vh] flex flex-col p-6">
        <DialogHeader className="pb-1 shrink-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <DialogTitle className="text-base sm:text-lg font-bold">
                  {log.company_name}
                </DialogTitle>
              </div>
              {log.position && (
                <Badge variant="outline" className="text-xs gap-1 font-medium bg-muted/40 border-border/80 text-foreground/90">
                  <Briefcase className="h-3 w-3 text-primary" />
                  <span>{log.position}</span>
                </Badge>
              )}
            </div>

            {/* Header Status Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <DeliveryBadge status={log.status} />

              {/* Status Hasil Lamaran Switcher */}
              {onStatusChange ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        className="inline-flex items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer disabled:opacity-50"
                        title="Klik untuk mengubah status hasil lamaran"
                      />
                    }
                  >
                    {isUpdatingStatus ? (
                      <Badge variant="outline" className="text-[10px] gap-1 px-2 py-0.5 text-muted-foreground animate-pulse">
                        <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                        <span>Menyimpan...</span>
                      </Badge>
                    ) : (
                      renderOutcomeBadge()
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Ubah Status Hasil Lamaran
                      </DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onStatusChange(log.id, 'pending')}
                      className="gap-2 cursor-pointer text-xs"
                    >
                      <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span className="flex-1">Pending</span>
                      {outcomeStatus === 'pending' && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onStatusChange(log.id, 'accepted')}
                      className="gap-2 cursor-pointer text-xs text-emerald-600 dark:text-emerald-400 focus:text-emerald-600 dark:focus:text-emerald-400"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span className="flex-1 font-medium">Diterima</span>
                      {outcomeStatus === 'accepted' && <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onStatusChange(log.id, 'rejected')}
                      className="gap-2 cursor-pointer text-xs text-destructive focus:text-destructive"
                    >
                      <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                      <span className="flex-1 font-medium">Ditolak</span>
                      {outcomeStatus === 'rejected' && <Check className="h-3.5 w-3.5 text-destructive shrink-0" />}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                renderOutcomeBadge()
              )}
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground flex items-center gap-2 pt-0.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>Dikirim pada: {formatDate(log.sent_at || log.created_at)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Failure Alert Box */}
          {log.status === 'failed' && log.error_message && (
            <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-xs text-destructive space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="h-4 w-4" />
                <span>Pengiriman Gagal</span>
              </div>
              <p className="text-[11px] leading-relaxed font-mono">
                {log.error_message}
              </p>
            </div>
          )}

          {/* Email Envelope Summary with Both Statuses Clearly Separated */}
          <div className="rounded-lg border border-border/80 bg-muted/20 p-3.5 space-y-2.5 text-xs">
            <div className="flex items-start justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground font-medium w-36 shrink-0">Perusahaan:</span>
              <span className="font-semibold text-foreground text-right truncate">
                {log.company_name}
              </span>
            </div>

            {log.position && (
              <div className="flex items-start justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground font-medium w-36 shrink-0">Posisi Dilamar:</span>
                <span className="font-semibold text-primary text-right truncate">
                  {log.position}
                </span>
              </div>
            )}

            {/* Status 1: Status Pengiriman */}
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground font-medium w-36 shrink-0">Status Pengiriman:</span>
              <DeliveryBadge status={log.status} />
            </div>

            {/* Status 2: Status Hasil Lamaran */}
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground font-medium w-36 shrink-0">Status Lamaran:</span>
              {onStatusChange ? (
                <div className="flex items-center gap-2">
                  <select
                    value={outcomeStatus}
                    disabled={isUpdatingStatus}
                    onChange={(e) => onStatusChange(log.id, e.target.value as ApplicationOutcomeStatus)}
                    className="h-7 px-2 text-xs rounded-md border border-input bg-background font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Diterima</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                </div>
              ) : (
                renderOutcomeBadge()
              )}
            </div>

            <div className="flex items-start justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground font-medium w-36 shrink-0">Penerima HRD:</span>
              <span className="font-semibold text-foreground text-right font-mono truncate">
                {log.recipient_email}
              </span>
            </div>

            <div className="flex items-start justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground font-medium w-36 shrink-0">Subject:</span>
              <span className="font-semibold text-primary text-right">
                {log.subject}
              </span>
            </div>

            {log.resend_message_id && (
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-muted-foreground font-medium w-36 shrink-0">ID Pesan:</span>
                <div className="flex items-center gap-1.5 text-right font-mono text-[11px]">
                  <span>{log.resend_message_id}</span>
                  <button
                    type="button"
                    onClick={handleCopyResendId}
                    className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Salin ID"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Message Content Body */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-foreground block">
              Isi Surat Lamaran Kerja:
            </span>
            <div className="rounded-lg border border-border/70 bg-card p-4 min-h-36 max-h-64 overflow-y-auto">
              <pre className="font-sans text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                {log.message}
              </pre>
            </div>
          </div>

          {/* Attached Documents Snapshot */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Paperclip className="h-3.5 w-3.5 text-primary" />
              <span>Dokumen Lampiran ({attachedDocs.length}):</span>
            </span>

            {attachedDocs.length === 0 ? (
              <p className="text-xs text-muted-foreground italic px-1">
                Tidak ada dokumen yang dilampirkan pada lamaran ini.
              </p>
            ) : (
              <div className="space-y-2">
                {attachedDocs.some((d) => d.is_merged_pdf && d.merged_filename) && (
                  <div className="p-2 rounded-lg bg-primary/5 border border-primary/20 text-xs text-primary flex items-center gap-2">
                    <FileCheck className="h-4 w-4 shrink-0" />
                    <span>
                      Dokumen PDF berikut otomatis digabung menjadi 1 file lampiran: <strong>{attachedDocs.find((d) => d.merged_filename)?.merged_filename}</strong>
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attachedDocs.map((doc, idx) => (
                    <div
                      key={doc.id || idx}
                      className="p-2.5 rounded-lg border border-border/70 bg-muted/20 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono font-bold text-primary shrink-0">
                          #{doc.order || idx + 1}
                        </span>
                        <FileText className="h-4 w-4 text-red-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">
                            {doc.document_name}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono truncate">
                            {doc.original_filename}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                        {formatBytes(doc.file_size)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-2 shrink-0 flex flex-col sm:flex-row justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>

          <Link
            href="/kirim-lamaran"
            className={buttonVariants({ size: 'sm', className: 'gap-1.5 shadow-xs text-xs' })}
          >
            <Send className="h-3.5 w-3.5" />
            <span>Kirim Lamaran Baru</span>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
