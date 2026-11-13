'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Send,
  Building2,
  Briefcase,
  Mail,
  FileText,
  Paperclip,
  Check,
  X,
  Sparkles,
  AlertCircle,
  FileCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import type { DocumentRow } from '@/types/document'
import type { EmailSettingsRow, EmailTemplateRow } from '@/types/config'
import { formatBytes } from '@/lib/format'
import { SUPPORTED_PLACEHOLDERS, replacePlaceholders } from '@/lib/placeholders'
import { isPdfDocument, isImageDocument, generateMergedPdfFilename } from '@/lib/pdf/utils'
import { sendApplicationAction, type SendApplicationPayload } from '@/app/actions/send-application'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button, buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ApplicationConfirmationModal } from '@/components/applications/application-confirmation-modal'
import { SendingJobsIndicator } from '@/components/applications/sending-jobs-indicator'

export interface SendJob {
  id: string
  companyName: string
  position?: string
  recipientEmail?: string
  status: 'sending' | 'done' | 'error'
  error?: string
  logId?: string
  resendId?: string
  payload: SendApplicationPayload
  startedAt: number
}

interface ApplicationFormProps {
  userDocuments: DocumentRow[]
  emailSettings: EmailSettingsRow | null
  emailTemplates: EmailTemplateRow[]
  connectedGmailEmail?: string | null
}

