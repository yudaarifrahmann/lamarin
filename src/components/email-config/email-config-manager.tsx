'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Settings, FileText, Sparkles, User, RefreshCw } from 'lucide-react'
import type { EmailSettingsRow, EmailTemplateRow } from '@/types/config'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { SenderSettingsForm } from '@/components/email-config/sender-settings-form'
import { TemplateList } from '@/components/email-config/template-list'
import { TemplateModal } from '@/components/email-config/template-modal'
import { TemplatePreviewModal } from '@/components/email-config/template-preview-modal'
import { VisualLayoutEditorModal } from '@/components/templates/visual-layout-editor-modal'

interface EmailConfigManagerProps {
  initialSettings: EmailSettingsRow | null
  initialTemplates: EmailTemplateRow[]
}

export function EmailConfigManager({
  initialSettings,
  initialTemplates,
}: EmailConfigManagerProps) {
  const router = useRouter()
  const [settings, setSettings] = React.useState<EmailSettingsRow | null>(initialSettings)
  const [templates, setTemplates] = React.useState<EmailTemplateRow[]>(initialTemplates)

  const [activeModal, setActiveModal] = React.useState<'create' | 'edit' | null>(null)
  const [editingTemplate, setEditingTemplate] = React.useState<EmailTemplateRow | null>(null)
  const [previewTemplate, setPreviewTemplate] = React.useState<EmailTemplateRow | null>(null)
  const [visualEditorTemplate, setVisualEditorTemplate] = React.useState<EmailTemplateRow | null>(null)
  const [isVisualEditorOpen, setIsVisualEditorOpen] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  // Keep state in sync when server revalidates
  React.useEffect(() => {
    setSettings(initialSettings)
  }, [initialSettings])

  React.useEffect(() => {
    setTemplates(initialTemplates)
  }, [initialTemplates])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  // Instant optimistic state update to guarantee zero lag when templates are created/updated
  const handleTemplateSaved = (savedTemplate?: EmailTemplateRow) => {
    if (savedTemplate) {
      setTemplates((prev) => {
        const existingIdx = prev.findIndex((t) => t.id === savedTemplate.id)
        let updated: EmailTemplateRow[]
        if (existingIdx >= 0) {
          updated = prev.map((t) => (t.id === savedTemplate.id ? savedTemplate : t))
        } else {
          updated = [savedTemplate, ...prev]
        }

        if (savedTemplate.is_default) {
          updated = updated.map((t) =>
            t.id === savedTemplate.id ? t : { ...t, is_default: false }
          )
        }
        return updated
      })
    }
    handleRefresh()
  }

  const senderName = settings?.sender_name || ''
  const senderEmail = settings?.sender_email || ''

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pengaturan-utama" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border/60">
          <TabsList className="bg-muted/60 p-1">
            <TabsTrigger value="pengaturan-utama" className="gap-2 text-xs">
              <User className="h-3.5 w-3.5" />
              <span>Identitas & Pesan Default</span>
            </TabsTrigger>
            <TabsTrigger value="koleksi-template" className="gap-2 text-xs">
              <FileText className="h-3.5 w-3.5" />
              <span>Koleksi Template ({templates.length})</span>
            </TabsTrigger>
          </TabsList>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5 self-end sm:self-auto"
            title="Muat ulang data dari Supabase"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sinkronkan</span>
          </Button>
        </div>

        {/* Tab 1: Identitas Pengirim & Default Subject/Message */}
        <TabsContent value="pengaturan-utama" className="pt-4">
          <SenderSettingsForm initialSettings={settings} />
        </TabsContent>

        {/* Tab 2: Koleksi Template Tambahan */}
        <TabsContent value="koleksi-template" className="pt-4">
          <TemplateList
            templates={templates}
            senderName={senderName}
            onOpenCreate={() => {
              setEditingTemplate(null)
              setActiveModal('create')
            }}
            onOpenEdit={(tpl) => {
              setEditingTemplate(tpl)
              setActiveModal('edit')
            }}
            onOpenPreview={(tpl) => setPreviewTemplate(tpl)}
            onOpenVisualEditor={(tpl) => {
              setVisualEditorTemplate(tpl || null)
              setIsVisualEditorOpen(true)
            }}
            onSuccess={handleRefresh}
          />
        </TabsContent>
      </Tabs>

      {/* Visual Layout & AI Vision Editor Modal */}
      <VisualLayoutEditorModal
        open={isVisualEditorOpen}
        onOpenChange={(open) => {
          setIsVisualEditorOpen(open)
          if (!open) setVisualEditorTemplate(null)
        }}
        template={visualEditorTemplate}
        senderName={senderName}
        senderEmail={senderEmail}
        onSuccess={handleTemplateSaved}
      />

      {/* Create / Edit Standard Template Modal */}
      <TemplateModal
        open={Boolean(activeModal)}
        onOpenChange={(open) => {
          if (!open) {
            setActiveModal(null)
            setEditingTemplate(null)
          }
        }}
        template={editingTemplate}
        senderName={senderName}
        onSuccess={handleTemplateSaved}
      />

      {/* Standalone Template Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        open={Boolean(previewTemplate)}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
        senderName={senderName}
      />
    </div>
  )
}

