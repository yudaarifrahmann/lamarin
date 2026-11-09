import * as React from 'react'
import Link from 'next/link'
import { FolderArchive, ArrowLeft, Shield, HardDrive, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { DocumentRow } from '@/types/document'
import { formatBytes } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DocumentManager } from '@/components/documents/document-manager'

export default async function ManajemenDokumenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let documents: DocumentRow[] = []

  if (user) {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      documents = data as DocumentRow[]
    }
  }

  const documentCount = documents.length
  const totalStorageBytes = documents.reduce((acc, item) => acc + (item.file_size || 0), 0)

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-xs font-medium text-foreground">Manajemen Dokumen</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Manajemen Dokumen
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Kelola berkas CV, résumé, portofolio, dan sertifikat yang disimpan aman di Supabase Storage.
          </p>
        </div>

        <Badge variant="outline" className="w-fit text-xs px-2.5 py-1 gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Bucket Private: application-documents
        </Badge>
      </div>

      {/* Storage Specs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center justify-between">
              <span>Total Berkas Tersimpan</span>
              <FileText className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {documentCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Dokumen siap dilampirkan ke email lamaran
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center justify-between">
              <span>Total Ruang Terpakai</span>
              <HardDrive className="h-4 w-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatBytes(totalStorageBytes)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Format utama PDF (Maks. 10MB per file)
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center justify-between">
              <span>Keamanan Berkas</span>
              <Shield className="h-4 w-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <span>RLS & Signed URL</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Berkas privat, diakses via token sementara
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Document Manager */}
      <DocumentManager initialDocuments={documents} />
    </div>
  )
}