export function ApplicationForm({
  userDocuments,
  emailSettings,
  emailTemplates,
  connectedGmailEmail,
}: ApplicationFormProps) {
  // Find default template or fallback to the first available template
  const defaultTemplate = emailTemplates.find((t) => t.is_default) || (emailTemplates.length > 0 ? emailTemplates[0] : undefined)
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string | undefined>(
    defaultTemplate?.id
  )

  // Form states - prefill subject & message from active template on mount
  const [recipientEmail, setRecipientEmail] = React.useState('')
  const [companyName, setCompanyName] = React.useState('')
  const [position, setPosition] = React.useState('')
  const [subject, setSubject] = React.useState(defaultTemplate?.subject || '')
  const [message, setMessage] = React.useState(defaultTemplate?.message || '')
  const [selectedDocIds, setSelectedDocIds] = React.useState<string[]>([])

  // Keep template synchronized if emailTemplates loads/updates
  React.useEffect(() => {
    if (emailTemplates.length > 0 && !selectedTemplateId) {
      const def = emailTemplates.find((t) => t.is_default) || emailTemplates[0]
      if (def) {
        setSelectedTemplateId(def.id)
        setSubject((prev) => prev || def.subject)
        setMessage((prev) => prev || def.message)
      }
    }
  }, [emailTemplates, selectedTemplateId])

  // Modal & non-blocking send jobs state
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false)
  const [sendJobs, setSendJobs] = React.useState<SendJob[]>([])

  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Auto-fill defaults when available
  const defaultSubjectFallback =
    defaultTemplate?.subject ||
    emailSettings?.default_subject ||
    'Lamaran Pekerjaan: {{position}} - {{company_name}}'

  const defaultMessageFallback =
    defaultTemplate?.message || emailSettings?.default_message || ''

  const senderName =
    emailSettings?.sender_name || 'Pelamar Kerja'

  const senderEmail = connectedGmailEmail || emailSettings?.sender_email || ''

  const senderCity = (emailSettings as any)?.sender_city as string | undefined

  // Load a chosen template into the subject & message inputs
  const handleSelectTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId)
    const tpl = emailTemplates.find((t) => t.id === tplId)
    if (tpl) {
      setSubject(tpl.subject)
      setMessage(tpl.message)
      toast.info(`Template "${tpl.template_name}" berhasil diterapkan.`)
    }
  }

  // Insert placeholder chip at cursor
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

  // Document selection toggles
  const handleToggleDoc = (docId: string) => {
    if (selectedDocIds.includes(docId)) {
      setSelectedDocIds((prev) => prev.filter((id) => id !== docId))
    } else {
      setSelectedDocIds((prev) => [...prev, docId])
    }
  }

  const handleSelectAllDocs = () => {
    setSelectedDocIds(userDocuments.map((d) => d.id))
  }

  const handleDeselectAllDocs = () => {
    setSelectedDocIds([])
  }

  // Selected documents objects sorted strictly by DB sort_order (then by created_at)
  const selectedDocuments = React.useMemo(() => {
    return selectedDocIds
      .map((id) => userDocuments.find((d) => d.id === id))
      .filter((doc): doc is DocumentRow => Boolean(doc))
      .sort((a, b) => {
        const orderA = a.sort_order ?? 9999
        const orderB = b.sort_order ?? 9999
        if (orderA !== orderB) return orderA - orderB
        return a.created_at < b.created_at ? -1 : 1
      })
  }, [selectedDocIds, userDocuments])

  const totalAttachmentBytes = selectedDocuments.reduce(
    (acc, d) => acc + (d.file_size || 0),
    0
  )
  const isAttachmentSizeExceeded = totalAttachmentBytes > 25 * 1024 * 1024

  // PDF / Image Merge computations — all processable docs go into one merged PDF
  const processableDocs = selectedDocuments.filter(
    (d) =>
      isPdfDocument(d.mime_type, d.original_filename) ||
      isImageDocument(d.mime_type, d.original_filename)
  )
  const unprocessableDocs = selectedDocuments.filter(
    (d) =>
      !isPdfDocument(d.mime_type, d.original_filename) &&
      !isImageDocument(d.mime_type, d.original_filename)
  )
  const isMergedPdf = processableDocs.length > 1
  const mergedPdfName = processableDocs.length > 0 ? generateMergedPdfFilename(companyName) : null
  const mergedPdfSize = processableDocs.reduce((acc, d) => acc + (d.file_size || 0), 0)

  // Live preview values
  const activeSubject = subject.trim() || defaultSubjectFallback
  const activeMessage = message.trim() || defaultMessageFallback

  const previewSubject = replacePlaceholders(activeSubject, {
    company_name: companyName || 'PT Target Perusahaan',
    position: position || 'Software Engineer',
    sender_name: senderName,
    sender_city: senderCity || '',
    // today_date auto-resolved by replacePlaceholders (Asia/Jakarta)
  })

  const previewMessage = replacePlaceholders(activeMessage, {
    company_name: companyName || 'PT Target Perusahaan',
    position: position || 'Software Engineer',
    sender_name: senderName,
    sender_city: senderCity || '',
    // today_date auto-resolved by replacePlaceholders (Asia/Jakarta)
  })

  // Open confirmation
  const handleOpenConfirmation = (e: React.FormEvent) => {
    e.preventDefault()

    if (!companyName.trim()) {
      toast.error('Nama perusahaan wajib diisi.')
      return
    }

    if (!position.trim()) {
      toast.error('Posisi yang dilamar wajib diisi.')
      return
    }

    if (!recipientEmail.trim() || !recipientEmail.includes('@')) {
      toast.error('Format email penerima tidak valid.')
      return
    }

    if (!activeMessage.trim()) {
      toast.error(
        'Isi pesan lamaran tidak boleh kosong. Ketikkan pesan atau simpan pesan default di Konfigurasi Email.'
      )
      return
    }

    if (isAttachmentSizeExceeded) {
      toast.error('Total ukuran lampiran melebihi batas 25MB.')
      return
    }

    setIsConfirmOpen(true)
  }

  // Fire-and-forget send — closes modal immediately, tracks status via floating indicator
  const handleConfirmSend = () => {
    const payload: SendApplicationPayload = {
      recipient_email: recipientEmail.trim(),
      company_name: companyName.trim(),
      position: position.trim(),
      subject: subject.trim() || undefined,
      message: message.trim() || undefined,
      template_id: selectedTemplateId,
      selected_document_ids: selectedDocuments.map((d) => d.id),
    }

    const jobId = crypto.randomUUID()
    const job: SendJob = {
      id: jobId,
      companyName: companyName.trim(),
      position: position.trim(),
      recipientEmail: recipientEmail.trim(),
      status: 'sending',
      payload,
      startedAt: Date.now(),
    }

    // 1. Add job to indicator
    setSendJobs((prev) => [...prev, job])

    // 2. Close modal & reset form immediately
    setIsConfirmOpen(false)
    setRecipientEmail('')
    setCompanyName('')
    setPosition('')
    const activeTpl = emailTemplates.find((t) => t.id === selectedTemplateId)
    setSubject(activeTpl?.subject || defaultSubjectFallback)
    setMessage(activeTpl?.message || defaultMessageFallback)
    setSelectedDocIds([])

    // 3. Run server action async — doesn't block UI
    sendApplicationAction(payload).then((result) => {
      if (result.success && result.data) {
        setSendJobs((prev) =>
          prev.map((j) =>
            j.id === jobId
              ? { ...j, status: 'done', logId: result.data!.logId, resendId: result.data!.resendId }
              : j
          )
        )
      } else {
        setSendJobs((prev) =>
          prev.map((j) =>
            j.id === jobId
              ? { ...j, status: 'error', error: result.error || 'Gagal mengirim email lamaran.' }
              : j
          )
        )
      }
    })
  }

  // Retry a failed job
  const handleRetry = (jobId: string) => {
    const job = sendJobs.find((j) => j.id === jobId)
    if (!job) return

    const newJobId = crypto.randomUUID()
    setSendJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? { ...j, id: newJobId, status: 'sending', error: undefined, startedAt: Date.now() }
          : j
      )
    )

    sendApplicationAction(job.payload).then((result) => {
      if (result.success && result.data) {
        setSendJobs((prev) =>
          prev.map((j) =>
            j.id === newJobId
              ? { ...j, status: 'done', logId: result.data!.logId, resendId: result.data!.resendId }
              : j
          )
        )
      } else {
        setSendJobs((prev) =>
          prev.map((j) =>
            j.id === newJobId
              ? { ...j, status: 'error', error: result.error || 'Gagal mengirim email lamaran.' }
              : j
          )
        )
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Sending jobs are shown via the floating SendingJobsIndicator below */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column (Left) */}
        <form onSubmit={handleOpenConfirmation} className="lg:col-span-7 space-y-6">
          {/* Target Info */}
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-semibold">
                  1 &amp; 2. Data Perusahaan, Posisi &amp; Penerima
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Masukkan informasi perusahaan, posisi pekerjaan yang dilamar, dan email HRD tujuan.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="company_name" className="text-xs font-medium">
                    Nama Perusahaan <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="company_name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Contoh: PT Inovasi Digital"
                      className="pl-9 h-9 text-xs sm:text-sm"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Variabel: <code>{`{{company_name}}`}</code>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="position" className="text-xs font-medium">
                    Posisi yang Dilamar <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="position"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="Contoh: Frontend Developer"
                      className="pl-9 h-9 text-xs sm:text-sm"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Variabel: <code>{`{{position}}`}</code>
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="recipient_email" className="text-xs font-medium">
                  Email Penerima (HRD / Rekruter) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="recipient_email"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="Contoh: recruitment@company.com / hrd@perusahaan.co.id"
                    className="pl-9 h-9 text-xs sm:text-sm font-mono"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Content */}
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base font-semibold">
                    3 &amp; 4. Subject &amp; Isi Surat Lamaran
                  </CardTitle>
                </div>

                {emailTemplates.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground">Template:</span>
                    <select
                      value={selectedTemplateId || ''}
                      onChange={(e) => e.target.value && handleSelectTemplate(e.target.value)}
                      className="h-7 text-xs rounded-md border border-border bg-muted/40 px-2 text-foreground focus:outline-none"
                    >
                      <option value="" disabled>
                        Pilih template tersimpan...
                      </option>
                      {emailTemplates.map((t) => {
                        const isVisual = Boolean(
                          t.layout_config &&
                            Array.isArray(t.layout_config.blocks) &&
                            t.layout_config.blocks.length > 0
                        )
                        return (
                          <option key={t.id} value={t.id}>
                            {t.template_name} {isVisual ? '✨ [Visual A4]' : ''} {t.is_default ? '(Default)' : ''}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                )}
              </div>
              <CardDescription className="text-xs">
                Kosongkan kolom subject atau pesan jika ingin otomatis menggunakan nilai default dari Supabase.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="app_subject" className="text-xs font-medium">
                  Subject Email
                </Label>
                <Input
                  id="app_subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={`Default: ${defaultSubjectFallback}`}
                  className="h-9 text-xs sm:text-sm"
                />
                <p className="text-[11px] text-muted-foreground">
                  Kosongkan untuk memakai: <code className="text-[10px]">{defaultSubjectFallback}</code>
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <Label htmlFor="app_message" className="text-xs font-medium">
                    Isi Surat Lamaran
                  </Label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-muted-foreground">Sisipkan:</span>
                    {SUPPORTED_PLACEHOLDERS.map((p) => (
                      <button
                        key={p.tag}
                        type="button"
                        onClick={() => handleInsertPlaceholder(p.tag)}
                        className="px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-[11px] font-mono text-primary border border-border cursor-pointer transition-colors"
                      >
                        +{p.tag}
                      </button>
                    ))}
                  </div>
                </div>

                <Textarea
                  ref={textareaRef}
                  id="app_message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    defaultMessageFallback
                      ? `Default: ${defaultMessageFallback.substring(0, 100)}...`
                      : 'Ketik isi surat lamaran kerja Anda di sini...'
                  }
                  rows={8}
                  className="text-xs sm:text-sm font-sans leading-relaxed min-h-40 resize-y"
                />
                <p className="text-[11px] text-muted-foreground">
                  Kosongkan kolom ini jika ingin memakai pesan default yang sudah tersimpan di database.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Attachments Selection */}
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base font-semibold">
                    5. Lampiran Dokumen
                  </CardTitle>
                </div>

                {userDocuments.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllDocs}
                      className="text-xs text-primary hover:underline font-medium cursor-pointer"
                    >
                      Pilih Semua
                    </button>
                    <span className="text-muted-foreground">|</span>
                    <button
                      type="button"
                      onClick={handleDeselectAllDocs}
                      className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Batalkan Semua
                    </button>
                  </div>
                )}
              </div>
              <CardDescription className="text-xs">
                Pilih dokumen yang ingin dilampirkan. Urutan dokumen mengikuti pengaturan permanen di{' '}
                <Link href="/manajemen-dokumen" className="text-primary hover:underline font-medium">
                  Manajemen Dokumen
                </Link>
                . Beberapa file PDF akan otomatis digabung sesuai urutan nomor tersebut.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {userDocuments.length === 0 ? (
                <div className="p-6 text-center rounded-xl border border-dashed border-border/80 bg-muted/20 space-y-2">
                  <Paperclip className="h-8 w-8 mx-auto text-muted-foreground/60" />
                  <p className="text-xs sm:text-sm font-medium text-foreground">
                    Belum ada dokumen yang tersimpan
                  </p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Unggah CV atau sertifikat terlebih dahulu di menu Manajemen Dokumen untuk dilampirkan ke email lamaran.
                  </p>
                  <Link
                    href="/manajemen-dokumen"
                    className={buttonVariants({ variant: 'outline', size: 'xs', className: 'mt-2 text-xs' })}
                  >
                    Ke Manajemen Dokumen
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Documents List with Checkbox Only */}
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {userDocuments.map((doc, idx) => {
                      const isChecked = selectedDocIds.includes(doc.id)
                      const isPdf = isPdfDocument(doc.mime_type, doc.original_filename)
                      const sortOrderNum = doc.sort_order ?? idx + 1

                      return (
                        <div
                          key={doc.id}
                          className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                            isChecked
                              ? 'border-primary/60 bg-primary/5 ring-1 ring-primary/20'
                              : 'border-border/70 bg-card hover:bg-muted/40'
                          }`}
                        >
                          {/* Left: Order badge + Checkbox + Document Meta */}
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs font-mono font-bold text-primary/70 w-6 text-center shrink-0">
                              #{sortOrderNum}
                            </span>
                            <Checkbox
                              id={`checkbox-doc-${doc.id}`}
                              checked={isChecked}
                              onCheckedChange={() => handleToggleDoc(doc.id)}
                              className="shrink-0"
                            />
                            <label
                              htmlFor={`checkbox-doc-${doc.id}`}
                              className="min-w-0 cursor-pointer select-none space-y-0.5"
                            >
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-semibold text-foreground truncate">
                                  {doc.document_name}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-[9px] px-1 py-0 font-medium ${
                                    isPdf
                                      ? 'border-red-500/30 text-red-600 dark:text-red-400'
                                      : 'border-border text-muted-foreground'
                                  }`}
                                >
                                  {isPdf ? 'PDF' : 'NON-PDF'}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  ({formatBytes(doc.file_size)})
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground truncate font-mono">
                                {doc.original_filename}
                              </p>
                            </label>
                          </div>

                          {/* Right: Check / Uncheck status indicator */}
                          {isChecked ? (
                            <Check className="h-4 w-4 text-primary shrink-0" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Total attachment status & PDF merge badge */}
              {userDocuments.length > 0 && (
                <div className="pt-2 border-t border-border/50 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      <strong>{selectedDocuments.length}</strong> dokumen dipilih
                    </span>
                    <span className={isAttachmentSizeExceeded ? 'text-destructive font-semibold' : 'font-mono'}>
                      Total: {formatBytes(totalAttachmentBytes)} / 25 MB
                    </span>
                  </div>

                  {isMergedPdf && (
                    <div className="p-2.5 rounded-lg border border-primary/20 bg-primary/5 text-xs text-primary flex items-center gap-2">
                      <FileCheck className="h-4 w-4 shrink-0" />
                      <span>
                        <strong>{processableDocs.length} dokumen</strong> (PDF dan/atau gambar) akan otomatis dikonversi dan digabung menjadi 1 lampiran PDF: <code className="font-mono text-[11px] font-semibold">{mergedPdfName}</code> sesuai urutan di Manajemen Dokumen.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {isAttachmentSizeExceeded && (
                <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Total ukuran lampiran melebihi batas 25MB. Silakan kurangi dokumen yang dipilih.</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Trigger Button */}
          <Button
            type="submit"
            disabled={isAttachmentSizeExceeded}
            className="w-full h-10 gap-2 shadow-sm font-semibold text-sm"
          >
            <Send className="h-4 w-4" />
            <span>Kirim Lamaran Sekarang</span>
          </Button>
        </form>

        {/* Live Preview Column (Right) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-20 space-y-3">
            <Card className="border-border/80 bg-gradient-to-br from-card via-card to-muted/20 shadow-xs">
              <CardHeader className="pb-3 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-semibold">
                      Live Preview Email HRD
                    </CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    Hasil Nyata
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Simulasi tampilan email yang akan diterima oleh HRD perusahaan.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 space-y-3">
                {/* Envelope */}
                <div className="rounded-lg border border-border/70 bg-background/80 p-3 space-y-2 text-xs">
                  <div className="flex items-start justify-between border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground w-20 shrink-0 font-medium">Dari:</span>
                    <span className="font-semibold text-foreground text-right truncate">
                      {senderName} {senderEmail ? `<${senderEmail}>` : ''}
                    </span>
                  </div>

                  <div className="flex items-start justify-between border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground w-20 shrink-0 font-medium">Perusahaan:</span>
                    <span className="font-semibold text-foreground text-right truncate">
                      {companyName || 'PT Target Perusahaan'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground w-20 shrink-0 font-medium">Posisi:</span>
                    <span className="font-semibold text-primary text-right truncate">
                      {position || 'Software Engineer'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground w-20 shrink-0 font-medium">Kepada:</span>
                    <span className="text-foreground text-right truncate font-mono">
                      {recipientEmail || 'hrd@perusahaan.com'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <span className="text-muted-foreground w-20 shrink-0 font-medium">Subject:</span>
                    <span className="font-semibold text-primary text-right truncate">
                      {previewSubject}
                    </span>
                  </div>
                </div>

                {/* Email Body */}
                <div className="rounded-lg border border-border/70 bg-background/80 p-4 min-h-52 max-h-80 overflow-y-auto">
                  {previewMessage ? (
                    <pre className="font-sans text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                      {previewMessage}
                    </pre>
                  ) : (
                    <div className="h-36 flex flex-col items-center justify-center text-center text-muted-foreground">
                      <FileText className="h-6 w-6 mb-1 opacity-40" />
                      <p className="text-xs">Pesan lamaran belum diatur</p>
                    </div>
                  )}
                </div>

                {/* Selected Attachments in Preview */}
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5 text-primary" />
                      <span>Lampiran Email ({isMergedPdf ? 1 + unprocessableDocs.length : selectedDocuments.length})</span>
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {formatBytes(totalAttachmentBytes)}
                    </span>
                  </div>

                  {selectedDocuments.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground italic">
                      Tidak ada dokumen yang dilampirkan.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {/* Merged PDF Card Preview — when >1 processable docs (PDF or image) */}
                      {isMergedPdf && (
                        <div className="p-2.5 rounded-lg bg-background border border-primary/30 shadow-2xs space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <FileCheck className="h-4 w-4 text-primary shrink-0" />
                              <span className="text-xs font-semibold text-foreground truncate font-mono">
                                {mergedPdfName}
                              </span>
                            </div>
                            <Badge variant="secondary" className="text-[10px] shrink-0 bg-primary/10 text-primary border-primary/20">
                              1 PDF Gabungan ({formatBytes(mergedPdfSize)})
                            </Badge>
                          </div>
                          <div className="text-[10px] text-muted-foreground pl-5 space-y-1 border-t border-border/40 pt-1.5">
                            <span className="font-medium block text-foreground/80">Urutan Halaman PDF Gabungan:</span>
                            {processableDocs.map((doc, idx) => (
                              <div key={doc.id} className="flex items-center justify-between gap-1.5 truncate">
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className="text-primary font-mono font-bold">#{doc.sort_order ?? idx + 1}</span>
                                  <span className="truncate">{doc.document_name}</span>
                                  {isImageDocument(doc.mime_type, doc.original_filename) && (
                                    <Badge variant="outline" className="text-[9px] px-1 py-0 shrink-0">Gambar→PDF</Badge>
                                  )}
                                </div>
                                <span className="font-mono text-muted-foreground shrink-0">({formatBytes(doc.file_size)})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Single processable doc if not merged */}
                      {!isMergedPdf &&
                        processableDocs.map((doc, idx) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-2 rounded-md bg-background border border-border/80 text-xs font-medium text-foreground shadow-2xs"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="text-primary font-mono font-bold text-[11px]">#{doc.sort_order ?? idx + 1}</span>
                              <Paperclip className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span className="truncate">{doc.document_name}</span>
                              {isImageDocument(doc.mime_type, doc.original_filename) && (
                                <Badge variant="outline" className="text-[9px] px-1 py-0 shrink-0">Gambar→PDF</Badge>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                              {formatBytes(doc.file_size)}
                            </span>
                          </div>
                        ))}

                      {/* Truly unsupported format documents (attached as-is) */}
                      {unprocessableDocs.map((doc, idx) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2 rounded-md bg-background border border-border/80 text-xs font-medium text-foreground shadow-2xs"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-primary font-mono font-bold text-[11px]">
                              #{doc.sort_order ?? idx + 1}
                            </span>
                            <Paperclip className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="truncate">{doc.document_name}</span>
                            <Badge variant="outline" className="text-[9px] px-1 py-0">Lampiran Terpisah</Badge>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                            {formatBytes(doc.file_size)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ApplicationConfirmationModal
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        recipientEmail={recipientEmail.trim()}
        companyName={companyName.trim()}
        position={position.trim()}
        resolvedSubject={previewSubject}
        senderName={senderName}
        senderEmail={senderEmail}
        selectedDocuments={selectedDocuments}
        onConfirmSend={handleConfirmSend}
      />

      {/* Floating top-right send status indicator */}
      <SendingJobsIndicator
        jobs={sendJobs}
        onRetry={handleRetry}
        onDismiss={(id) => setSendJobs((prev) => prev.filter((j) => j.id !== id))}
      />
    </div>
  )
}
