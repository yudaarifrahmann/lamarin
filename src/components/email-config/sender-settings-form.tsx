'use client'

import * as React from 'react'
import { Save, Loader2, Sparkles, User, Mail, FileText, CheckCircle2, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import type { EmailSettingsRow } from '@/types/config'
import { saveEmailSettingsAction } from '@/app/actions/settings'
import { SUPPORTED_PLACEHOLDERS, replacePlaceholders } from '@/lib/placeholders'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SenderSettingsFormProps {
  initialSettings: EmailSettingsRow | null
}

export function SenderSettingsForm({ initialSettings }: SenderSettingsFormProps) {
  const [senderName, setSenderName] = React.useState(initialSettings?.sender_name || '')
  const [senderEmail, setSenderEmail] = React.useState(initialSettings?.sender_email || '')
  const [senderCity, setSenderCity] = React.useState((initialSettings as any)?.sender_city || '')
  const [defaultSubject, setDefaultSubject] = React.useState(initialSettings?.default_subject || '')
  const [defaultMessage, setDefaultMessage] = React.useState(initialSettings?.default_message || '')
  const [isSaving, setIsSaving] = React.useState(false)

  // Sync state if initialSettings changes
  React.useEffect(() => {
    if (initialSettings) {
      setSenderName(initialSettings.sender_name || '')
      setSenderEmail(initialSettings.sender_email || '')
      const incomingCity = (initialSettings as any)?.sender_city
      // Only update senderCity if incoming value is non-empty, preventing accidental wipes on stale revalidation
      if (incomingCity !== undefined && incomingCity !== null && incomingCity !== '') {
        setSenderCity(incomingCity)
      }
      setDefaultSubject(initialSettings.default_subject || '')
      setDefaultMessage(initialSettings.default_message || '')
    }
  }, [initialSettings])

  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Insert placeholder tag into message textarea at current cursor position
  const handleInsertPlaceholder = (tag: string) => {
    const textarea = textareaRef.current
    if (!textarea) {
      setDefaultMessage((prev) => prev + tag)
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const current = textarea.value
    const updated = current.substring(0, start) + tag + current.substring(end)
    setDefaultMessage(updated)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + tag.length, start + tag.length)
    }, 0)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!senderName.trim()) {
      toast.error('Nama pengirim wajib diisi.')
      return
    }
    if (!senderEmail.trim() || !senderEmail.includes('@')) {
      toast.error('Email pengirim tidak valid.')
      return
    }

    setIsSaving(true)
    const result = await saveEmailSettingsAction({
      sender_name: senderName.trim(),
      sender_email: senderEmail.trim(),
      sender_city: senderCity.trim() || undefined,
      default_subject: defaultSubject.trim() || undefined,
      default_message: defaultMessage.trim() || undefined,
    })
    setIsSaving(false)

    if (result.success) {
      if (result.data && (result.data as any).sender_city) {
        setSenderCity((result.data as any).sender_city)
      }
      toast.success('Pengaturan email dan template default berhasil disimpan ke Supabase.')
    } else {
      toast.error(result.error || 'Gagal menyimpan pengaturan.')
    }
  }

  // Live preview values
  const previewSubject = replacePlaceholders(defaultSubject, {
    sender_name: senderName || 'Nama Pelamar',
    company_name: 'PT Inovasi Digital Indonesia',
    position: 'Software Engineer',
    sender_city: senderCity || 'Jakarta',
  })

  const previewMessage = replacePlaceholders(defaultMessage, {
    sender_name: senderName || 'Nama Pelamar',
    company_name: 'PT Inovasi Digital Indonesia',
    position: 'Software Engineer',
    sender_city: senderCity || 'Jakarta',
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Form Settings (Left Column) */}
      <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
        {/* A. Identitas Pengirim */}
        <Card className="border-border/80">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                A. Identitas Pengirim
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Nama dan alamat email yang akan muncul sebagai pengirim pada surat lamaran kerja.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="sender_name" className="text-xs font-medium">
                Nama Pengirim <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="sender_name"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Contoh: Budi Pratama, S.Kom."
                  className="pl-9 h-9 text-xs sm:text-sm"
                  disabled={isSaving}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sender_email" className="text-xs font-medium">
                Email Pengirim <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="sender_email"
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="Contoh: budipratama@domain.com"
                  className="pl-9 h-9 text-xs sm:text-sm"
                  disabled={isSaving}
                  required
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Email ini akan digunakan sebagai alamat balasan (*reply-to*) oleh HRD.
              </p>
            </div>

            {/* Kota / Tempat Pengirim */}
            <div className="space-y-1.5">
              <Label htmlFor="sender_city" className="text-xs font-medium">
                Kota / Tempat Pengirim
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="sender_city"
                  value={senderCity}
                  onChange={(e) => setSenderCity(e.target.value)}
                  placeholder="Contoh: Jakarta"
                  className="pl-9 h-9 text-xs sm:text-sm"
                  disabled={isSaving}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Digunakan untuk placeholder <code>{'{{sender_city}}'}</code> pada baris tanggal surat (misal: <em>Jakarta, 12 November 2026</em>).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* B & C. Subject Default & Pesan Default */}
        <Card className="border-border/80">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                B & C. Subject & Isi Pesan Default
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Template pembuka otomatis yang disimpan di database dan siap digunakan saat mengirim lamaran.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Subject Default */}
            <div className="space-y-1.5">
              <Label htmlFor="default_subject" className="text-xs font-medium">
                Subject Email Default
              </Label>
              <Input
                id="default_subject"
                value={defaultSubject}
                onChange={(e) => setDefaultSubject(e.target.value)}
                placeholder="Contoh: Lamaran Pekerjaan - {sender_name} - {company_name}"
                className="h-9 text-xs sm:text-sm"
                disabled={isSaving}
              />
              <p className="text-[11px] text-muted-foreground">
                Mendukung placeholder dinamis: <code>{'{company_name}'}</code> dan <code>{'{sender_name}'}</code>.
              </p>
            </div>

            {/* Isi Pesan Default */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <Label htmlFor="default_message" className="text-xs font-medium">
                  Isi Pesan Email Default (Multiline)
                </Label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground">Sisipkan variabel:</span>
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
                id="default_message"
                value={defaultMessage}
                onChange={(e) => setDefaultMessage(e.target.value)}
                placeholder="Tuliskan format isi surat lamaran kerja Anda..."
                rows={9}
                className="text-xs sm:text-sm font-sans leading-relaxed min-h-48 resize-y"
                disabled={isSaving}
              />
            </div>

            {/* Save Button */}
            <Button type="submit" disabled={isSaving} className="gap-2 shadow-xs w-full sm:w-auto">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan ke Supabase...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Simpan Pengaturan Default</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </form>

      {/* E. Live Preview Panel (Right Column) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="sticky top-20 space-y-3">
          <Card className="border-border/80 bg-gradient-to-br from-card via-card to-muted/30 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-semibold">
                    E. Live Preview Tampilan
                  </CardTitle>
                </div>
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                  Simulasi HRD
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Hasil otomatis ketika placeholder digantikan dengan data perusahaan dan identitas Anda.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {/* Email Envelope Header */}
              <div className="rounded-lg border border-border/70 bg-background/80 p-3 space-y-2 text-xs">
                <div className="flex items-start justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground w-16 shrink-0 font-medium">Dari:</span>
                  <span className="font-semibold text-foreground text-right truncate">
                    {senderName ? `${senderName} <${senderEmail || 'email@domain.com'}>` : 'Belum diatur'}
                  </span>
                </div>

                <div className="flex items-start justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground w-16 shrink-0 font-medium">Kepada:</span>
                  <span className="text-foreground text-right truncate">
                    HRD PT Inovasi Digital Indonesia &lt;hr@perusahaan.com&gt;
                  </span>
                </div>

                <div className="flex items-start justify-between">
                  <span className="text-muted-foreground w-16 shrink-0 font-medium">Subject:</span>
                  <span className="font-semibold text-primary text-right">
                    {previewSubject || <em className="text-muted-foreground font-normal">(Subject kosong)</em>}
                  </span>
                </div>
              </div>

              {/* Email Body Preview */}
              <div className="rounded-lg border border-border/70 bg-background/80 p-4 min-h-60 max-h-96 overflow-y-auto">
                {previewMessage ? (
                  <pre className="text-xs text-foreground font-sans whitespace-pre-wrap leading-relaxed">
                    {previewMessage}
                  </pre>
                ) : (
                  <div className="h-44 flex flex-col items-center justify-center text-center text-muted-foreground p-4">
                    <FileText className="h-8 w-8 mb-2 opacity-30" />
                    <p className="text-xs font-medium">Isi pesan default masih kosong</p>
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5 max-w-xs">
                      Ketikkan pesan di kolom kiri untuk melihat simulasi hasil pergantian variabel secara langsung.
                    </p>
                  </div>
                )}
              </div>

              {/* Supported Placeholders Reference */}
              <div className="rounded-lg bg-muted/40 border border-border/60 p-3 text-[11px] space-y-1.5">
                <span className="font-medium text-foreground block">
                  Variabel yang sedang disimulasikan:
                </span>
                <div className="space-y-1 text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <code>{'{company_name}'}</code>
                    <span>→ PT Inovasi Digital Indonesia</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <code>{'{sender_name}'}</code>
                    <span>→ {senderName || 'Nama Pengirim'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <code>{'{sender_city}'}</code>
                    <span>→ {senderCity || <em className="text-muted-foreground/60">(belum diisi)</em>}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

