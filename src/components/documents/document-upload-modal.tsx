'use client'

import * as React from 'react'
import { Upload, FileText, X, Loader2, Plus, AlertCircle, CheckCircle2 } from 'lucide-react'
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
import { formatBytes } from '@/lib/format'
import { uploadDocumentAction } from '@/app/actions/documents'

interface SelectedFileItem {
  id: string
  file: File
  documentName: string
}

interface DocumentUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DocumentUploadModal({
  open,
  onOpenChange,
  onSuccess,
}: DocumentUploadModalProps) {
  const [items, setItems] = React.useState<SelectedFileItem[]>([])
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadIndex, setUploadIndex] = React.useState(0)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Reset state when modal is closed
  React.useEffect(() => {
    if (!open) {
      setItems([])
      setIsUploading(false)
      setUploadIndex(0)
    }
  }, [open])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newItems: SelectedFileItem[] = Array.from(files).map((file) => {
      // Default manual name to clean filename without extension
      const fallbackName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      return {
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        documentName: fallbackName,
      }
    })

    setItems((prev) => [...prev, ...newItems])
    // Reset file input so same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleNameChange = (id: string, newName: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, documentName: newName } : item))
    )
  }

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleUploadAll = async () => {
    if (items.length === 0) return

    setIsUploading(true)
    let successCount = 0
    const errors: string[] = []

    for (let i = 0; i < items.length; i++) {
      setUploadIndex(i + 1)
      const item = items[i]

      const formData = new FormData()
      formData.append('file', item.file)
      formData.append('document_name', item.documentName)

      const result = await uploadDocumentAction(formData)
      if (result.success) {
        successCount++
      } else {
        errors.push(`${item.documentName}: ${result.error || 'Gagal diunggah'}`)
      }
    }

    setIsUploading(false)

    if (successCount > 0) {
      toast.success(
        successCount === 1
          ? 'Dokumen berhasil diunggah ke Supabase Storage.'
          : `${successCount} dokumen berhasil diunggah ke Supabase Storage.`
      )
      onSuccess()
      onOpenChange(false)
    }

    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err))
    }
  }

  return (
    <Dialog open={open} onOpenChange={isUploading ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            <span>Unggah Dokumen Lamaran</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Pilih berkas dokumen pendukung (PDF, DOCX, JPG, PNG). Nama dokumen dapat Anda atur secara manual.
          </DialogDescription>
        </DialogHeader>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        {/* File Dropzone / Selector Area */}
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/80 hover:border-primary/50 hover:bg-muted/40 rounded-xl cursor-pointer transition-colors text-center group"
        >
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Plus className="h-5 w-5" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-foreground">
            Klik untuk memilih berkas dari perangkat
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Mendukung PDF, DOC, DOCX, JPG, PNG (Maksimal 10MB per berkas)
          </p>
        </div>

        {/* List of Selected Files */}
        {items.length > 0 && (
          <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1 max-h-60">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>{items.length} berkas dipilih</span>
              <button
                type="button"
                onClick={() => !isUploading && setItems([])}
                className="text-[11px] text-destructive hover:underline cursor-pointer"
                disabled={isUploading}
              >
                Hapus Semua
              </button>
            </div>

            {items.map((item, index) => (
              <div
                key={item.id}
                className="p-3 rounded-lg border border-border/80 bg-muted/20 flex flex-col sm:flex-row sm:items-center gap-3 relative"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`name-${item.id}`} className="text-[11px] font-medium text-muted-foreground">
                        Nama Dokumen #{index + 1}:
                      </Label>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        ({formatBytes(item.file.size)})
                      </span>
                    </div>
                    <Input
                      id={`name-${item.id}`}
                      value={item.documentName}
                      onChange={(e) => handleNameChange(item.id, e.target.value)}
                      placeholder="Contoh: CV, Surat Lamaran Kerja, Sertifikat..."
                      className="h-8 text-xs font-medium"
                      disabled={isUploading}
                    />
                    <p className="text-[10px] text-muted-foreground truncate font-mono">
                      File asli: {item.file.name}
                    </p>
                  </div>
                </div>

                {!isUploading && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors self-end sm:self-center"
                    aria-label="Hapus dari daftar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload Progress Indicator */}
        {isUploading && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-3 text-xs text-primary">
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            <div className="flex-1">
              <span className="font-medium">
                Sedang mengunggah berkas {uploadIndex} dari {items.length}...
              </span>
              <p className="text-[11px] text-muted-foreground">
                Menyimpan secara aman ke Supabase Storage (private).
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Batal
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleUploadAll}
            disabled={items.length === 0 || isUploading}
            className="gap-2 shadow-xs"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Mengunggah...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Unggah {items.length > 0 ? `(${items.length}) Dokumen` : 'Dokumen'}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

