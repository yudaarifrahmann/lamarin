'use client'

import * as React from 'react'
import {
  FileText,
  Sliders,
  Type,
  Layout,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Check,
  Eye,
  Smartphone,
  Monitor,
  Loader2,
  HelpCircle,
  Upload,
  RefreshCw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Key,
  FileSearch,
} from 'lucide-react'
import { toast } from 'sonner'
import type {
  TemplateLayoutConfig,
  TemplateBlock,
  BlockType,
  AlignOption,
  FontFamily,
  BiodataField,
} from '@/types/template-layout'
import type { EmailTemplateRow } from '@/types/config'
import {
  createDefaultLayoutConfig,
  parseTextToLayoutConfig,
  layoutConfigToPlainText,
  renderLayoutToHtml,
  getFormattedTodayDate,
} from '@/lib/templates/layout-engine'
import { createTemplateAction, updateTemplateAction } from '@/app/actions/settings'
import { analyzeLetterImageAction } from '@/app/actions/ai-vision'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

interface VisualLayoutEditorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: EmailTemplateRow | null
  senderName?: string
  senderEmail?: string
  senderPhone?: string
  onSuccess: (savedTemplate?: EmailTemplateRow) => void
}

const FONT_OPTIONS: { label: string; value: FontFamily }[] = [
  { label: 'Arial (Modern Sans)', value: 'Arial' },
  { label: 'Times New Roman (Formal Serif)', value: 'Times New Roman' },
  { label: 'Calibri (Clean Sans)', value: 'Calibri' },
  { label: 'Georgia (Classic Serif)', value: 'Georgia' },
  { label: 'Segoe UI (Contemporary)', value: 'Segoe UI' },
  { label: 'Helvetica (Standard Sans)', value: 'Helvetica' },
]

