import * as React from 'react'
import Link from 'next/link'
import { ArrowLeft, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { DocumentRow } from '@/types/document'
import type { EmailSettingsRow, EmailTemplateRow } from '@/types/config'
import { Badge } from '@/components/ui/badge'
import { ApplicationForm } from '@/components/applications/application-form'

export default async function KirimLamaranPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userDocuments: DocumentRow[] = []
  let emailSettings: EmailSettingsRow | null = null
  let emailTemplates: EmailTemplateRow[] = []

  if (user) {
    // 1. Fetch user's stored documents from documents table
    const { data: docsData } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

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
  }

  const isGmailConfigured = Boolean(
    process.env.GMAIL_CLIENT_ID &&
    process.env.GMAIL_CLIENT_SECRET &&
    process.env.GMAIL_REFRESH_TOKEN
  )

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
          <Badge variant="outline" className="w-fit text-xs px-2.5 py-1 gap-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isGmailConfigured ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            {isGmailConfigured ? 'Gmail API Siap' : 'Gmail Belum Dikonfigurasi'}
          </Badge>
        </div>
      </div>

      {/* Main Application Form */}
      <ApplicationForm
        userDocuments={userDocuments}
        emailSettings={emailSettings}
        emailTemplates={emailTemplates}
      />
    </div>
  )
}
