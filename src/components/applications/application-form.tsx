'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Send,
  Building2,
  Mail,
  FileText,
  Paperclip,
  Check,
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  History,
  Layers,
} from 'lucide-react'
import { toast } from 'sonner'
import type { DocumentRow } from '@/types/document'
import type { EmailSettingsRow, EmailTemplateRow } from '@/types/config'
import { formatBytes } from '@/lib/format'
import { SUPPORTED_PLACEHOLDERS, replacePlaceholders } from '@/lib/placeholders'
import { sendApplicationAction } from '@/app/actions/send-application'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button, buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ApplicationConfirmationModal } from '@/components/applications/application-confirmation-modal'

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
  // Find default template if any
  const defaultTemplate = emailTemplates.find((t) => t.is_default)

  // Form states
  const [recipientEmail, setRecipientEmail] = React.useState('')
  const [companyName, setCompanyName] = React.useState('')
  const [subject, setSubject] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [selectedDocIds, setSelectedDocIds] = React.useState<string[]>([])

  // Modal & sending states
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false)
  const [isSending, setIsSending] = React.useState(false)
  const [sentSuccessData, setSentSuccessData] = React.useState<{
    company: string
    email: string
    resendId: string
  } | null>(null)

  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Auto-fill defaults when available
  const defaultSubjectFallback =
    defaultTemplate?.subject ||
    emailSettings?.default_subject ||
    'Lamaran Pekerjaan - {sender_name} - {company_name}'

  const defaultMessageFallback =
    defaultTemplate?.message || emailSettings?.default_message || ''

  const senderName =
    emailSettings?.sender_name || 'Pelamar Kerja'

  const senderEmail = connectedGmailEmail || emailSettings?.sender_email || ''

  // Load a chosen template into the subject & message inputs
  const handleSelectTemplate = (tplId: string) => {
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
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    )
  }

  const handleSelectAllDocs = () => {
    setSelectedDocIds(userDocuments.map((d) => d.id))
  }

  const handleDeselectAllDocs = () => {
    setSelectedDocIds([])
  }

  // Selected documents objects and total size
  const selectedDocuments = userDocuments.filter((d) =>
    selectedDocIds.includes(d.id)
  )

  const totalAttachmentBytes = selectedDocuments.reduce(
    (acc, d) => acc + (d.file_size || 0),
    0
  )
  const isAttachmentSizeExceeded = totalAttachmentBytes > 25 * 1024 * 1024

  // Live preview values
  const activeSubject = subject.trim() || defaultSubjectFallback
  const activeMessage = message.trim() || defaultMessageFallback

  const previewSubject = replacePlaceholders(activeSubject, {
    company_name: companyName || 'PT Target Perusahaan',
    sender_name: senderName,
  })

  const previewMessage = replacePlaceholders(activeMessage, {
    company_name: companyName || 'PT Target Perusahaan',
    sender_name: senderName,
  })

  // Open confirmation
  const handleOpenConfirmation = (e: React.FormEvent) => {
    e.preventDefault()

    if (!recipientEmail.trim() || !recipientEmail.includes('@')) {
      toast.error('Format email penerima tidak valid.')
      return
    }

    if (!companyName.trim()) {
      toast.error('Nama perusahaan wajib diisi.')
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

  // Confirm and Send email via Server Action
  const handleConfirmSend = async () => {
    setIsSending(true)

    const result = await sendApplicationAction({
      recipient_email: recipientEmail.trim(),
      company_name: companyName.trim(),
      subject: subject.trim() || undefined,
      message: message.trim() || undefined,
      selected_document_ids: selectedDocIds,
    })

    setIsSending(false)

    if (result.success && result.data) {
      toast.success(
        `Email lamaran berhasil dikirim ke ${recipientEmail.trim()} via Gmail API!`
      )
      setIsConfirmOpen(false)

      setSentSuccessData({
        company: companyName.trim(),
        email: recipientEmail.trim(),
        resendId: result.data.resendId,
      })

      // Reset form
      setRecipientEmail('')
      setCompanyName('')
      setSubject('')
      setMessage('')
      setSelectedDocIds([])
    } else {
      toast.error(result.error || 'Gagal mengirim email lamaran.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Success Banner if just sent */}
      {sentSuccessData && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in-50">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold">
                Lamaran ke {sentSuccessData.company} Berhasil Dikirim!
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Terkirim ke <strong>{sentSuccessData.email}</strong>. ID Pesan: <code className="text-[11px] font-mono">{sentSuccessData.resendId}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSentSuccessData(null)}
              className="text-xs h-8 bg-background"
            >
              Kirim Lainnya
            </Button>
            <Link
              href="/riwayat-lamaran"
              className={buttonVariants({ size: 'sm', className: 'text-xs h-8 gap-1.5 shadow-xs' })}
            >
              <History className="h-3.5 w-3.5" />
              <span>Lihat di Riwayat</span>
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column (Left) */}
        <form onSubmit={handleOpenConfirmation} className="lg:col-span-7 space-y-6">
          {/* Target Info */}
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-semibold">
                  1 & 2. Data Penerima Lamaran
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Masukkan informasi perusahaan dan alamat email HRD tujuan.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
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
                    placeholder="Contoh: PT Tokopedia Indonesia / Google Indonesia"
                    className="pl-9 h-9 text-xs sm:text-sm"
                    required
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Nama perusahaan ini akan otomatis menggantikan placeholder <code>{'{company_name}'}</code>.
                </p>
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
                    3 & 4. Subject & Isi Surat Lamaran
                  </CardTitle>
                </div>

                {emailTemplates.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground">Template:</span>
                    <select
                      onChange={(e) => e.target.value && handleSelectTemplate(e.target.value)}
                      defaultValue=""
                      className="h-7 text-xs rounded-md border border-border bg-muted/40 px-2 text-foreground focus:outline-none"
                    >
                      <option value="" disabled>
                        Pilih template tersimpan...
                      </option>
                      {emailTemplates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.template_name} {t.is_default ? '(Default)' : ''}
                        </option>
                      ))}
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
                  <div className="flex items-center gap-1.5">
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
                Pilih dokumen dari Supabase Storage yang akan dilampirkan otomatis ke email HRD.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
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
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {userDocuments.map((doc) => {
                    const isChecked = selectedDocIds.includes(doc.id)

                    return (
                      <div
                        key={doc.id}
                        onClick={() => handleToggleDoc(doc.id)}
                        className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                          isChecked
                            ? 'border-primary/60 bg-primary/5 ring-1 ring-primary/20'
                            : 'border-border/70 bg-card hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => handleToggleDoc(doc.id)}
                            className="shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">
                              {doc.document_name}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate font-mono">
                              {doc.original_filename}
                            </p>
                          </div>
                        </div>

                        <Badge variant="outline" className="text-[10px] shrink-0 font-mono">
                          {formatBytes(doc.file_size)}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Total attachment status */}
              {userDocuments.length > 0 && (
                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    <strong>{selectedDocuments.length}</strong> dokumen dipilih
                  </span>
                  <span className={isAttachmentSizeExceeded ? 'text-destructive font-semibold' : 'font-mono'}>
                    Total: {formatBytes(totalAttachmentBytes)} / 25 MB
                  </span>
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
            disabled={isSending || isAttachmentSizeExceeded}
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
                    <span className="text-muted-foreground w-16 shrink-0 font-medium">Dari:</span>
                    <span className="font-semibold text-foreground text-right truncate">
                      {senderName} {senderEmail ? `<${senderEmail}>` : ''}
                    </span>
                  </div>

                  <div className="flex items-start justify-between border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground w-16 shrink-0 font-medium">Kepada:</span>
                    <span className="text-foreground text-right truncate font-mono">
                      {recipientEmail || 'hrd@perusahaan.com'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <span className="text-muted-foreground w-16 shrink-0 font-medium">Subject:</span>
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

                {/* Selected Attachments Pills in Preview */}
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5 text-primary" />
                      <span>Lampiran Terpilih ({selectedDocuments.length})</span>
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
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                      {selectedDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-background border border-border/80 text-[11px] font-medium text-foreground shadow-2xs"
                        >
                          <Paperclip className="h-3 w-3 text-primary shrink-0" />
                          <span className="truncate max-w-[140px]">{doc.document_name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            ({formatBytes(doc.file_size)})
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
        resolvedSubject={previewSubject}
        senderName={senderName}
        senderEmail={senderEmail}
        selectedDocuments={selectedDocuments}
        isSending={isSending}
        onConfirmSend={handleConfirmSend}
      />
    </div>
  )
}