/* ─── AI Vision Analyzing Loader ─── */
function VisionAnalyzingLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 space-y-6 select-none">
      {/* Scanning animation container */}
      <div className="relative flex items-center justify-center">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse scale-110" />

        {/* Document frame */}
        <div
          className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card shadow-lg"
          style={{ width: 120, height: 160 }}
        >
          {/* Document lines (simulate letter content) */}
          <div className="p-3 space-y-1.5 opacity-30">
            <div className="h-1.5 w-14 rounded-full bg-primary/60 ml-auto" />
            <div className="h-1.5 w-20 rounded-full bg-muted-foreground/50 mt-3" />
            <div className="h-1.5 w-24 rounded-full bg-muted-foreground/40" />
            <div className="h-1.5 w-16 rounded-full bg-muted-foreground/40" />
            <div className="h-1 w-0 mt-2" />
            <div className="h-1.5 w-24 rounded-full bg-muted-foreground/40" />
            <div className="h-1.5 w-28 rounded-full bg-muted-foreground/30" />
            <div className="h-1.5 w-24 rounded-full bg-muted-foreground/30" />
            <div className="h-1.5 w-20 rounded-full bg-muted-foreground/30" />
            <div className="h-1 w-0 mt-2" />
            <div className="h-1.5 w-28 rounded-full bg-muted-foreground/30" />
            <div className="h-1.5 w-24 rounded-full bg-muted-foreground/30" />
            <div className="h-1 w-0 mt-3" />
            <div className="h-1.5 w-14 rounded-full bg-primary/40" />
            <div className="h-1.5 w-10 rounded-full bg-muted-foreground/40" />
          </div>

          {/* Scanning line */}
          <div
            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80 shadow-[0_0_6px_2px_hsl(var(--primary)/0.4)]"
            style={{ animation: 'visionScanLine 2s ease-in-out infinite' }}
          />

          {/* Corner accent brackets */}
          <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-primary/60 rounded-tl" />
          <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-primary/60 rounded-tr" />
          <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-primary/60 rounded-bl" />
          <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-primary/60 rounded-br" />
        </div>

        {/* FileSearch icon badge */}
        <div className="absolute -bottom-3 -right-3 p-1.5 rounded-full bg-primary text-primary-foreground shadow-md">
          <FileSearch className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* CSS keyframe for the scanning line */}
      <style>{`
        @keyframes visionScanLine {
          0%   { top: 8px;  opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: calc(100% - 8px); opacity: 0; }
        }
      `}</style>

      {/* Text content */}
      <div className="text-center space-y-2 max-w-xs">
        <p className="text-sm font-semibold text-foreground leading-snug">
          Sedang menganalisis tata letak
        </p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          AI sedang mengenali struktur surat, posisi teks, tipografi, margin, dan elemen lainnya. Proses ini mungkin membutuhkan beberapa saat.
        </p>
      </div>

      {/* Animated dots */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block w-1.5 h-1.5 rounded-full bg-primary/60"
            style={{ animation: `visionDot 1.4s ease-in-out ${i * 0.22}s infinite` }}
          />
        ))}
      </div>
      <style>{`
        @keyframes visionDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export function VisualLayoutEditorModal({
  open,
  onOpenChange,
  template,
  senderName = 'Pelamar Kerja',
  senderEmail = 'pelamar@email.com',
  senderPhone = '0812-3456-7890',
  onSuccess,
}: VisualLayoutEditorModalProps) {
  const isEditing = Boolean(template)

  // Main Template metadata
  const [templateName, setTemplateName] = React.useState('')
  const [subject, setSubject] = React.useState('')
  const [isDefault, setIsDefault] = React.useState(false)

  // Layout configuration state
  const [layoutConfig, setLayoutConfig] = React.useState<TemplateLayoutConfig>(() =>
    createDefaultLayoutConfig(senderName)
  )

  // Selected block for editing in sidebar
  const [selectedBlockId, setSelectedBlockId] = React.useState<string | null>(null)

  // Preview Mode
  const [previewDevice, setPreviewDevice] = React.useState<'desktop' | 'mobile'>('desktop')

  // Save loading
  const [isSaving, setIsSaving] = React.useState(false)

  // AI Vision states
  const [visionImage, setVisionImage] = React.useState<File | null>(null)
  const [visionImagePreview, setVisionImagePreview] = React.useState<string | null>(null)
  const [visionApiKey, setVisionApiKey] = React.useState('')
  const [showApiKeyInput, setShowApiKeyInput] = React.useState(false)
  const [isAnalyzingImage, setIsAnalyzingImage] = React.useState(false)
  const visionFileInputRef = React.useRef<HTMLInputElement>(null)

  // Track modal open state and template ID to prevent accidental re-renders/wipes while editing
  const wasOpenRef = React.useRef(false)
  const lastTemplateIdRef = React.useRef<string | null | undefined>(undefined)

  // Initialize or reset state ONLY when modal transitions from closed -> open, or template ID changes
  React.useEffect(() => {
    const isOpening = open && !wasOpenRef.current
    const templateChanged = open && template?.id !== lastTemplateIdRef.current

    wasOpenRef.current = open

    if (!open) {
      lastTemplateIdRef.current = undefined
      return
    }

    if (isOpening || templateChanged) {
      lastTemplateIdRef.current = template?.id || null

      if (template) {
        setTemplateName(template.template_name || '')
        setSubject(template.subject || '')
        setIsDefault(template.is_default || false)

        if (template.layout_config && template.layout_config.blocks && template.layout_config.blocks.length > 0) {
          setLayoutConfig(template.layout_config)
        } else if (template.message) {
          // Automatically parse legacy plain-text template into structured blocks
          setLayoutConfig(parseTextToLayoutConfig(template.message, senderName))
        } else {
          setLayoutConfig(createDefaultLayoutConfig(senderName))
        }
      } else {
        setTemplateName('')
        setSubject('Lamaran Pekerjaan: {{position}} - {{company_name}}')
        setIsDefault(false)
        setLayoutConfig(createDefaultLayoutConfig(senderName))
      }

      setVisionImage(null)
      setVisionImagePreview(null)
      setIsAnalyzingImage(false)
    }
  }, [open, template?.id])

  // Set default selected block when blocks change
  React.useEffect(() => {
    if (layoutConfig.blocks.length > 0 && !selectedBlockId) {
      setSelectedBlockId(layoutConfig.blocks[0].id)
    }
  }, [layoutConfig.blocks, selectedBlockId])

  // Currently selected block
  const selectedBlock = layoutConfig.blocks.find((b) => b.id === selectedBlockId) || null

  // Update Page Settings
  const handleUpdatePageSettings = (key: keyof TemplateLayoutConfig['pageSettings'], val: any) => {
    setLayoutConfig((prev) => ({
      ...prev,
      pageSettings: {
        ...prev.pageSettings,
        [key]: val,
      },
    }))
  }

  // Update selected block
  const handleUpdateBlock = (blockId: string, updates: Partial<TemplateBlock>) => {
    setLayoutConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b)),
    }))
  }

  // Update selected block style
  const handleUpdateBlockStyle = (blockId: string, styleUpdates: Partial<TemplateBlock['style']>) => {
    setLayoutConfig((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) =>
        b.id === blockId ? { ...b, style: { ...b.style, ...styleUpdates } } : b
      ),
    }))
  }

  // Reorder Block: Move Up
  const handleMoveBlockUp = (index: number) => {
    if (index <= 0) return
    setLayoutConfig((prev) => {
      const nextBlocks = [...prev.blocks]
      const temp = nextBlocks[index - 1]
      nextBlocks[index - 1] = nextBlocks[index]
      nextBlocks[index] = temp
      return { ...prev, blocks: nextBlocks }
    })
  }

  // Reorder Block: Move Down
  const handleMoveBlockDown = (index: number) => {
    if (index >= layoutConfig.blocks.length - 1) return
    setLayoutConfig((prev) => {
      const nextBlocks = [...prev.blocks]
      const temp = nextBlocks[index + 1]
      nextBlocks[index + 1] = nextBlocks[index]
      nextBlocks[index] = temp
      return { ...prev, blocks: nextBlocks }
    })
  }

  // Delete Block
  const handleDeleteBlock = (blockId: string) => {
    if (layoutConfig.blocks.length <= 1) {
      toast.error('Surat minimal harus memiliki 1 elemen.')
      return
    }
    setLayoutConfig((prev) => {
      const remaining = prev.blocks.filter((b) => b.id !== blockId)
      return { ...prev, blocks: remaining }
    })
    if (selectedBlockId === blockId) {
      setSelectedBlockId(layoutConfig.blocks[0]?.id || null)
    }
  }

  // Add a new paragraph block
  const handleAddParagraphBlock = () => {
    const newId = `block_p_${Date.now()}`
    const newBlock: TemplateBlock = {
      id: newId,
      type: 'paragraph',
      content: 'Tuliskan isi paragraf tambahan di sini...',
      align: 'justify',
      style: {
        marginBottom: layoutConfig.pageSettings.sectionSpacing || 14,
      },
    }
    setLayoutConfig((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
    }))
    setSelectedBlockId(newId)
  }

  // Biodata field management
  const handleUpdateBiodataField = (
    blockId: string,
    fieldIndex: number,
    key: 'label' | 'value',
    val: string
  ) => {
    const block = layoutConfig.blocks.find((b) => b.id === blockId)
    if (!block || !block.style.biodataFields) return

    const updatedFields = [...block.style.biodataFields]
    updatedFields[fieldIndex] = {
      ...updatedFields[fieldIndex],
      [key]: val,
    }
    handleUpdateBlockStyle(blockId, { biodataFields: updatedFields })
  }

  const handleAddBiodataField = (blockId: string) => {
    const block = layoutConfig.blocks.find((b) => b.id === blockId)
    if (!block) return
    const currentFields = block.style.biodataFields || []
    handleUpdateBlockStyle(blockId, {
      biodataFields: [...currentFields, { label: 'Informasi Tambahan', value: 'Nilai data' }],
    })
  }

  const handleDeleteBiodataField = (blockId: string, fieldIndex: number) => {
    const block = layoutConfig.blocks.find((b) => b.id === blockId)
    if (!block || !block.style.biodataFields) return
    const updated = block.style.biodataFields.filter((_, idx) => idx !== fieldIndex)
    handleUpdateBlockStyle(blockId, { biodataFields: updated })
  }

  // Handle Vision Image Select
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setVisionImage(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      setVisionImagePreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Execute AI Vision Analysis
  const handleAnalyzeVision = async () => {
    if (!visionImage) {
      toast.error('Pilih berkas gambar surat terlebih dahulu.')
      return
    }

    setIsAnalyzingImage(true)
    const formData = new FormData()
    formData.append('image', visionImage)
    if (visionApiKey.trim()) {
      formData.append('api_key', visionApiKey.trim())
    }

    const result = await analyzeLetterImageAction(formData)
    setIsAnalyzingImage(false)

    if (result.success && result.data) {
      setLayoutConfig(result.data)
      if (result.suggestedTemplateName && !templateName) {
        setTemplateName(result.suggestedTemplateName)
      }
      if (result.extractedSubject && (!subject || subject === 'Lamaran Pekerjaan: {{position}} - {{company_name}}')) {
        setSubject(result.extractedSubject)
      }
      toast.success('AI Vision berhasil mendeteksi tata letak dan struktur surat!')
    } else {
      if (result.needsApiKey) {
        setShowApiKeyInput(true)
      }
      toast.error(result.error || 'Gagal menganalisis gambar surat.')
    }
  }

  // Save template
  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error('Nama template wajib diisi.')
      return
    }
    if (!subject.trim()) {
      toast.error('Subject email wajib diisi.')
      return
    }

    setIsSaving(true)

    // Compile layout config into plaintext fallback message for DB consistency
    const plainTextMessage = layoutConfigToPlainText(layoutConfig)

    const payload = {
      template_name: templateName.trim(),
      subject: subject.trim(),
      message: plainTextMessage,
      is_default: isDefault,
      layout_config: layoutConfig,
    }

    const result =
      isEditing && template
        ? await updateTemplateAction(template.id, payload)
        : await createTemplateAction(payload)

    setIsSaving(false)

    if (result.success) {
      toast.success(
        isEditing
          ? 'Template surat lamaran dan tata letak visual berhasil diperbarui.'
          : 'Template surat baru berhasil disimpan.'
      )
      onSuccess(result.data as EmailTemplateRow | undefined)
      onOpenChange(false)
    } else {
      toast.error(result.error || 'Gagal menyimpan template email.')
    }
  }

  // Sample data substitution for real-time live preview
  const sampleVariables = {
    sender_name: senderName || 'Budi Pratama, S.Kom.',
    sender_email: senderEmail || 'budi.pratama@email.com',
    sender_phone: senderPhone || '0812-3456-7890',
    sender_city: 'Jakarta',
    company_name: 'PT Teknologi Digital Indonesia',
    position: 'Full Stack Web Developer',
    today_date: getFormattedTodayDate(),
  }

  // Rendered HTML string for preview
  const livePreviewHtml = React.useMemo(() => {
    return renderLayoutToHtml(layoutConfig, sampleVariables, {
      mode: previewDevice,
      forEmail: false,
    })
  }, [layoutConfig, sampleVariables, previewDevice])

  return (
    <Dialog open={open} onOpenChange={isSaving ? undefined : onOpenChange}>
      <DialogContent className="max-w-[96vw] xl:max-w-7xl h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-background border-border/80">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border/60 bg-card/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Layout className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <span>{isEditing ? 'Visual Layout Editor' : 'Buat Custom Template (Visual Editor)'}</span>
                <Badge variant="outline" className="text-[10px] font-normal py-0">
                  Gmail-Compatible
                </Badge>
              </DialogTitle>
              <p className="text-[11px] text-muted-foreground">
                Atur tata letak, posisi tanggal, alamat, biodata, dan tanda tangan tanpa mengedit kode HTML.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="text-xs h-8"
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="gap-1.5 shadow-xs text-xs h-8"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Simpan Template</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Body: 2 Columns (Controls on Left, Live Preview on Right) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* LEFT COLUMN: Controls & Settings (5 Cols) */}
          <div className="lg:col-span-5 border-r border-border/60 flex flex-col bg-muted/10 overflow-hidden">
            <Tabs defaultValue="elemen" className="flex flex-col flex-1 overflow-hidden">
              <div className="px-4 pt-3 border-b border-border/50 bg-card/50">
                <TabsList className="grid grid-cols-3 w-full h-8 bg-muted/60">
                  <TabsTrigger value="elemen" className="text-xs gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    <span>Elemen Surat</span>
                  </TabsTrigger>
                  <TabsTrigger value="layout" className="text-xs gap-1.5">
                    <Sliders className="h-3.5 w-3.5" />
                    <span>Kertas & Font</span>
                  </TabsTrigger>
                  <TabsTrigger value="vision" className="text-xs gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>AI Vision</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* TAB 1: Elemen & Susunan Surat */}
              <TabsContent value="elemen" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
                {/* Basic info: Name & Subject */}
                <div className="space-y-3 p-3.5 rounded-xl border border-border/70 bg-card">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">
                      Nama Template <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Contoh: Template Formal IT, Template Magang..."
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">
                      Subject Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Contoh: Lamaran Pekerjaan: {{position}} - {{company_name}}"
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <Label htmlFor="default-toggle" className="text-xs text-muted-foreground cursor-pointer">
                      Jadikan template utama (default)
                    </Label>
                    <Switch
                      id="default-toggle"
                      checked={isDefault}
                      onCheckedChange={setIsDefault}
                    />
                  </div>
                </div>

                {/* Block List with Reordering */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-foreground">
                      Susunan Bagian Surat ({layoutConfig.blocks.length})
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddParagraphBlock}
                      className="h-7 text-[11px] gap-1 px-2"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Tambah Paragraf</span>
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {layoutConfig.blocks.map((block, idx) => {
                      const isSelected = block.id === selectedBlockId
                      const blockLabel =
                        block.type === 'date'
                          ? 'Tanggal Surat'
                          : block.type === 'recipient'
                          ? 'Alamat Tujuan'
                          : block.type === 'salutation'
                          ? 'Salam Pembuka'
                          : block.type === 'biodata'
                          ? 'Data Diri / Biodata'
                          : block.type === 'closing'
                          ? 'Salam Penutup'
                          : block.type === 'signature'
                          ? 'Tanda Tangan & Nama'
                          : `Paragraf Narasi #${idx + 1}`

                      return (
                        <div
                          key={block.id}
                          onClick={() => setSelectedBlockId(block.id)}
                          className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5 ring-1 ring-primary/30 shadow-xs'
                              : 'border-border/70 bg-card hover:border-primary/40'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <Badge
                                variant={isSelected ? 'default' : 'secondary'}
                                className="text-[10px] h-4.5 px-1.5 font-mono"
                              >
                                {idx + 1}
                              </Badge>
                              <span className="font-semibold text-foreground truncate">
                                {blockLabel}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={idx === 0}
                                onClick={() => handleMoveBlockUp(idx)}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                title="Pindahkan ke atas"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={idx === layoutConfig.blocks.length - 1}
                                onClick={() => handleMoveBlockDown(idx)}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                title="Pindahkan ke bawah"
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteBlock(block.id)}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                title="Hapus bagian ini"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Selected Block Detailed Customization */}
                {selectedBlock && (
                  <div className="p-3.5 rounded-xl border border-primary/30 bg-card space-y-3 animate-in fade-in-50">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <span className="text-xs font-bold text-primary">
                        Pengaturan Elemen: {selectedBlock.type.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        ID: {selectedBlock.id}
                      </span>
                    </div>

                    {/* Content Textarea */}
                    <div className="space-y-1">
                      <Label className="text-[11px] font-medium text-muted-foreground">
                        {selectedBlock.type === 'biodata'
                          ? 'Teks Pengantar Biodata'
                          : 'Isi Teks / Konten'}
                      </Label>
                      <Textarea
                        value={selectedBlock.content}
                        onChange={(e) => handleUpdateBlock(selectedBlock.id, { content: e.target.value })}
                        rows={selectedBlock.type === 'paragraph' ? 4 : 2}
                        className="text-xs font-sans leading-relaxed min-h-16"
                        placeholder="Ketik teks isi di sini..."
                      />
                    </div>

                    {/* Alignment & Weight Controls */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {/* Alignment */}
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Perataan Teks</Label>
                        <div className="flex items-center rounded-lg border border-border p-0.5 bg-muted/40">
                          {(['left', 'center', 'right', 'justify'] as AlignOption[]).map((align) => (
                            <button
                              key={align}
                              type="button"
                              onClick={() => handleUpdateBlock(selectedBlock.id, { align })}
                              className={`flex-1 py-1 rounded flex items-center justify-center transition-colors ${
                                selectedBlock.align === align
                                  ? 'bg-background shadow-xs text-primary font-bold'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                              title={`Rata ${align}`}
                            >
                              {align === 'left' && <AlignLeft className="h-3.5 w-3.5" />}
                              {align === 'center' && <AlignCenter className="h-3.5 w-3.5" />}
                              {align === 'right' && <AlignRight className="h-3.5 w-3.5" />}
                              {align === 'justify' && <AlignJustify className="h-3.5 w-3.5" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Font Weight */}
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Ketebalan Teks</Label>
                        <div className="flex items-center rounded-lg border border-border p-0.5 bg-muted/40">
                          <button
                            type="button"
                            onClick={() => handleUpdateBlockStyle(selectedBlock.id, { fontWeight: 'normal' })}
                            className={`flex-1 py-1 text-xs rounded transition-colors ${
                              selectedBlock.style.fontWeight !== 'bold'
                                ? 'bg-background shadow-xs text-foreground font-semibold'
                                : 'text-muted-foreground'
                            }`}
                          >
                            Normal
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateBlockStyle(selectedBlock.id, { fontWeight: 'bold' })}
                            className={`flex-1 py-1 text-xs rounded transition-colors flex items-center justify-center gap-1 ${
                              selectedBlock.style.fontWeight === 'bold'
                                ? 'bg-background shadow-xs text-primary font-bold'
                                : 'text-muted-foreground'
                            }`}
                          >
                            <Bold className="h-3 w-3" />
                            <span>Tebal</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Jarak Bawah (Margin Bottom) per Block */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <Label className="text-muted-foreground">Jarak ke Bagian Berikutnya:</Label>
                        <span className="font-mono text-foreground font-bold">
                          {selectedBlock.style.marginBottom ?? 14}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="48"
                        step="2"
                        value={selectedBlock.style.marginBottom ?? 14}
                        onChange={(e) =>
                          handleUpdateBlockStyle(selectedBlock.id, {
                            marginBottom: parseInt(e.target.value, 10),
                          })
                        }
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    {/* Signature Position (Special control for signature) */}
                    {selectedBlock.type === 'signature' && (
                      <div className="space-y-1 pt-1 border-t border-border/50">
                        <Label className="text-[11px] text-muted-foreground">
                          Posisi Blok Tanda Tangan:
                        </Label>
                        <div className="grid grid-cols-3 gap-1">
                          {(['left', 'center', 'right'] as const).map((pos) => (
                            <Button
                              key={pos}
                              type="button"
                              variant={
                                (selectedBlock.style.signaturePosition || selectedBlock.align) === pos
                                  ? 'default'
                                  : 'outline'
                              }
                              size="sm"
                              onClick={() => {
                                handleUpdateBlockStyle(selectedBlock.id, { signaturePosition: pos })
                                handleUpdateBlock(selectedBlock.id, { align: pos })
                              }}
                              className="h-7 text-[11px] capitalize"
                            >
                              {pos === 'left' ? 'Kiri' : pos === 'center' ? 'Tengah' : 'Kanan'}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Biodata Table Editor (Special control for biodata) */}
                    {selectedBlock.type === 'biodata' && (
                      <div className="space-y-2 pt-2 border-t border-border/50">
                        <div className="flex items-center justify-between">
                          <Label className="text-[11px] font-semibold text-foreground">
                            Format Biodata:
                          </Label>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant={selectedBlock.style.biodataFormat === 'table' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleUpdateBlockStyle(selectedBlock.id, { biodataFormat: 'table' })}
                              className="h-6 text-[10px] px-2"
                            >
                              Tabel (2 Kolom)
                            </Button>
                            <Button
                              type="button"
                              variant={selectedBlock.style.biodataFormat === 'inline' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleUpdateBlockStyle(selectedBlock.id, { biodataFormat: 'inline' })}
                              className="h-6 text-[10px] px-2"
                            >
                              Paragraf
                            </Button>
                          </div>
                        </div>

                        {selectedBlock.style.biodataFormat === 'table' && (
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                              <span>Daftar Data Diri</span>
                              <button
                                type="button"
                                onClick={() => handleAddBiodataField(selectedBlock.id)}
                                className="text-primary hover:underline inline-flex items-center gap-0.5 font-medium"
                              >
                                <Plus className="h-3 w-3" />
                                <span>Tambah Baris</span>
                              </button>
                            </div>

                            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                              {(selectedBlock.style.biodataFields || []).map((field, fIdx) => (
                                <div key={fIdx} className="flex items-center gap-1.5 text-xs">
                                  <Input
                                    value={field.label}
                                    onChange={(e) =>
                                      handleUpdateBiodataField(selectedBlock.id, fIdx, 'label', e.target.value)
                                    }
                                    placeholder="Label (Nama)"
                                    className="h-7 text-xs w-28 shrink-0 font-medium"
                                  />
                                  <span className="text-muted-foreground">:</span>
                                  <Input
                                    value={field.value}
                                    onChange={(e) =>
                                      handleUpdateBiodataField(selectedBlock.id, fIdx, 'value', e.target.value)
                                    }
                                    placeholder="Nilai ({{sender_name}})"
                                    className="h-7 text-xs flex-1 font-mono text-[11px]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteBiodataField(selectedBlock.id, fIdx)}
                                    className="p-1 text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* TAB 2: Kertas & Tipografi */}
              <TabsContent value="layout" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
                {/* Paper Margins */}
                <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-3">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-primary" />
                    <span>Margin Kertas Lembar Surat</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Atas (Top):</span>
                        <span className="font-mono font-bold text-foreground">
                          {layoutConfig.pageSettings.marginTop}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="16"
                        max="80"
                        step="4"
                        value={layoutConfig.pageSettings.marginTop}
                        onChange={(e) => handleUpdatePageSettings('marginTop', parseInt(e.target.value, 10))}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Bawah (Bottom):</span>
                        <span className="font-mono font-bold text-foreground">
                          {layoutConfig.pageSettings.marginBottom}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="16"
                        max="80"
                        step="4"
                        value={layoutConfig.pageSettings.marginBottom}
                        onChange={(e) => handleUpdatePageSettings('marginBottom', parseInt(e.target.value, 10))}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Kiri (Left):</span>
                        <span className="font-mono font-bold text-foreground">
                          {layoutConfig.pageSettings.marginLeft}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="16"
                        max="80"
                        step="4"
                        value={layoutConfig.pageSettings.marginLeft}
                        onChange={(e) => handleUpdatePageSettings('marginLeft', parseInt(e.target.value, 10))}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Kanan (Right):</span>
                        <span className="font-mono font-bold text-foreground">
                          {layoutConfig.pageSettings.marginRight}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="16"
                        max="80"
                        step="4"
                        value={layoutConfig.pageSettings.marginRight}
                        onChange={(e) => handleUpdatePageSettings('marginRight', parseInt(e.target.value, 10))}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </div>

                  {/* Paper Max Width */}
                  <div className="space-y-1 pt-2 border-t border-border/50">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>Lebar Area Konten Surat:</span>
                      <span className="font-mono font-bold text-foreground">
                        {layoutConfig.pageSettings.maxWidth}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="560"
                      max="820"
                      step="20"
                      value={layoutConfig.pageSettings.maxWidth}
                      onChange={(e) => handleUpdatePageSettings('maxWidth', parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>

                {/* Typography Settings */}
                <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-3">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Type className="h-3.5 w-3.5 text-primary" />
                    <span>Tipografi & Font</span>
                  </h4>

                  {/* Font Family */}
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Jenis Font:</Label>
                    <select
                      value={layoutConfig.pageSettings.fontFamily}
                      onChange={(e) => handleUpdatePageSettings('fontFamily', e.target.value as FontFamily)}
                      className="w-full h-8 text-xs rounded-lg border border-border bg-background px-2 text-foreground focus:outline-none"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Font Size & Line Height */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Ukuran Font:</span>
                        <span className="font-mono font-bold text-foreground">
                          {layoutConfig.pageSettings.fontSize}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="18"
                        step="1"
                        value={layoutConfig.pageSettings.fontSize}
                        onChange={(e) => handleUpdatePageSettings('fontSize', parseInt(e.target.value, 10))}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Kerapatan Baris:</span>
                        <span className="font-mono font-bold text-foreground">
                          {layoutConfig.pageSettings.lineHeight}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1.3"
                        max="2.0"
                        step="0.1"
                        value={layoutConfig.pageSettings.lineHeight}
                        onChange={(e) => handleUpdatePageSettings('lineHeight', parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </div>

                  {/* Text Color & Background */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Warna Teks:</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={layoutConfig.pageSettings.textColor}
                          onChange={(e) => handleUpdatePageSettings('textColor', e.target.value)}
                          className="h-7 w-8 rounded border border-border cursor-pointer bg-transparent"
                        />
                        <span className="text-xs font-mono">{layoutConfig.pageSettings.textColor}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Warna Lembar:</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={layoutConfig.pageSettings.backgroundColor}
                          onChange={(e) => handleUpdatePageSettings('backgroundColor', e.target.value)}
                          className="h-7 w-8 rounded border border-border cursor-pointer bg-transparent"
                        />
                        <span className="text-xs font-mono">{layoutConfig.pageSettings.backgroundColor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>


              {/* TAB 3: AI Vision Generator */}
              <TabsContent value="vision" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">

                {/* ── LOADER: shown while AI is processing ── */}
                {isAnalyzingImage ? (
                  <VisionAnalyzingLoader />
                ) : (
                  <>
                    <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                        <Sparkles className="h-4 w-4" />
                        <h4 className="text-xs font-bold">Generate Template dari Gambar Surat</h4>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Unggah foto surat fisik atau screenshot surat lamaran kerja. AI Vision akan menganalisis tata letak, posisi tanggal, alamat tujuan, biodata, dan tanda tangan agar otomatis tersusun menjadi template visual.
                      </p>
                    </div>

                    {/* Upload Image Dropzone */}
                    <input
                      ref={visionFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />

                    <div
                      onClick={() => visionFileInputRef.current?.click()}
                      className="p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/40 cursor-pointer transition-all flex flex-col items-center justify-center text-center group"
                    >
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary mb-2 group-hover:scale-105 transition-transform">
                        <Upload className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-semibold text-foreground">
                        {visionImage ? visionImage.name : 'Pilih Gambar Surat Lamaran'}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        Mendukung JPG, PNG, WebP (Maks 8MB)
                      </span>
                    </div>

                    {/* Image Preview if selected */}
                    {visionImagePreview && (
                      <div className="rounded-xl border border-border/80 overflow-hidden bg-card p-2 space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                          <span>Pratinjau Gambar:</span>
                          <button
                            type="button"
                            onClick={() => {
                              setVisionImage(null)
                              setVisionImagePreview(null)
                            }}
                            className="text-[10px] text-destructive hover:underline"
                          >
                            Hapus Gambar
                          </button>
                        </div>
                        <img
                          src={visionImagePreview}
                          alt="Surat Lamaran"
                          className="w-full max-h-48 object-contain rounded-lg border border-border/50 bg-black/5"
                        />
                      </div>
                    )}

                    {/* Optional Custom API Key Toggle */}
                    <div className="pt-1 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <button
                          type="button"
                          onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                          className="hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Key className="h-3 w-3" />
                          <span>{showApiKeyInput ? 'Sembunyikan Input API Key' : 'Punya Google Gemini API Key Sendiri?'}</span>
                        </button>
                      </div>

                      {showApiKeyInput && (
                        <div className="p-3 rounded-lg border border-border/70 bg-card space-y-1.5 animate-in fade-in-50">
                          <Label className="text-[11px] text-muted-foreground">
                            Gemini API Key (Opsional jika server belum disetel)
                          </Label>
                          <Input
                            type="password"
                            value={visionApiKey}
                            onChange={(e) => setVisionApiKey(e.target.value)}
                            placeholder="AIzaSy..."
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                      )}
                    </div>

                    {/* Action button */}
                    <Button
                      type="button"
                      onClick={handleAnalyzeVision}
                      disabled={!visionImage}
                      className="w-full gap-2 shadow-xs text-xs h-9 bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Analisis Tata Letak dengan AI Vision</span>
                    </Button>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* RIGHT COLUMN: Live A4 Interactive Preview (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col bg-muted/30 overflow-hidden">
            {/* Preview Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/60 bg-card/60">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground">
                  Pratinjau Lembar Surat (Live A4 Preview)
                </span>
              </div>

              {/* Device switcher */}
              <div className="flex items-center rounded-lg border border-border p-0.5 bg-muted/50">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-all ${
                    previewDevice === 'desktop'
                      ? 'bg-background text-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span>Desktop A4</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-all ${
                    previewDevice === 'mobile'
                      ? 'bg-background text-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Mobile View</span>
                </button>
              </div>
            </div>

            {/* A4 Paper Canvas Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex items-start justify-center bg-muted/40">
              <div
                className={`transition-all duration-200 ${
                  previewDevice === 'mobile'
                    ? 'w-full max-w-[380px] rounded-2xl shadow-xl border-4 border-foreground/20 p-2 bg-foreground/5'
                    : 'w-full flex justify-center'
                }`}
              >
                <div
                  className={`bg-white text-zinc-900 shadow-md border border-border/80 transition-all ${
                    previewDevice === 'mobile'
                      ? 'rounded-xl overflow-hidden'
                      : 'rounded-sm min-h-[720px]'
                  }`}
                  style={{
                    width: previewDevice === 'mobile' ? '100%' : `${layoutConfig.pageSettings.maxWidth}px`,
                  }}
                  dangerouslySetInnerHTML={{ __html: livePreviewHtml }}
                />
              </div>
            </div>

            {/* Bottom sample info */}
            <div className="px-4 py-2 border-t border-border/50 bg-card/40 text-[11px] text-muted-foreground flex flex-wrap items-center justify-between gap-2">
              <span>
                Pratinjau menggunakan profil pengguna: <strong>{sampleVariables.sender_name}</strong>
              </span>
              <span className="font-mono text-[10px]">
                Format HTML 100% kompatibel dengan Google Gmail API
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

