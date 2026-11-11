'use client'

import * as React from 'react'
import { Send, AlertCircle, Loader2, Building2, Mail, Paperclip, User, Briefcase, FileCheck } from 'lucide-react'
import type { DocumentRow } from '@/types/document'
import { formatBytes } from '@/lib/format'
import { isPdfDocument, generateMergedPdfFilename } from '@/lib/pdf/merger'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ApplicationConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipientEmail: string
  companyName: string
  position: string
  resolvedSubject: string
  senderName: string
  senderEmail: string
  selectedDocuments: (DocumentRow & { order?: number })[]
  isSending: boolean
  onConfirmSend: () => void
}

export function ApplicationConfirmationModal({
  open,
  onOpenChange,
  recipientEmail,
  companyName,
  position,
  resolvedSubject,
  senderName,
  senderEmail,
  selectedDocuments,
  isSending,
  onConfirmSend,
}: ApplicationConfirmationModalProps) {
  const totalAttachmentBytes = selectedDocuments.reduce(
    (acc, d) => acc + (d.file_size || 0),
    0
  )

  const pdfDocs = selectedDocuments.filter((d) =>
    isPdfDocument(d.mime_type, d.original_filename)
  )
  const nonPdfDocs = selectedDocuments.filter(
    (d) => !isPdfDocument(d.mime_type, d.original_filename)
  )
  const isMerged = pdfDocs.length > 1
  const mergedFilename = isMerged ? generateMergedPdfFilename(companyName) : null

  return (
    <Dialog open={open} onOpenChange={isSending ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="space-y-1 pb-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1">
            <Send className="h-5 w-5" />
          </div>
          <DialogTitle className="text-base font-bold text-foreground">
            Konfirmasi Pengiriman Lamaran
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Periksa kembali detail sebelum email dikirim langsung ke HRD melalui Google Gmail API.
          </DialogDescription>
        </DialogHeader>

        {/* Summary Card */}
        <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2.5 text-xs">
          <div className="flex items-start justify-between border-b border-border/50 pb-2">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Perusahaan:</span>
            </span>
            <span className="font-semibold text-foreground text-right truncate">
              {companyName}
            </span>
          </div>

          <div className="flex items-start justify-between border-b border-border/50 pb-2">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Briefcase className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Posisi Dilamar:</span>
            </span>
            <span className="font-semibold text-foreground text-right truncate">
              {position}
            </span>
          </div>

          <div className="flex items-start justify-between border-b border-border/50 pb-2">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Penerima:</span>
            </span>
            <span className="font-semibold text-foreground text-right truncate font-mono">
              {recipientEmail}
            </span>
          </div>

          <div className="flex items-start justify-between border-b border-border/50 pb-2">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <User className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Pengirim:</span>
            </span>
            <span className="text-foreground text-right truncate">
              {senderName} {senderEmail ? `(${senderEmail})` : ''}
            </span>
          </div>

          <div className="space-y-1 border-b border-border/50 pb-2">
            <span className="text-muted-foreground font-medium block">Subject:</span>
            <span className="font-semibold text-primary block truncate">
              {resolvedSubject}
            </span>
          </div>

          <div className="space-y-2 pt-0.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Paperclip className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Lampiran Email:</span>
              </span>
              <div className="text-right">
                <Badge variant="secondary" className="text-[10px]">
                  {selectedDocuments.length === 0
                    ? 'Tanpa Lampiran'
                    : isMerged
                    ? `1 PDF Gabungan (${pdfDocs.length} dok)${nonPdfDocs.length > 0 ? ` + ${nonPdfDocs.length} file` : ''}`
                    : `${selectedDocuments.length} Dokumen`}
                </Badge>
              </div>
            </div>

            {/* Display merged attachment name if merged */}
            {isMerged && mergedFilename && (
              <div className="p-2.5 rounded-lg bg-background border border-primary/20 space-y-2 text-[11px]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <FileCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="font-mono font-medium truncate">{mergedFilename}</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] shrink-0 text-primary border-primary/30">
                    1 PDF Gabungan ({formatBytes(pdfDocs.reduce((a, d) => a + (d.file_size || 0), 0))})
                  </Badge>
                </div>
                <div className="pl-5 space-y-1 text-muted-foreground text-[10px] border-t border-border/40 pt-1.5">
                  <span className="font-medium text-foreground/80 block">Urutan Halaman Gabungan:</span>
                  {pdfDocs.map((doc, idx) => (
                    <div key={doc.id} className="flex items-center justify-between gap-2">
                      <span className="truncate">
                        <span className="text-primary font-mono font-semibold">#{doc.sort_order ?? doc.order ?? idx + 1}</span> {doc.document_name}
                      </span>
                      <span className="font-mono shrink-0">{formatBytes(doc.file_size)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Single PDF if not merged */}
            {!isMerged && pdfDocs.length === 1 && (
              <div className="p-2 rounded-md bg-background border border-border/70 flex items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 truncate">
                  <Paperclip className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">
                    <span className="text-primary font-mono font-semibold mr-1">#{pdfDocs[0].sort_order ?? pdfDocs[0].order ?? 1}</span>
                    {pdfDocs[0].document_name}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground shrink-0">{formatBytes(pdfDocs[0].file_size)}</span>
              </div>
            )}

            {/* Non-PDF documents */}
            {nonPdfDocs.map((doc, idx) => (
              <div key={doc.id} className="p-2 rounded-md bg-background border border-border/70 flex items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 truncate">
                  <Paperclip className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">
                    <span className="text-primary font-mono font-semibold mr-1">
                      #{doc.sort_order ?? doc.order ?? idx + 1}
                    </span>
                    {doc.document_name}
                  </span>
                  <Badge variant="outline" className="text-[9px] px-1 py-0">Non-PDF</Badge>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground shrink-0">{formatBytes(doc.file_size)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-[11px] text-amber-700 dark:text-amber-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            Email akan dikirimkan secara riil dan langsung masuk ke inbox HRD. Dokumen terpilih akan dilampirkan otomatis.
          </span>
        </div>

        <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            Periksa Kembali
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirmSend}
            disabled={isSending}
            className="gap-2 shadow-xs"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Mengirim Email...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Ya, Kirim Lamaran</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

