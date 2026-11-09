'use client'

import * as React from 'react'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { DocumentRow } from '@/types/document'
import { deleteDocumentAction } from '@/app/actions/documents'

interface DocumentDeleteDialogProps {
  document: DocumentRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DocumentDeleteDialog({
  document,
  open,
  onOpenChange,
  onSuccess,
}: DocumentDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDelete = async () => {
    if (!document) return

    setIsDeleting(true)
    const result = await deleteDocumentAction(document.id, document.storage_path)
    setIsDeleting(false)

    if (result.success) {
      toast.success(`Dokumen "${document.document_name}" berhasil dihapus.`)
      onSuccess()
      onOpenChange(false)
    } else {
      toast.error(result.error || 'Gagal menghapus dokumen.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={isDeleting ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="space-y-2">
          <div className="h-10 w-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <DialogTitle className="text-base font-bold text-foreground">
            Hapus Dokumen?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Apakah Anda yakin ingin menghapus <strong>"{document?.document_name}"</strong>? Berkas fisik di Supabase Storage dan rekaman di database akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-3 flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-2 shadow-xs"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Ya, Hapus Dokumen</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

