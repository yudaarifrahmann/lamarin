'use client'

import * as React from 'react'
import {
  FileText,
  FileImage,
  File,
  Search,
  ExternalLink,
  Edit3,
  Trash2,
  MoreVertical,
  Loader2,
  Calendar,
  HardDrive,
  ListOrdered,
  Save,
  ArrowUpDown,
} from 'lucide-react'
import { toast } from 'sonner'
import type { DocumentRow } from '@/types/document'
import { formatBytes, formatDate } from '@/lib/format'
import { getSignedUrlAction, updateDocumentOrdersAction } from '@/app/actions/documents'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/common/empty-state'

interface DocumentListProps {
  documents: DocumentRow[]
  onRename: (doc: DocumentRow) => void
  onDelete: (doc: DocumentRow) => void
  onOpenUpload: () => void
}

function getFileIcon(mimeType: string) {
  if (mimeType.includes('pdf')) {
    return <FileText className="h-5 w-5 text-red-500" />
  }
  if (mimeType.includes('word') || mimeType.includes('document')) {
    return <FileText className="h-5 w-5 text-blue-500" />
  }
  if (mimeType.includes('image')) {
    return <FileImage className="h-5 w-5 text-emerald-500" />
  }
  return <File className="h-5 w-5 text-muted-foreground" />
}

