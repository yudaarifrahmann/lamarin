'use client'

import * as React from 'react'
import { Send, AlertCircle, Loader2, Building2, Mail, Paperclip, User } from 'lucide-react'
import type { DocumentRow } from '@/types/document'
import { formatBytes } from '@/lib/format'
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
  resolvedSubject: string
  senderName: string
  senderEmail: string
  selectedDocuments: DocumentRow[]
  isSending: boolean
  onConfirmSend: () => void
}

export function ApplicationConfirmationModal({
  open,
  onOpenChange,
  recipientEmail,
  companyName,
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

          <div className="flex items-start justify-between pt-0.5">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Paperclip className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Lampiran:</span>
            </span>
            <div className="text-right">
              <Badge variant="secondary" className="text-[10px]">
                {selectedDocuments.length} Dokumen ({formatBytes(totalAttachmentBytes)})
              </Badge>
            </div>
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

