'use client'

import * as React from 'react'
import { Sparkles, Building2, User } from 'lucide-react'
import type { EmailTemplateRow } from '@/types/config'
import { replacePlaceholders } from '@/lib/placeholders'
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
import { Badge } from '@/components/ui/badge'

interface TemplatePreviewModalProps {
  template: EmailTemplateRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  senderName: string
}

export function TemplatePreviewModal({
  template,
  open,
  onOpenChange,
  senderName,
}: TemplatePreviewModalProps) {
  const [testCompany, setTestCompany] = React.useState('PT Inovasi Digital Indonesia')

  if (!template) return null

  const previewSubject = replacePlaceholders(template.subject, {
    sender_name: senderName || 'Nama Pengirim',
    company_name: testCompany || 'Nama Perusahaan',
  })

  const previewMessage = replacePlaceholders(template.message, {
    sender_name: senderName || 'Nama Pengirim',
    company_name: testCompany || 'Nama Perusahaan',
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="pb-1">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Simulasi Preview Template</span>
            </DialogTitle>
            {template.is_default && (
              <Badge variant="default" className="text-[10px] px-2 py-0.5">
                Template Default
              </Badge>
            )}
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Template: <strong>{template.template_name}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Test Company Name Field */}
        <div className="p-3 rounded-lg border border-border/80 bg-muted/20 space-y-1.5">
          <Label htmlFor="preview-company" className="text-xs font-medium flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-primary" />
            <span>Uji Coba Ganti Nama Perusahaan ({'{company_name}'}):</span>
          </Label>
          <Input
            id="preview-company"
            value={testCompany}
            onChange={(e) => setTestCompany(e.target.value)}
            placeholder="Ketik nama perusahaan untuk menguji placeholder..."
            className="h-8 text-xs bg-background"
          />
        </div>

        {/* Email Envelope */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <div className="rounded-lg border border-border/70 bg-card p-3 space-y-2 text-xs">
            <div className="flex items-start justify-between border-b border-border/50 pb-1.5">
              <span className="text-muted-foreground w-16 shrink-0 font-medium">Dari:</span>
              <span className="font-semibold text-foreground text-right truncate">
                {senderName || 'Nama Pengirim'}
              </span>
            </div>
            <div className="flex items-start justify-between border-b border-border/50 pb-1.5">
              <span className="text-muted-foreground w-16 shrink-0 font-medium">Kepada:</span>
              <span className="text-foreground text-right truncate">
                HRD {testCompany || 'Perusahaan'}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-muted-foreground w-16 shrink-0 font-medium">Subject:</span>
              <span className="font-semibold text-primary text-right">
                {previewSubject}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-border/70 bg-card p-4 min-h-48 max-h-80 overflow-y-auto">
            <pre className="font-sans text-xs text-foreground whitespace-pre-wrap leading-relaxed">
              {previewMessage}
            </pre>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button size="sm" onClick={() => onOpenChange(false)}>
            Tutup Preview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

