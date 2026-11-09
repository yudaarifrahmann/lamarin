'use client'

import * as React from 'react'
import { FileText, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import type { EmailTemplateRow } from '@/types/config'
import { createTemplateAction, updateTemplateAction } from '@/app/actions/settings'
import { SUPPORTED_PLACEHOLDERS, replacePlaceholders } from '@/lib/placeholders'
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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

interface TemplateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: EmailTemplateRow | null
  senderName: string
  onSuccess: () => void
}

export function TemplateModal({
  open,
  onOpenChange,
  template,
  senderName,
  onSuccess,
}: TemplateModalProps) {
  const isEditing = Boolean(template)
  const [templateName, setTemplateName] = React.useState('')
  const [subject, setSubject] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [isDefault, setIsDefault] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPreview, setShowPreview] = React.useState(false)

  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    if (template) {
      setTemplateName(template.template_name || '')
      setSubject(template.subject || '')
      setMessage(template.message || '')
      setIsDefault(template.is_default || false)
    } else {
      setTemplateName('')
      setSubject('')
      setMessage('')
      setIsDefault(false)
    }
    setShowPreview(false)
  }, [template, open])

  const handleInsertPlaceholder = (tag: string) => {
    const textarea = textareaRef.current
    if (!textarea) {
      setMessage((prev) => prev + tag)
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const current = textarea.value
    const updated = current.substring(0, start) + tag + current.substring(end)
    setMessage(updated)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + tag.length, start + tag.length)
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!templateName.trim() || !subject.trim() || !message.trim()) {
      toast.error('Seluruh kolom wajib diisi.')
      return
    }

    setIsLoading(true)

    const payload = {
      template_name: templateName.trim(),
      subject: subject.trim(),
      message: message.trim(),
      is_default: isDefault,
    }

    const result = isEditing && template
      ? await updateTemplateAction(template.id, payload)
      : await createTemplateAction(payload)

    setIsLoading(false)

    if (result.success) {
      toast.success(
        isEditing
          ? 'Template email berhasil diperbarui.'
          : 'Template email baru berhasil disimpan ke Supabase.'
      )
      onSuccess()
      onOpenChange(false)
    } else {
      toast.error(result.error || 'Gagal menyimpan template email.')
    }
  }

  const previewSubject = replacePlaceholders(subject, {
    sender_name: senderName || 'Nama Pelamar',
    company_name: 'PT Inovasi Digital Indonesia',
  })

  const previewMessage = replacePlaceholders(message, {
    sender_name: senderName || 'Nama Pelamar',
    company_name: 'PT Inovasi Digital Indonesia',
  })

  return (
    <Dialog open={open} onOpenChange={isLoading ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[88vh] flex flex-col p-6">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden space-y-4">
          <DialogHeader className="pb-1 shrink-0">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>{isEditing ? 'Ubah Template Email' : 'Tambah Template Email Baru'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Simpan template surat lamaran alternatif untuk posisi atau jenis industri tertentu.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Template Name */}
            <div className="space-y-1.5">
              <Label htmlFor="tpl-name" className="text-xs font-medium">
                Nama Template <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tpl-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Contoh: Template IT / Software Engineer, Template Magang..."
                className="h-9 text-xs sm:text-sm"
                disabled={isLoading}
                required
              />
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <Label htmlFor="tpl-subject" className="text-xs font-medium">
                Subject Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tpl-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Contoh: Lamaran Kerja - {sender_name} - {company_name}"
                className="h-9 text-xs sm:text-sm"
                disabled={isLoading}
                required
              />
            </div>

            {/* Message Body */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <Label htmlFor="tpl-message" className="text-xs font-medium">
                  Isi Pesan Surat Lamaran (Multiline) <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground">Sisipkan:</span>
                  {SUPPORTED_PLACEHOLDERS.map((p) => (
                    <button
                      key={p.tag}
                      type="button"
                      onClick={() => handleInsertPlaceholder(p.tag)}
                      className="px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-[11px] font-mono text-primary border border-border cursor-pointer transition-colors"
                      title={p.description}
                    >
                      +{p.tag}
                    </button>
                  ))}
                </div>
              </div>

              <Textarea
                ref={textareaRef}
                id="tpl-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tuliskan format isi surat lamaran kerja..."
                rows={7}
                className="text-xs sm:text-sm font-sans leading-relaxed min-h-36 resize-y"
                disabled={isLoading}
                required
              />
            </div>

            {/* Toggle Default Template */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/80 bg-muted/20">
              <div className="space-y-0.5">
                <Label htmlFor="is-default-switch" className="text-xs font-medium cursor-pointer">
                  Jadikan Sebagai Template Utama (Default)
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Jika diaktifkan, template ini akan menggantikan status default template lainnya.
                </p>
              </div>
              <Switch
                id="is-default-switch"
                checked={isDefault}
                onCheckedChange={setIsDefault}
                disabled={isLoading}
              />
            </div>

            {/* Preview Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{showPreview ? 'Sembunyikan Simulasi Preview' : 'Tampilkan Simulasi Preview'}</span>
              </button>

              {showPreview && (
                <div className="mt-2.5 rounded-lg border border-border/70 bg-card p-3 space-y-2 text-xs animate-in fade-in-50">
                  <div className="border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground font-mono text-[11px]">Subject: </span>
                    <span className="font-semibold text-foreground">
                      {previewSubject || '(Subject kosong)'}
                    </span>
                  </div>
                  <pre className="font-sans text-foreground whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {previewMessage || '(Isi pesan kosong)'}
                  </pre>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2 shrink-0 flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={isLoading} className="gap-2 shadow-xs">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>{isEditing ? 'Simpan Perubahan' : 'Buat Template'}</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

