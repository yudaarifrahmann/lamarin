'use client'

import * as React from 'react'
import {
  Upload,
  FileText,
  X,
  Loader2,
  Plus,
  AlertCircle,
  CheckCircle2,
  ImageIcon,
  RefreshCw,
  Info,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
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
const UPLOAD_TIMEOUT_MS = 60_000 // 60s per file

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
])
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.webp']

// ─── Types ────────────────────────────────────────────────────────────────────
interface SelectedFileItem {
  id: string
  file: File
  documentName: string
  validationError?: string
}

type UploadPhase = 'idle' | 'uploading' | 'saving' | 'done' | 'error'

interface UploadItemStatus {
  phase: UploadPhase
  progressPct: number
  message?: string
  errorCategory?: string
  storagePath?: string
  uploadMethod?: 'XHR-Direct' | 'Supabase-SDK'
}

export interface UploadDiagnosticEntry {
  id: string
  timestamp: string
  filename: string
  fileSize: number
  reportedType: string
  resolvedMime: string
  method: string
  progressPct: number
  status: UploadPhase
  errorCategory?: string
  httpStatus?: number
  rawError?: string
  userAgent: string
  isOnline: boolean
}

interface DocumentUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

// ─── Helpers: MIME & File Normalization ────────────────────────────────────────

/**
 * Normalizes and resolves exact MIME type for a file.
 * Handles Android Chrome quirks where file.type can be empty or generic application/octet-stream.
 */
export function resolveMimeType(file: File): string {
  const rawType = (file.type || '').trim().toLowerCase()
  if (rawType && rawType !== 'application/octet-stream') {
    const base = rawType.split(';')[0].trim()
    if (ALLOWED_MIME_TYPES.has(base)) {
      return base === 'image/jpg' ? 'image/jpeg' : base
    }
  }

  const ext = file.name.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'pdf':
      return 'application/pdf'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    case 'doc':
      return 'application/msword'
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    default:
      return rawType || 'application/octet-stream'
  }
}

/**
 * Validates file size and format before upload starts.
 */
function validateFile(file: File): string | null {
  if (file.size === 0) return 'File kosong (0 byte).'
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `Ukuran ${formatBytes(file.size)} melebihi batas 10MB.`
  }
  const mime = resolveMimeType(file)
  const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '')
  if (!ALLOWED_MIME_TYPES.has(mime) && !ALLOWED_EXTENSIONS.includes(ext)) {
    return `Format tidak didukung: ${file.type || ext}. Gunakan PDF, DOC, DOCX, JPG, PNG, atau WebP.`
  }
  return null
}

/**
 * Human-friendly categorized error formatting
 */
