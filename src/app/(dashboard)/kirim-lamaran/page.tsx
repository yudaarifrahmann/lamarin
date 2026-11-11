import * as React from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Mail, AlertCircle } from 'lucide-react'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { DocumentRow } from '@/types/document'
import type { EmailSettingsRow, EmailTemplateRow } from '@/types/config'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { ApplicationForm } from '@/components/applications/application-form'
import { cn } from '@/lib/utils'

export const instant = false

export default async function KirimLamaranPage() {
  await connection()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userDocuments: DocumentRow[] = []
  let emailSettings: EmailSettingsRow | null = null
  let emailTemplates: EmailTemplateRow[] = []
  let connectedGmailEmail: string | null = null

  if (user) {
    // 1. Fetch user's stored documents from documents table (ordered by persistent sort_order)
    let { data: docsData, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })

    if (docsError && docsError.message.includes('sort_order')) {
      const fallbackDocs = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      docsData = fallbackDocs.data
    }

    if (docsData) {
      userDocuments = docsData as DocumentRow[]
    }

    // 2. Fetch email_settings
    const { data: settingsData } = await supabase
      .from('email_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (settingsData) {
      emailSettings = settingsData as EmailSettingsRow
    }

    // 3. Fetch email_templates
    const { data: templatesData } = await supabase
      .from('email_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (templatesData) {
      emailTemplates = templatesData as EmailTemplateRow[]
    }

    // 4. Fetch user's connected Gmail account from gmail_connections
    const { data: gmailConn } = await supabase
      .from('gmail_connections')
      .select('gmail_email')
      .eq('user_id', user.id)
      .maybeSingle()

    if (gmailConn) {
      connectedGmailEmail = gmailConn.gmail_email
    }
  }

  const isGmailConnected = Boolean(connectedGmailEmail)

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Navigation & Header */}
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
            <span className="text-xs font-medium text-foreground">Kirim Lamaran</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Kirim Lamaran Kerja
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Kirimkan email lamaran kerja resmi ke HRD dengan lampiran dokumen otomatis via Google Gmail API.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isGmailConnected ? (
            <Badge variant="outline" className="w-fit text-xs px-2.5 py-1 gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Gmail: {connectedGmailEmail}</span>
            </Badge>
          ) : (
            <Link href="/konfigurasi-email">
              <Badge variant="outline" className="w-fit text-xs px-2.5 py-1 gap-1.5 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 cursor-pointer">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>Gmail Belum Terhubung</span>
              </Badge>
            </Link>
          )}
        </div>
      </div>

      {/* Alert jika Gmail belum terhubung */}
      {!isGmailConnected && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Akun Gmail Belum Terhubung</p>
              <p className="text-muted-foreground mt-0.5">
                Anda perlu menghubungkan akun Gmail pribadi terlebih dahulu agar sistem dapat mengirimkan email lamaran kerja resmi secara langsung.
              </p>
            </div>
          </div>
          <Link
            href="/konfigurasi-email"
            className={cn(
              buttonVariants({ size: 'sm' }),
              'gap-1.5 shadow-xs text-xs shrink-0 bg-amber-600 hover:bg-amber-700 text-white'
            )}
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Hubungkan Gmail Sekarang</span>
          </Link>
        </div>
      )}

      {/* Main Application Form */}
      <ApplicationForm
        userDocuments={userDocuments}
        emailSettings={emailSettings}
        emailTemplates={emailTemplates}
        connectedGmailEmail={connectedGmailEmail}
      />
    </div>
  )
}