export function DocumentList({
  documents,
  onRename,
  onDelete,
  onOpenUpload,
}: DocumentListProps) {
  const [search, setSearch] = React.useState('')
  const [openingId, setOpeningId] = React.useState<string | null>(null)

  // Sort order state: docId -> order string input
  const [orderInputs, setOrderInputs] = React.useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    documents.forEach((doc) => {
      init[doc.id] = doc.sort_order != null ? String(doc.sort_order) : ''
    })
    return init
  })
  const [isSavingOrder, setIsSavingOrder] = React.useState(false)

  // Sync orderInputs when documents prop changes (after refresh)
  React.useEffect(() => {
    const next: Record<string, string> = {}
    documents.forEach((doc) => {
      next[doc.id] = doc.sort_order != null ? String(doc.sort_order) : ''
    })
    setOrderInputs(next)
  }, [documents])

  // Validate order inputs
  const orderValidation = React.useMemo(() => {
    if (documents.length === 0) return { isValid: true, error: null }

    for (const doc of documents) {
      const raw = orderInputs[doc.id]?.trim() ?? ''
      if (!raw) {
        return { isValid: false, error: `Nomor urutan untuk "${doc.document_name}" belum diisi.` }
      }
      const num = Number(raw)
      if (!Number.isInteger(num) || num <= 0) {
        return { isValid: false, error: `Nomor urutan untuk "${doc.document_name}" harus berupa bilangan bulat positif.` }
      }
    }

    const nums = documents.map((d) => parseInt(orderInputs[d.id]?.trim() ?? '0', 10))
    if (new Set(nums).size !== nums.length) {
      return { isValid: false, error: 'Terdapat nomor urutan yang sama (duplikat). Setiap dokumen harus memiliki nomor urutan berbeda.' }
    }

    const sorted = [...nums].sort((a, b) => a - b)
    if (sorted[0] !== 1) {
      return { isValid: false, error: `Nomor urutan harus dimulai dari 1 (saat ini dimulai dari ${sorted[0]}).` }
    }
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i] !== i + 1) {
        return { isValid: false, error: `Nomor urutan harus berurutan tanpa celah. Angka ${i + 1} belum ada.` }
      }
    }

    return { isValid: true, error: null }
  }, [documents, orderInputs])

  // Check if order has changed from DB values
  const hasOrderChanged = React.useMemo(() => {
    return documents.some((doc) => {
      const dbVal = doc.sort_order != null ? String(doc.sort_order) : ''
      return (orderInputs[doc.id] ?? '') !== dbVal
    })
  }, [documents, orderInputs])

  const handleOrderChange = (docId: string, val: string) => {
    setOrderInputs((prev) => ({ ...prev, [docId]: val }))
  }

  const handleSaveOrders = async () => {
    if (!orderValidation.isValid) {
      toast.error(orderValidation.error || 'Periksa kembali nomor urutan dokumen.')
      return
    }

    setIsSavingOrder(true)
    const payload = documents.map((doc) => ({
      id: doc.id,
      sort_order: parseInt(orderInputs[doc.id]?.trim() ?? '0', 10),
    }))

    const result = await updateDocumentOrdersAction(payload)
    setIsSavingOrder(false)

    if (result.success) {
      toast.success('Urutan dokumen berhasil disimpan.')
    } else {
      toast.error(result.error || 'Gagal menyimpan urutan dokumen.')
    }
  }

  // Securely open document using short-lived signed URL
  const handleOpenSecurely = async (doc: DocumentRow) => {
    setOpeningId(doc.id)
    const result = await getSignedUrlAction(doc.storage_path)
    setOpeningId(null)

    if (result.success && result.data?.signedUrl) {
      window.open(result.data.signedUrl, '_blank', 'noopener,noreferrer')
    } else {
      toast.error(result.error || 'Gagal membuka berkas.')
    }
  }

  // Documents sorted by current order input for display
  const sortedDocuments = React.useMemo(() => {
    return [...documents].sort((a, b) => {
      const orderA = parseInt(orderInputs[a.id]?.trim() ?? '9999', 10)
      const orderB = parseInt(orderInputs[b.id]?.trim() ?? '9999', 10)
      if (isNaN(orderA)) return 1
      if (isNaN(orderB)) return -1
      return orderA - orderB
    })
  }, [documents, orderInputs])

  const filteredDocs = React.useMemo(() => {
    if (!search.trim()) return sortedDocuments
    const query = search.toLowerCase()
    return sortedDocuments.filter(
      (doc) =>
        doc.document_name.toLowerCase().includes(query) ||
        doc.original_filename.toLowerCase().includes(query)
    )
  }, [sortedDocuments, search])

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Belum Ada Dokumen Tersimpan"
        description="Kamu belum mengunggah dokumen lamaran ke Supabase Storage. Simpan CV, Surat Lamaran Kerja, SKL, atau Portofolio untuk dikirimkan secara otomatis."
        action={
          <Button size="sm" onClick={onOpenUpload} className="gap-2 shadow-xs">
            <FileText className="h-4 w-4" />
            <span>Unggah Dokumen Pertama</span>
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Sort Order Management Panel */}
      <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <ListOrdered className="h-4 w-4 text-primary" />
            <div>
              <h4 className="text-sm font-semibold text-foreground">Pengaturan Urutan Dokumen</h4>
              <p className="text-xs text-muted-foreground">
                Tentukan nomor urutan setiap dokumen. Urutan ini akan digunakan saat melampirkan dan menggabungkan PDF.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleSaveOrders}
            disabled={isSavingOrder || !hasOrderChanged || !orderValidation.isValid}
            className="h-8 gap-1.5 shadow-xs text-xs shrink-0"
          >
            {isSavingOrder ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Simpan Urutan</span>
              </>
            )}
          </Button>
        </div>

        {/* Order inputs for all documents */}
        <div className="space-y-2">
          {documents.map((doc) => {
            const isPdf = doc.mime_type.includes('pdf')
            const rawVal = orderInputs[doc.id] ?? ''
            const numVal = parseInt(rawVal.trim(), 10)
            const isInvalidNum = rawVal.trim() !== '' && (!Number.isInteger(numVal) || numVal <= 0)

            return (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-2.5 rounded-lg border border-border/60 bg-background"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="p-1.5 rounded-lg bg-muted/60 shrink-0">
                    {getFileIcon(doc.mime_type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-foreground truncate max-w-[200px]">
                        {doc.document_name}
                      </span>
                      {isPdf && (
                        <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 font-mono">
                          PDF
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate font-mono">
                      {doc.original_filename}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Label htmlFor={`sort-order-${doc.id}`} className="text-xs text-muted-foreground shrink-0">
                    Urutan:
                  </Label>
                  <Input
                    id={`sort-order-${doc.id}`}
                    type="number"
                    min="1"
                    max={documents.length}
                    value={rawVal}
                    onChange={(e) => handleOrderChange(doc.id, e.target.value)}
                    className={`w-16 h-8 text-center font-mono font-bold text-xs ${
                      isInvalidNum
                        ? 'border-destructive focus-visible:ring-destructive text-destructive'
                        : ''
                    }`}
                    placeholder="1"
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Validation error */}
        {!orderValidation.isValid && (
          <p className="text-xs text-destructive flex items-center gap-1.5">
            <span>⚠</span>
            <span>{orderValidation.error}</span>
          </p>
        )}

        {orderValidation.isValid && hasOrderChanged && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Ada perubahan urutan yang belum disimpan. Klik &quot;Simpan Urutan&quot; untuk menyimpan.
          </p>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama dokumen atau file asli..."
            className="pl-9 text-xs sm:text-sm h-9"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ArrowUpDown className="h-3.5 w-3.5" />
          <span>Menampilkan {filteredDocs.length} dari {documents.length} dokumen (urut berdasarkan nomor)</span>
        </div>
      </div>

      {filteredDocs.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-border/80 rounded-xl bg-card/30">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Tidak ada dokumen yang cocok dengan kata kunci &quot;{search}&quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredDocs.map((doc) => {
            const isOpening = openingId === doc.id
            const isPdf = doc.mime_type.includes('pdf')
            const sortOrder = orderInputs[doc.id]?.trim()

            return (
              <Card
                key={doc.id}
                className="group border-border/80 hover:border-primary/40 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <CardContent className="p-4 space-y-3">
                  {/* Top: Icon + Title + Action Menu */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="relative">
                        <div className="p-2.5 rounded-xl bg-muted/60 ring-1 ring-border shrink-0 group-hover:scale-105 transition-transform">
                          {getFileIcon(doc.mime_type)}
                        </div>
                        {sortOrder && !isNaN(parseInt(sortOrder, 10)) && (
                          <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                            {sortOrder}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-semibold text-foreground tracking-tight truncate max-w-[180px]">
                            {doc.document_name}
                          </h4>
                          {isPdf && (
                            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 font-mono">
                              PDF
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate font-mono mt-0.5" title={doc.original_filename}>
                          {doc.original_filename}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                            aria-label="Aksi dokumen"
                          />
                        }
                      >
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          onClick={() => handleOpenSecurely(doc)}
                          className="cursor-pointer gap-2"
                        >
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          <span>Lihat / Unduh</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onRename(doc)}
                          className="cursor-pointer gap-2"
                        >
                          <Edit3 className="h-4 w-4 text-muted-foreground" />
                          <span>Ubah Nama</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDelete(doc)}
                          className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Hapus Dokumen</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Metadata: File Size & Date */}
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-mono">
                      <HardDrive className="h-3 w-3" />
                      {formatBytes(doc.file_size)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(doc.created_at)}
                    </span>
                  </div>

                  {/* Action Button: View Securely */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenSecurely(doc)}
                    disabled={isOpening}
                    className="w-full h-8 text-xs gap-1.5 hover:bg-primary/5 hover:border-primary/40 transition-colors"
                  >
                    {isOpening ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Membuka Dokumen...</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Buka Dokumen (Aman)</span>
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
