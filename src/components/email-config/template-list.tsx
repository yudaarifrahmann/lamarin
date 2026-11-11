'use client'

import * as React from 'react'
import {
  FileText,
  Plus,
  Sparkles,
  Edit3,
  Trash2,
  CheckCircle2,
  Check,
  Star,
  Loader2,
  Layout,
} from 'lucide-react'
import { toast } from 'sonner'
import type { EmailTemplateRow } from '@/types/config'
import { setDefaultTemplateAction, deleteTemplateAction } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/common/empty-state'

interface TemplateListProps {
  templates: EmailTemplateRow[]
  senderName: string
  onOpenCreate: () => void
  onOpenEdit: (tpl: EmailTemplateRow) => void
  onOpenPreview: (tpl: EmailTemplateRow) => void
  onOpenVisualEditor: (tpl?: EmailTemplateRow | null) => void
  onSuccess: () => void
}

export function TemplateList({
  templates,
  senderName,
  onOpenCreate,
  onOpenEdit,
  onOpenPreview,
  onOpenVisualEditor,
  onSuccess,
}: TemplateListProps) {
  const [deleteTarget, setDeleteTarget] = React.useState<EmailTemplateRow | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [settingDefaultId, setSettingDefaultId] = React.useState<string | null>(null)

  const handleSetDefault = async (tpl: EmailTemplateRow) => {
    if (tpl.is_default) return

    setSettingDefaultId(tpl.id)
    const result = await setDefaultTemplateAction(tpl.id)
    setSettingDefaultId(null)

    if (result.success) {
      toast.success(`Template "${tpl.template_name}" dijadikan sebagai template default.`)
      onSuccess()
    } else {
      toast.error(result.error || 'Gagal mengubah status template default.')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)
    const result = await deleteTemplateAction(deleteTarget.id)
    setIsDeleting(false)

    if (result.success) {
      toast.success(`Template "${deleteTarget.template_name}" berhasil dihapus.`)
      setDeleteTarget(null)
      onSuccess()
    } else {
      toast.error(result.error || 'Gagal menghapus template.')
    }
  }

  if (templates.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Belum Ada Template Tambahan"
        description="Buat template surat lamaran alternatif untuk melamar ke posisi yang berbeda (misal: Software Engineer, Data Analyst, Admin, atau versi Bahasa Inggris)."
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              size="sm"
              onClick={() => onOpenVisualEditor(null)}
              className="gap-2 shadow-xs bg-primary"
            >
              <Layout className="h-4 w-4" />
              <span>Desain Visual & AI Vision</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenCreate}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Teks Standar</span>
            </Button>
          </div>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            Daftar Template Tersimpan ({templates.length})
          </h4>
          <p className="text-xs text-muted-foreground">
            Hanya 1 template yang dapat aktif sebagai template utama (*default*).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => onOpenVisualEditor(null)}
            className="gap-1.5 shadow-xs text-xs h-8 bg-primary"
          >
            <Layout className="h-3.5 w-3.5" />
            <span>Desain Visual / AI Vision</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCreate}
            className="gap-1.5 text-xs h-8"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Teks</span>
          </Button>
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((tpl) => {
          const isSettingDefault = settingDefaultId === tpl.id
          const hasVisualLayout = Boolean(
            tpl.layout_config &&
              Array.isArray(tpl.layout_config.blocks) &&
              tpl.layout_config.blocks.length > 0
          )

          return (
            <Card
              key={tpl.id}
              className={`border-border/80 hover:border-primary/40 hover:shadow-xs transition-all flex flex-col justify-between ${
                tpl.is_default ? 'ring-1 ring-primary/40 bg-card' : 'bg-card/70'
              }`}
            >
              <CardContent className="p-4 space-y-3">
                {/* Header: Name + Default Badge + Visual Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-foreground truncate">
                        {tpl.template_name}
                      </h4>
                      {tpl.is_default && (
                        <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 gap-1">
                          <Check className="h-2.5 w-2.5" />
                          <span>Default</span>
                        </Badge>
                      )}
                      {hasVisualLayout && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 h-4 text-primary border-primary/40 gap-1 bg-primary/5"
                        >
                          <Layout className="h-2.5 w-2.5" />
                          <span>Visual A4</span>
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-primary font-medium truncate" title={tpl.subject}>
                      {tpl.subject}
                    </p>
                  </div>
                </div>

                {/* Message snippet preview */}
                <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5 text-xs text-muted-foreground line-clamp-3 font-sans leading-relaxed">
                  {tpl.message}
                </div>

                {/* Footer Actions */}
                <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenPreview(tpl)}
                      className="h-7 text-xs px-2 gap-1 text-muted-foreground hover:text-foreground"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Preview</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenVisualEditor(tpl)}
                      className="h-7 text-xs px-2 gap-1 text-primary hover:bg-primary/10 font-medium"
                      title="Atur layout visual lembar surat A4"
                    >
                      <Layout className="h-3.5 w-3.5" />
                      <span>Desain Visual</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenEdit(tpl)}
                      className="h-7 text-xs px-1.5 text-muted-foreground hover:text-foreground"
                      title="Edit teks cepat"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!tpl.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(tpl)}
                        disabled={isSettingDefault}
                        className="h-7 text-[11px] px-2 gap-1 text-muted-foreground hover:text-primary hover:border-primary/40"
                        title="Jadikan template default"
                      >
                        {isSettingDefault ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Star className="h-3 w-3" />
                        )}
                        <span>Set Default</span>
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(tpl)}
                      className="h-7 text-xs px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Hapus template"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-base font-bold text-foreground">
              Hapus Template Email?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Apakah Anda yakin ingin menghapus template <strong>"{deleteTarget?.template_name}"</strong> dari database Supabase?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-3 flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="gap-2 shadow-xs"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menghapus...</span>
                </>
              ) : (
                <span>Ya, Hapus</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

