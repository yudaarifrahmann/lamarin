'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Plus, RefreshCw } from 'lucide-react'
import type { DocumentRow } from '@/types/document'
import { Button } from '@/components/ui/button'
import { DocumentList } from '@/components/documents/document-list'
import { DocumentUploadModal } from '@/components/documents/document-upload-modal'
import { DocumentRenameModal } from '@/components/documents/document-rename-modal'
import { DocumentDeleteDialog } from '@/components/documents/document-delete-dialog'

interface DocumentManagerProps {
  initialDocuments: DocumentRow[]
}

export function DocumentManager({ initialDocuments }: DocumentManagerProps) {
  const router = useRouter()
  const [documents, setDocuments] = React.useState<DocumentRow[]>(initialDocuments)
  const [isUploadOpen, setIsUploadOpen] = React.useState(false)
  const [renameTarget, setRenameTarget] = React.useState<DocumentRow | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<DocumentRow | null>(null)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  // Sync state if initialDocuments changes (from server revalidation)
  React.useEffect(() => {
    setDocuments(initialDocuments)
  }, [initialDocuments])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground tracking-tight">
            Koleksi Dokumen Saya
          </h3>
          <p className="text-xs text-muted-foreground">
            File tersimpan di bucket private Supabase Storage dan terenkripsi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            title="Muat ulang daftar"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            className="h-8 gap-1.5 shadow-xs font-medium text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Unggah Dokumen</span>
          </Button>
        </div>
      </div>

      {/* Main Document List */}
      <DocumentList
        documents={documents}
        onRename={(doc) => setRenameTarget(doc)}
        onDelete={(doc) => setDeleteTarget(doc)}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Upload Modal (Multiple files & manual naming support) */}
      <DocumentUploadModal
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onSuccess={handleRefresh}
      />

      {/* Rename Modal */}
      <DocumentRenameModal
        document={renameTarget}
        open={Boolean(renameTarget)}
        onOpenChange={(open) => !open && setRenameTarget(null)}
        onSuccess={handleRefresh}
      />

      {/* Delete Confirmation Dialog */}
      <DocumentDeleteDialog
        document={deleteTarget}
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onSuccess={handleRefresh}
      />
    </div>
  )
}

