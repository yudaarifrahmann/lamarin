'use client'

import * as React from 'react'
import { Sparkles, Building2, Briefcase, Monitor, Smartphone } from 'lucide-react'
import type { EmailTemplateRow } from '@/types/config'
import { replacePlaceholders } from '@/lib/placeholders'
import { renderLayoutToHtml, getFormattedTodayDate } from '@/lib/templates/layout-engine'
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
  const [testPosition, setTestPosition] = React.useState('Software Engineer')
  const [deviceMode, setDeviceMode] = React.useState<'desktop' | 'mobile'>('desktop')

  if (!template) return null

  const sampleVariables = {
    sender_name: senderName || 'Nama Pengirim',
    company_name: testCompany || 'Nama Perusahaan',
    position: testPosition || 'Software Engineer',
    sender_city: 'Jakarta',
    today_date: getFormattedTodayDate(),
  }

  const previewSubject = replacePlaceholders(template.subject, sampleVariables)
  const previewMessage = replacePlaceholders(template.message, sampleVariables)

  const hasVisualLayout = Boolean(
    template.layout_config &&
      Array.isArray(template.layout_config.blocks) &&
      template.layout_config.blocks.length > 0
  )

  const visualHtml = hasVisualLayout
    ? renderLayoutToHtml(template.layout_config!, sampleVariables, {
        mode: deviceMode,
        forEmail: false,
      })
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[88vh] flex flex-col p-6">
        <DialogHeader className="pb-1">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Simulasi Preview Template Lamaran</span>
            </DialogTitle>
            <div className="flex items-center gap-1.5">
              {hasVisualLayout && (
                <Badge variant="outline" className="text-[10px] text-primary border-primary/40 px-2">
                  Visual Layout A4
                </Badge>
              )}
              {template.is_default && (
                <Badge variant="default" className="text-[10px] px-2">
                  Template Default
                </Badge>
              )}
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Template: <strong>{template.template_name}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Test Company & Position Fields & Device Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border/80 bg-muted/20">
          <div className="grid grid-cols-2 gap-2 flex-1">
            <div className="space-y-1">
              <Label htmlFor="preview-company" className="text-[11px] font-medium flex items-center gap-1">
                <Building2 className="h-3 w-3 text-primary" />
                <span>{`{{company_name}}`}:</span>
              </Label>
              <Input
                id="preview-company"
                value={testCompany}
                onChange={(e) => setTestCompany(e.target.value)}
                placeholder="PT Contoh..."
                className="h-7 text-xs bg-background"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="preview-position" className="text-[11px] font-medium flex items-center gap-1">
                <Briefcase className="h-3 w-3 text-primary" />
                <span>{`{{position}}`}:</span>
              </Label>
              <Input
                id="preview-position"
                value={testPosition}
                onChange={(e) => setTestPosition(e.target.value)}
                placeholder="Software Engineer..."
                className="h-7 text-xs bg-background"
              />
            </div>
          </div>

          {hasVisualLayout && (
            <div className="flex items-center rounded-lg border border-border p-0.5 bg-muted/50 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => setDeviceMode('desktop')}
                className={`p-1.5 rounded transition-colors ${
                  deviceMode === 'desktop'
                    ? 'bg-background shadow-xs text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Tampilan Desktop A4"
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode('mobile')}
                className={`p-1.5 rounded transition-colors ${
                  deviceMode === 'mobile'
                    ? 'bg-background shadow-xs text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Tampilan Mobile"
              >
                <Smartphone className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Email Header Envelope */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <div className="rounded-lg border border-border/70 bg-card p-3 space-y-1.5 text-xs">
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
              <span className="font-semibold text-primary text-right">{previewSubject}</span>
            </div>
          </div>

          {/* Body Render: Visual A4 Sheet vs Plain Text */}
          {hasVisualLayout && visualHtml ? (
            <div className="rounded-lg border border-border/80 bg-muted/40 p-4 flex justify-center overflow-x-auto min-h-64">
              <div
                className={`bg-white text-zinc-900 border border-border shadow-sm transition-all ${
                  deviceMode === 'mobile'
                    ? 'w-full max-w-[360px] rounded-xl overflow-hidden'
                    : 'w-full max-w-[640px] rounded-sm'
                }`}
                dangerouslySetInnerHTML={{ __html: visualHtml }}
              />
            </div>
          ) : (
            <div className="rounded-lg border border-border/70 bg-card p-4 min-h-48 max-h-80 overflow-y-auto">
              <pre className="font-sans text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                {previewMessage}
              </pre>
            </div>
          )}
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
