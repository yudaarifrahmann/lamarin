'use client'

import * as React from 'react'
import { Upload, FileText, X, Loader2, Plus, AlertCircle, CheckCircle2, ImageIcon } from 'lucide-react'
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
import { createClient } from '@/lib/supabase/client'
import { saveDocumentMetadataAction } from '@/app/actions/documents'

// ─── Constants ────────────────────────────────────────────────────────────────
const STORAGE_BUCKET = 'application-documents'
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const UPLOAD_TIMEOUT_MS = 60_000 // 60 s per file — if Supabase doesn't respond, abort

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
])
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.webp']

// ─── Types ────────────────────────────────────────────────────────────────────
interface SelectedFileItem {
  id: string
  file: File
  documentName: string
  /** Validation error shown before upload starts */
  validationError?: string
}

type UploadItemStatus =
  | { phase: 'idle' }
  | { phase: 'uploading'; progressPct: number }
  | { phase: 'saving' }
  | { phase: 'done' }
  | { phase: 'error'; message: string }

interface DocumentUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function validateFile(file: File): string | null {
  if (file.size === 0) return 'File kosong (0 byte).'
  if (file.size > MAX_FILE_SIZE_BYTES)
    return `Ukuran ${formatBytes(file.size)} melebihi batas 10MB.`
  const mime = file.type || ''
  const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '')
  if (!ALLOWED_MIME_TYPES.has(mime) && !ALLOWED_EXTENSIONS.includes(ext))
    return `Format tidak didukung: ${mime || ext}. Gunakan PDF, DOC, DOCX, JPG, PNG, atau WebP.`
  return null
}

/**
 * Upload a single file directly from the browser to Supabase Storage.
 * Uses XMLHttpRequest so we get real byte-level progress events.
 * Resolves with the storage path on success, rejects with an Error on failure.
 * AbortSignal is used to cancel in-flight requests on timeout or user action.
 */