function formatHumanError(
  category: string,
  rawMessage: string,
  httpStatus?: number,
  mimeType?: string
): string {
  switch (category) {
    case 'TIMEOUT':
      return 'Waktu upload habis (timeout 60 detik). Periksa stabilitas koneksi Anda.'
    case 'ABORTED':
      return 'Upload dibatalkan oleh pengguna.'
    case 'AUTH_OR_RLS':
      return 'Akses ditolak oleh Supabase Storage (RLS). Pastikan sesi login aktif.'
    case 'FILE_TOO_LARGE':
      return 'Ukuran file melebihi batas maksimum 10MB yang diizinkan bucket.'
    case 'INVALID_MIME':
      return `Format file (${mimeType || 'tidak dikenal'}) ditolak oleh Supabase Storage.`
    case 'SERVER_ERROR':
      return `Server Supabase Storage mengalami gangguan (HTTP ${httpStatus || 500}). Silakan coba lagi.`
    case 'METADATA_ERROR':
      return `File tersimpan di Storage, namun gagal mencatat data: ${rawMessage}`
    case 'NETWORK_ERROR':
    default:
      return `Gagal mengunggah file ke Storage: ${rawMessage || 'Kesalahan jaringan'}`
  }
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
  const [diagnostics, setDiagnostics] = React.useState<UploadDiagnosticEntry[]>([])
  const [showDiagnostics, setShowDiagnostics] = React.useState(false)
  const [isCopied, setIsCopied] = React.useState(false)

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const abortControllersRef = React.useRef<Record<string, AbortController>>({})

  // ── Reset state when modal closes ──────────────────────────────────────────
  React.useEffect(() => {
    if (!open) {
      Object.values(abortControllersRef.current).forEach((ac) => ac.abort())
      abortControllersRef.current = {}
      setItems([])
      setStatuses({})
      setIsUploading(false)
      setShowDiagnostics(false)
    }
  }, [open])

  const setStatus = (id: string, status: UploadItemStatus) => {
    setStatuses((prev) => ({ ...prev, [id]: status }))
  }

  const logDiagnostic = (entry: UploadDiagnosticEntry) => {
    setDiagnostics((prev) => {
      const idx = prev.findIndex((d) => d.id === entry.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = entry
        return next
      }
      return [entry, ...prev]
    })
  }

  // ── File Selection ─────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newItems: SelectedFileItem[] = Array.from(files).map((file) => {
      const fallbackName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      return {
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        documentName: fallbackName,
        validationError: validateFile(file) ?? undefined,
      }
    })

    setItems((prev) => [...prev, ...newItems])
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

  // ── Core Upload Execution for a Single Item ────────────────────────────────
  const uploadSingleItem = async (
    item: SelectedFileItem,
    supabaseClient: ReturnType<typeof createClient>,
    userId: string,
    accessToken: string,
    supabaseUrl: string,
    anonKey: string
  ): Promise<{ success: boolean; error?: string }> => {
    const resolvedMime = resolveMimeType(item.file)
    const sanitizedFileName = item.file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `${userId}/${Date.now()}-${sanitizedFileName}`

    const ac = new AbortController()
    abortControllersRef.current[item.id] = ac
    let isTimeout = false
    const timeoutId = setTimeout(() => {
      isTimeout = true
      ac.abort()
    }, UPLOAD_TIMEOUT_MS)

    const diag: UploadDiagnosticEntry = {
      id: item.id,
      timestamp: new Date().toISOString(),
      filename: item.file.name,
      fileSize: item.file.size,
      reportedType: item.file.type || '(empty)',
      resolvedMime,
      method: 'XHR-Direct',
      progressPct: 0,
      status: 'uploading',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    }

    try {
      setStatus(item.id, { phase: 'uploading', progressPct: 0, uploadMethod: 'XHR-Direct' })

      // ── Step A: Read file bytes into in-memory Blob upfront (Android Safe) ──
      // This prevents Android ContentProvider stream drop & net::ERR_UPLOAD_FILE_CHANGED
      const arrayBuffer = await item.file.arrayBuffer()
      const safeBlob = new Blob([arrayBuffer], { type: resolvedMime })

      // ── Step B: Upload directly to Supabase Storage (XHR with Fallback) ──
      let uploadSucceeded = false
      let lastXhrError: string | null = null
      let lastHttpStatus: number | undefined = undefined

      try {
        // Attempt 1: Direct XHR with true byte-level progress
        await new Promise<void>((resolve, reject) => {
          const url = `${supabaseUrl}/storage/v1/object/${STORAGE_BUCKET}/${storagePath}`
          const xhr = new XMLHttpRequest()

          ac.signal.addEventListener('abort', () => {
            xhr.abort()
            if (isTimeout) {
              reject(new Error('TIMEOUT'))
            } else {
              reject(new Error('ABORTED'))
            }
          })

          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable && e.total > 0) {
              const pct = Math.min(95, Math.round((e.loaded / e.total) * 100))
              setStatus(item.id, { phase: 'uploading', progressPct: pct, uploadMethod: 'XHR-Direct' })
              diag.progressPct = pct
            }
          })

          xhr.addEventListener('load', () => {
            lastHttpStatus = xhr.status
            diag.httpStatus = xhr.status
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve()
            } else {
              let msg = `HTTP ${xhr.status}`
              try {
                const body = JSON.parse(xhr.responseText)
                msg = body?.message || body?.error || msg
              } catch {
                // ignore
              }
              reject(new Error(msg))
            }
          })

          xhr.addEventListener('error', () => {
            diag.httpStatus = xhr.status
            reject(new Error('XHR_NETWORK_ERROR'))
          })

          xhr.addEventListener('abort', () => {
            if (isTimeout) reject(new Error('TIMEOUT'))
            else reject(new Error('ABORTED'))
          })

          xhr.open('POST', url, true)
          // Critical Supabase API Gateway headers
          xhr.setRequestHeader('apikey', anonKey)
          xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`)
          xhr.setRequestHeader('x-upsert', 'false')

          // Use FormData wrapping to conform with Supabase Storage multipart parser
          const fd = new FormData()
          fd.append('cacheControl', '3600')
          fd.append('', safeBlob, item.file.name)

          xhr.send(fd)
        })

        uploadSucceeded = true
      } catch (xhrErr: unknown) {
        const rawMsg = xhrErr instanceof Error ? xhrErr.message : String(xhrErr)
        lastXhrError = rawMsg

        if (rawMsg === 'TIMEOUT' || rawMsg === 'ABORTED') {
          throw xhrErr
        }

        // If XHR encounters network/CORS error on Android Chrome, fallback to Supabase SDK
        diag.method = 'Supabase-SDK (Fallback)'
        setStatus(item.id, {
          phase: 'uploading',
          progressPct: 50,
          uploadMethod: 'Supabase-SDK',
        })

        const sdkResult = await supabaseClient.storage
          .from(STORAGE_BUCKET)
          .upload(storagePath, safeBlob, {
            contentType: resolvedMime,
            upsert: false,
          })

        if (sdkResult.error) {
          diag.rawError = `SDK Error: ${sdkResult.error.message} (prev XHR: ${lastXhrError})`
          diag.httpStatus = (sdkResult.error as any)?.status || (sdkResult.error as any)?.statusCode
          throw new Error(sdkResult.error.message)
        }

        uploadSucceeded = true
      }

      clearTimeout(timeoutId)

      if (!uploadSucceeded) {
        throw new Error(lastXhrError || 'Gagal mengunggah file ke Storage.')
      }

      // ── Step C: Save metadata to PostgreSQL ─────────────────────────────────
      setStatus(item.id, {
        phase: 'saving',
        progressPct: 95,
        storagePath,
      })
      diag.status = 'saving'

      const metaResult = await saveDocumentMetadataAction({
        storagePath,
        documentName: item.documentName || item.file.name.replace(/\.[^/.]+$/, ''),
        originalFilename: item.file.name,
        mimeType: resolvedMime,
        fileSize: item.file.size,
      })

      if (metaResult.success) {
        setStatus(item.id, { phase: 'done', progressPct: 100, storagePath })
        diag.status = 'done'
        diag.progressPct = 100
        logDiagnostic(diag)
        return { success: true }
      } else {
        const errDesc = metaResult.error || 'Gagal menyimpan metadata ke database.'
        setStatus(item.id, {
          phase: 'error',
          progressPct: 95,
          message: errDesc,
          errorCategory: 'METADATA_ERROR',
          storagePath,
        })
        diag.status = 'error'
        diag.errorCategory = 'METADATA_ERROR'
        diag.rawError = errDesc
        logDiagnostic(diag)
        return { success: false, error: errDesc }
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId)
      const rawMsg = err instanceof Error ? err.message : String(err)
      let cat = 'NETWORK_ERROR'

      if (rawMsg === 'TIMEOUT' || isTimeout) cat = 'TIMEOUT'
      else if (rawMsg === 'ABORTED') cat = 'ABORTED'
      else if (diag.httpStatus === 401 || diag.httpStatus === 403 || rawMsg.includes('security') || rawMsg.includes('Unauthorized')) {
        cat = 'AUTH_OR_RLS'
      } else if (diag.httpStatus === 413 || rawMsg.includes('exceeded') || rawMsg.includes('large')) {
        cat = 'FILE_TOO_LARGE'
      } else if (diag.httpStatus === 415 || rawMsg.includes('mime type')) {
        cat = 'INVALID_MIME'
      } else if (diag.httpStatus && diag.httpStatus >= 500) {
        cat = 'SERVER_ERROR'
      }

      const formatted = formatHumanError(cat, rawMsg, diag.httpStatus, resolvedMime)
      setStatus(item.id, {
        phase: 'error',
        progressPct: 0,
        message: formatted,
        errorCategory: cat,
      })
      diag.status = 'error'
      diag.errorCategory = cat
      diag.rawError = rawMsg
      logDiagnostic(diag)
      return { success: false, error: formatted }
    } finally {
      delete abortControllersRef.current[item.id]
    }
  }

  // ── Handle Upload All ──────────────────────────────────────────────────────
  const handleUploadAll = async () => {
    const validItems = items.filter((it) => !it.validationError)
    if (validItems.length === 0 || isUploading) return

    setIsUploading(true)

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
      const prevStatus = statuses[item.id]
      if (prevStatus?.phase === 'done') {
        successCount++
        continue
      }

      const res = await uploadSingleItem(item, supabase, userId, accessToken, supabaseUrl, anonKey)
      if (res.success) {
        successCount++
      } else {
        errors.push(`${item.documentName}: ${res.error}`)
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
      if (errors.length === 0) {
        onOpenChange(false)
      }
    }

    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err))
    }
  }

  // ── Handle Retry for a Single Failed Item ──────────────────────────────────
  const handleRetryItem = async (item: SelectedFileItem) => {
    if (isUploading) return
    setIsUploading(true)

    const supabase = createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      toast.error('Sesi login telah berakhir. Silakan login kembali.')
      setIsUploading(false)
      return
    }

    const res = await uploadSingleItem(
      item,
      supabase,
      session.user.id,
      session.access_token,
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    setIsUploading(false)

    if (res.success) {
      toast.success(`Dokumen "${item.documentName}" berhasil diunggah!`)
      onSuccess()
    } else {
      toast.error(res.error || 'Gagal mengunggah dokumen.')
    }
  }

  const handleCopyDiagnostics = () => {
    if (diagnostics.length === 0) return
    navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2))
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
    toast.info('Data diagnostik disalin ke clipboard.')
  }

  // ── Render Helpers ─────────────────────────────────────────────────────────
  const getItemIcon = (item: SelectedFileItem) => {
    const mime = resolveMimeType(item.file)
    if (mime.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />
    }
    return <FileText className="h-4 w-4" />
  }

  const getStatusBadge = (item: SelectedFileItem) => {
    const s = statuses[item.id]
    if (!s || s.phase === 'idle') return null
    if (s.phase === 'uploading') {
      return (
        <span className="text-[10px] text-primary font-medium flex items-center gap-1">
          <span>Mengunggah... {s.progressPct}%</span>
          {s.uploadMethod && (
            <span className="text-[9px] text-muted-foreground font-mono">({s.uploadMethod})</span>
          )}
        </span>
      )
    }
    if (s.phase === 'saving') {
      return <span className="text-[10px] text-primary font-medium">Menyimpan metadata...</span>
    }
    if (s.phase === 'done') {
      return (
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Berhasil Disimpan
        </span>
      )
    }
    if (s.phase === 'error') {
      return (
        <div className="flex items-center gap-2 max-w-full">
          <span
            className="text-[10px] text-destructive font-medium flex items-center gap-1 truncate"
            title={s.message}
          >
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span className="truncate">{s.message}</span>
          </span>
          <button
            type="button"
            onClick={() => handleRetryItem(item)}
            className="text-[10px] text-primary hover:underline font-semibold shrink-0 cursor-pointer inline-flex items-center gap-0.5"
            disabled={isUploading}
          >
            <RefreshCw className="h-2.5 w-2.5" />
            <span>Coba Lagi</span>
          </button>
        </div>
      )
    }
  }

  const allDone =
    items.length > 0 &&
    items.every((it) => {
      const s = statuses[it.id]
      return s?.phase === 'done' || s?.phase === 'error'
    })

  const uploadingCount = items.filter((it) => {
    const s = statuses[it.id]
    return s?.phase === 'uploading' || s?.phase === 'saving'
  }).length

  const validItemCount = items.filter((it) => !it.validationError).length

  return (
    <Dialog open={open} onOpenChange={isUploading ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            <span>Unggah Dokumen Lamaran</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Unggah berkas CV, résumé, SKCK, atau ijazah langsung ke Supabase Storage (Kompatibel dengan Desktop & Chrome Android).
          </DialogDescription>
        </DialogHeader>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        {/* Dropzone */}
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-5 sm:p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors text-center group ${
            isUploading
              ? 'border-border/40 opacity-50 cursor-not-allowed'
              : 'border-border/80 hover:border-primary/50 hover:bg-muted/40'
          }`}
        >
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Plus className="h-5 w-5" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-foreground">
            Pilih dokumen dari galeri atau berkas perangkat
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Mendukung PDF, DOC, DOCX, JPG, PNG, WebP (Maks. 10MB per file)
          </p>
        </div>

        {/* File List */}
        {items.length > 0 && (
          <div className="flex-1 overflow-y-auto space-y-2.5 py-1 pr-1 max-h-[260px]">
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
                  onClick={() => {
                    setItems([])
                    setStatuses({})
                  }}
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
              const progress = status?.progressPct || 0

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
                        <Label
                          htmlFor={`name-${item.id}`}
                          className="text-[11px] font-medium text-muted-foreground shrink-0"
                        >
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
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pl-6 font-mono truncate">
                        <span className="truncate">{item.file.name}</span>
                        <span className="ml-2 shrink-0 text-[9px] px-1 rounded bg-muted">
                          {resolveMimeType(item.file).split('/')[1]?.toUpperCase()}
                        </span>
                      </div>
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

                  {item.validationError && (
                    <p className="text-[11px] text-destructive font-medium flex items-center gap-1 pl-10">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      {item.validationError}
                    </p>
                  )}

                  {!item.validationError && (isActive || isDone || isError) && (
                    <div className="pl-10 space-y-1">
                      {!isError && (
                        <div className="h-1.5 w-full rounded-full bg-primary/20 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-200 ease-out"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        {getStatusBadge(item)}
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

        {/* Global Uploading Banner */}
        {isUploading && uploadingCount > 0 && (
          <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-2 text-xs text-primary">
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            <span className="font-medium">
              Sedang mengunggah {uploadingCount} berkas langsung ke Supabase Storage...
            </span>
          </div>
        )}

        {/* Collapsible Diagnostics Panel for Comparing Laptop & Android */}
        {diagnostics.length > 0 && (
          <div className="border border-border/80 rounded-lg p-2.5 bg-muted/20 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowDiagnostics((prev) => !prev)}
                className="flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground text-[11px] cursor-pointer"
              >
                <Info className="h-3.5 w-3.5 text-primary" />
                <span>Log Diagnostik Perangkat ({diagnostics.length})</span>
                {showDiagnostics ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>

              {showDiagnostics && (
                <button
                  type="button"
                  onClick={handleCopyDiagnostics}
                  className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline font-mono cursor-pointer"
                >
                  {isCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  <span>{isCopied ? 'Tersalin' : 'Salin Data Diagnostik'}</span>
                </button>
              )}
            </div>

            {showDiagnostics && (
              <div className="max-h-32 overflow-y-auto space-y-1 font-mono text-[10px] text-muted-foreground border-t border-border/40 pt-1.5">
                {diagnostics.map((d, i) => (
                  <div key={i} className="p-1.5 rounded bg-background border border-border/60 space-y-0.5">
                    <div className="flex items-center justify-between font-bold text-foreground">
                      <span className="truncate">{d.filename}</span>
                      <span className={d.status === 'done' ? 'text-emerald-500' : 'text-destructive'}>
                        {d.status.toUpperCase()}
                      </span>
                    </div>
                    <div>Metode: {d.method} | MIME: {d.resolvedMime}</div>
                    {d.httpStatus && <div>HTTP Status: {d.httpStatus}</div>}
                    {d.rawError && <div className="text-destructive truncate">Err: {d.rawError}</div>}
                    <div className="truncate text-[9px] opacity-70">UA: {d.userAgent}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (isUploading) {
                Object.values(abortControllersRef.current).forEach((ac) => ac.abort())
                setIsUploading(false)
                toast.info('Proses upload dibatalkan.')
              }
              onOpenChange(false)
            }}
          >
            {isUploading ? 'Batalkan Upload' : allDone ? 'Tutup' : 'Batal'}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleUploadAll}
            disabled={
              validItemCount === 0 ||
              isUploading ||
              (allDone && !items.some((it) => statuses[it.id]?.phase === 'error'))
            }
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
                  {validItemCount > 0 ? `Unggah ${validItemCount} Dokumen` : 'Unggah Dokumen'}
                </span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
