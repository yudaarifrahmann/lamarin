'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  FileText,
  Building2,
  Mail,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Send,
  ExternalLink,
  Copy,
} from 'lucide-react'
import { toast } from 'sonner'
import type { EmailLogRow } from '@/types/application'
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

interface ApplicationDetailModalProps {
  log: EmailLogRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface DocumentSnapshotItem {
  id: string
  document_name: string
  original_filename: string
  file_size: number
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'sent':
      return (
        <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] gap-1 px-2">
          <CheckCircle2 className="h-3 w-3" />
          <span>Terkirim</span>
        </Badge>
      )
    case 'queued':
      return (
        <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] gap-1 px-2 border-amber-500/30">
          <Clock className="h-3 w-3" />
          <span>Antrean</span>
        </Badge>
      )
    case 'delivered':
      return (
        <Badge variant="default" className="bg-purple-600 hover:bg-purple-600 text-white text-[10px] gap-1 px-2">
          <ShieldCheck className="h-3 w-3" />
          <span>Diterima</span>
        </Badge>
      )
    case 'failed':
      return (
        <Badge variant="destructive" className="text-[10px] gap-1 px-2">
          <AlertTriangle className="h-3 w-3" />
          <span>Gagal</span>
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="text-[10px]">
          {status}
        </Badge>
      )
  }
}

export function ApplicationDetailModal({
  log,
  open,
  onOpenChange,
}: ApplicationDetailModalProps) {
  if (!log) return null

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[88vh] flex flex-col p-6">
        <DialogHeader className="pb-1 shrink-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <DialogTitle className="text-base sm:text-lg font-bold">
                {log.company_name}
              </DialogTitle>
            </div>
            {getStatusBadge(log.status)}
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

          {/* Email Envelope Summary */}
          <div className="rounded-lg border border-border/80 bg-muted/20 p-3.5 space-y-2 text-xs">
            <div className="flex items-start justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground font-medium w-24 shrink-0">Penerima HRD:</span>
              <span className="font-semibold text-foreground text-right font-mono truncate">
                {log.recipient_email}
              </span>
            </div>

            <div className="flex items-start justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground font-medium w-24 shrink-0">Subject:</span>
              <span className="font-semibold text-primary text-right">
                {log.subject}
              </span>
            </div>

            {log.resend_message_id && (
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-muted-foreground font-medium w-24 shrink-0">ID Pesan:</span>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {attachedDocs.map((doc, idx) => (
                  <div
                    key={doc.id || idx}
                    className="p-2.5 rounded-lg border border-border/70 bg-muted/20 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
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

