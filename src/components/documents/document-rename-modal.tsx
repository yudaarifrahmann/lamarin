'use client'

import * as React from 'react'
import { Edit3, Loader2 } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { DocumentRow } from '@/types/document'
import { renameDocumentAction } from '@/app/actions/documents'

interface DocumentRenameModalProps {
  document: DocumentRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DocumentRenameModal({
  document,
  open,
  onOpenChange,
  onSuccess,
}: DocumentRenameModalProps) {
  const [name, setName] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (document) {
      setName(document.document_name)
    }
  }, [document])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!document || !name.trim()) return

    setIsLoading(true)
    const result = await renameDocumentAction(document.id, name.trim())
    setIsLoading(false)

    if (result.success) {
      toast.success('Nama dokumen berhasil diperbarui.')
      onSuccess()
      onOpenChange(false)
    } else {
      toast.error(result.error || 'Gagal mengubah nama dokumen.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={isLoading ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-md p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="pb-1">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-primary" />
              <span>Ubah Nama Dokumen</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Perbarui nama label dokumen ini. Berkas asli di Supabase Storage tetap utuh.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="rename-input" className="text-xs font-medium">
              Nama Dokumen
            </Label>
            <Input
              id="rename-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: CV ATS 2026, Surat Lamaran Kerja..."
              className="h-9 text-xs sm:text-sm"
              disabled={isLoading}
              autoFocus
              required
            />
            {document && (
              <p className="text-[11px] text-muted-foreground font-mono truncate">
                File asli: {document.original_filename}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !name.trim() || name === document?.document_name}
              className="gap-2 shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Perubahan</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