function uploadFileToStorage(
  file: File,
  storagePath: string,
  supabaseUrl: string,
  anonKey: string,
  accessToken: string,
  onProgress: (pct: number) => void,
  signal: AbortSignal
): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = `${supabaseUrl}/storage/v1/object/${STORAGE_BUCKET}/${storagePath}`

    const xhr = new XMLHttpRequest()

    // Abort when signal fires
    signal.addEventListener('abort', () => {
      xhr.abort()
      reject(new Error('Upload dibatalkan atau waktu habis (timeout).'))
    })

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100)
        resolve()
      } else {
        let errMsg = `HTTP ${xhr.status}`
        try {
          const body = JSON.parse(xhr.responseText)
          errMsg = body?.message || body?.error || errMsg
        } catch {
          // ignore JSON parse error
        }
        reject(new Error(`Gagal mengunggah ke Storage: ${errMsg}`))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Koneksi ke Supabase Storage terputus. Periksa koneksi internet Anda.'))
    })

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload dibatalkan.'))
    })

    xhr.open('POST', url, true)
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`)
    xhr.setRequestHeader('x-upsert', 'false')
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

    xhr.send(file)
  })
}

// ─── Component ────────────────────────────────────────────────────────────────
export function DocumentUploadModal({
  open,
  onOpenChange,
  onSuccess,
}: DocumentUploadModalProps) {
  const [items, setItems] = React.useState<SelectedFileItem[]>([])
  const [statuses, setStatuses] = React.useState<Record<string, UploadItemStatus>>({})
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  // Keep AbortControllers per item so we can cancel individual uploads
  const abortControllersRef = React.useRef<Record<string, AbortController>>({})

  // ── Reset state when modal closes ──────────────────────────────────────────
  React.useEffect(() => {
    if (!open) {
      // Cancel any in-flight uploads when modal is closed
      Object.values(abortControllersRef.current).forEach((ac) => ac.abort())
      abortControllersRef.current = {}
      setItems([])
      setStatuses({})
      setIsUploading(false)
    }
  }, [open])

  // ── Derived state ──────────────────────────────────────────────────────────
  const hasValidationErrors = items.some((it) => it.validationError)
  const allDone =
    items.length > 0 &&
    items.every((it) => {
      const s = statuses[it.id]
      return s?.phase === 'done' || s?.phase === 'error'
    })

  const setStatus = (id: string, status: UploadItemStatus) => {
    setStatuses((prev) => ({ ...prev, [id]: status }))
  }

  // ── File selection ─────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newItems: SelectedFileItem[] = Array.from(files).map((file) => {
      const fallbackName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      return {
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        documentName: fallbackName,
        validationError: validateFile(file) ?? undefined,
      }
    })

    setItems((prev) => [...prev, ...newItems])
    // Reset so the same file can be re-added
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleNameChange = (id: string, newName: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, documentName: newName } : item))
    )
  }

  const handleRemoveItem = (id: string) => {
    abortControllersRef.current[id]?.abort()
    delete abortControllersRef.current[id]
    setItems((prev) => prev.filter((item) => item.id !== id))
    setStatuses((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  // ── Upload all ─────────────────────────────────────────────────────────────
  const handleUploadAll = async () => {
    const validItems = items.filter((it) => !it.validationError)
    if (validItems.length === 0) return
    if (isUploading) return // prevent double submit

    setIsUploading(true)

    // ── Get Supabase session (access token needed for Storage REST API) ────
    const supabase = createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      toast.error('Sesi login telah berakhir. Silakan login kembali.')
      setIsUploading(false)
      return
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const accessToken = session.access_token
    const userId = session.user.id

    let successCount = 0
    const errors: string[] = []

    for (const item of validItems) {
      // Skip already finished items (if user re-triggers accidentally)
      const prevStatus = statuses[item.id]
      if (prevStatus?.phase === 'done') {
        successCount++
        continue
      }

      setStatus(item.id, { phase: 'uploading', progressPct: 0 })

      // Build storage path: {user_id}/{timestamp}-{sanitized_filename}
      const sanitizedFileName = item.file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const storagePath = `${userId}/${Date.now()}-${sanitizedFileName}`

      // AbortController: fires after UPLOAD_TIMEOUT_MS of no completion
      const ac = new AbortController()
      abortControllersRef.current[item.id] = ac
      const timeoutId = setTimeout(() => ac.abort(), UPLOAD_TIMEOUT_MS)

      try {
        // ── Step 1: Direct browser → Supabase Storage upload ──────────────
        await uploadFileToStorage(
          item.file,
          storagePath,
          supabaseUrl,
          anonKey,
          accessToken,
          (pct) => setStatus(item.id, { phase: 'uploading', progressPct: pct }),
          ac.signal
        )
        clearTimeout(timeoutId)

        // ── Step 2: Server Action saves metadata to DB ─────────────────────
        setStatus(item.id, { phase: 'saving' })
        const result = await saveDocumentMetadataAction({
          storagePath,
          documentName: item.documentName || item.file.name.replace(/\.[^/.]+$/, ''),
          originalFilename: item.file.name,
          mimeType: item.file.type || 'application/octet-stream',
          fileSize: item.file.size,
        })

        if (result.success) {
          setStatus(item.id, { phase: 'done' })
          successCount++
        } else {
          setStatus(item.id, { phase: 'error', message: result.error || 'Gagal menyimpan metadata.' })
          errors.push(`${item.documentName}: ${result.error || 'Gagal menyimpan metadata.'}`)
        }
      } catch (err: unknown) {
        clearTimeout(timeoutId)
        const msg = err instanceof Error ? err.message : 'Gagal mengunggah.'
        setStatus(item.id, { phase: 'error', message: msg })
        errors.push(`${item.documentName}: ${msg}`)
      } finally {
        delete abortControllersRef.current[item.id]
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
      // Auto-close only if everything succeeded
      if (errors.length === 0) {
        onOpenChange(false)
      }
    }

    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err))
    }
  }

  // ── Render helpers ─────────────────────────────────────────────────────────
  const getItemIcon = (item: SelectedFileItem) => {
    if (item.file.type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />
    }
    return <FileText className="h-4 w-4" />
  }

  const getStatusBadge = (id: string) => {
    const s = statuses[id]
    if (!s || s.phase === 'idle') return null
    if (s.phase === 'uploading')
      return (
        <span className="text-[10px] text-primary font-medium">
          Mengunggah... {s.progressPct}%
        </span>
      )
    if (s.phase === 'saving')
      return <span className="text-[10px] text-primary font-medium">Menyimpan metadata...</span>
    if (s.phase === 'done')
      return (
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Berhasil
        </span>
      )
    if (s.phase === 'error')
      return (
        <span className="text-[10px] text-destructive font-medium flex items-center gap-1 max-w-[200px] truncate" title={s.message}>
          <AlertCircle className="h-3 w-3 shrink-0" />
          {s.message}
        </span>
      )
  }

  const getItemProgress = (id: string): number => {
    const s = statuses[id]
    if (!s || s.phase === 'idle') return 0
    if (s.phase === 'uploading') return Math.round(s.progressPct * 0.9) // 0–90%: uploading
    if (s.phase === 'saving') return 95 // 90–95%: saving metadata
    if (s.phase === 'done') return 100
    return 0
  }

  const uploadingCount = items.filter((it) => {
    const s = statuses[it.id]
    return s?.phase === 'uploading' || s?.phase === 'saving'
  }).length

  const validItemCount = items.filter((it) => !it.validationError).length

  return (
    <Dialog open={open} onOpenChange={isUploading ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            <span>Unggah Dokumen Lamaran</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Pilih berkas dokumen pendukung. File diunggah langsung dari browser ke Supabase Storage (aman, cepat, ada progress nyata).
          </DialogDescription>
        </DialogHeader>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,application/pdf"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        {/* Dropzone */}
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors text-center group ${
            isUploading
              ? 'border-border/40 opacity-50 cursor-not-allowed'
              : 'border-border/80 hover:border-primary/50 hover:bg-muted/40'
          }`}
        >
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Plus className="h-5 w-5" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-foreground">
            Klik untuk memilih berkas dari perangkat
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            PDF, DOC, DOCX, JPG, PNG, WebP — maks. 10MB per berkas
          </p>
        </div>

        {/* File List */}
        {items.length > 0 && (
          <div className="flex-1 overflow-y-auto space-y-2.5 py-1 pr-1 max-h-[280px]">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>
                {items.length} berkas dipilih
                {validItemCount < items.length && (
                  <span className="text-destructive ml-1">
                    ({items.length - validItemCount} tidak valid)
                  </span>
                )}
              </span>
              {!isUploading && (
                <button
                  type="button"
                  onClick={() => { setItems([]); setStatuses({}) }}
                  className="text-[11px] text-destructive hover:underline cursor-pointer"
                >
                  Hapus Semua
                </button>
              )}
            </div>

            {items.map((item, index) => {
              const status = statuses[item.id]
              const isDone = status?.phase === 'done'
              const isError = status?.phase === 'error'
              const isActive = status?.phase === 'uploading' || status?.phase === 'saving'
              const progress = getItemProgress(item.id)

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border bg-muted/20 flex flex-col gap-2 relative transition-colors ${
                    isDone
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : isError || item.validationError
                      ? 'border-destructive/30 bg-destructive/5'
                      : isActive
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border/80'
                  }`}
                >
                  {/* Top row: icon + name input + size + remove */}
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isDone
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : isError || item.validationError
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : isError || item.validationError ? (
                        <AlertCircle className="h-4 w-4" />
                      ) : (
                        getItemIcon(item)
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`name-${item.id}`} className="text-[11px] font-medium text-muted-foreground shrink-0">
                          #{index + 1}:
                        </Label>
                        <Input
                          id={`name-${item.id}`}
                          value={item.documentName}
                          onChange={(e) => handleNameChange(item.id, e.target.value)}
                          placeholder="Nama dokumen..."
                          className="h-7 text-xs font-medium flex-1"
                          disabled={isUploading || isDone}
                        />
                        <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                          {formatBytes(item.file.size)}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate font-mono pl-6">
                        {item.file.name}
                      </p>
                    </div>

                    {!isUploading && !isDone && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                        aria-label="Hapus dari daftar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Validation error */}
                  {item.validationError && (
                    <p className="text-[11px] text-destructive font-medium flex items-center gap-1 pl-10">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      {item.validationError}
                    </p>
                  )}

                  {/* Progress bar + status badge */}
                  {!item.validationError && (isActive || isDone || isError) && (
                    <div className="pl-10 space-y-1">
                      {!isError && (
                        <div className="h-1.5 w-full rounded-full bg-primary/20 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        {getStatusBadge(item.id)}
                        {isActive && (
                          <Loader2 className="h-3 w-3 animate-spin text-primary ml-auto" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Global uploading status */}
        {isUploading && uploadingCount > 0 && (
          <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-2 text-xs text-primary">
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            <span className="font-medium">
              Sedang mengunggah {uploadingCount} berkas langsung ke Supabase Storage...
            </span>
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
            {allDone ? 'Tutup' : 'Batal'}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleUploadAll}
            disabled={validItemCount === 0 || isUploading || (allDone && !items.some((it) => statuses[it.id]?.phase === 'error'))}
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
                <span>
                  {validItemCount > 0
                    ? `Unggah ${validItemCount} Dokumen`
                    : 'Unggah Dokumen'}
                </span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
