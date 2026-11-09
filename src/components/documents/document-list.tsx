'use client'

import * as React from 'react'
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  Search,
  ExternalLink,
  Edit3,
  Trash2,
  MoreVertical,
  Download,
  Loader2,
  Calendar,
  HardDrive,
} from 'lucide-react'
import { toast } from 'sonner'
import type { DocumentRow } from '@/types/document'
import { formatBytes, formatDate } from '@/lib/format'
import { getSignedUrlAction } from '@/app/actions/documents'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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

  const filteredDocs = React.useMemo(() => {
    if (!search.trim()) return documents
    const query = search.toLowerCase()
    return documents.filter(
      (doc) =>
        doc.document_name.toLowerCase().includes(query) ||
        doc.original_filename.toLowerCase().includes(query)
    )
  }, [documents, search])

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
        <div className="text-xs text-muted-foreground">
          Menampilkan {filteredDocs.length} dari {documents.length} dokumen
        </div>
      </div>

      {filteredDocs.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-border/80 rounded-xl bg-card/30">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Tidak ada dokumen yang cocok dengan kata kunci "{search}".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredDocs.map((doc) => {
            const isOpening = openingId === doc.id
            const isPdf = doc.mime_type.includes('pdf')

            return (
              <Card
                key={doc.id}
                className="group border-border/80 hover:border-primary/40 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <CardContent className="p-4 space-y-3">
                  {/* Top: Icon + Title + Action Menu */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-muted/60 ring-1 ring-border shrink-0 group-hover:scale-105 transition-transform">
                        {getFileIcon(doc.mime_type)}
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

