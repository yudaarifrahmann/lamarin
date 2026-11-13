import * as React from 'react'
import Link from 'next/link'
import { Settings2, ArrowLeft, ShieldCheck, MailCheck, CheckCircle2, AlertCircle } from 'lucide-react'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { EmailSettingsRow, EmailTemplateRow } from '@/types/config'
import type { GmailConnectionStatus } from '@/types/gmail'
import { Badge } from '@/components/ui/badge'
import { EmailConfigManager } from '@/components/email-config/email-config-manager'
import { GmailConnectionCard } from '@/components/config/gmail-connection-card'

export default async function KonfigurasiEmailPage() {
  await connection()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let settings: EmailSettingsRow | null = null
  let templates: EmailTemplateRow[] = []
  let gmailStatus: GmailConnectionStatus = { isConnected: false }

  if (user) {
    // 1. Fetch user email_settings (merge with persistent user_metadata for robust dual-persistence)
    const { data: settingsData } = await supabase
      .from('email_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    const metaCity = (user.user_metadata?.sender_city as string) || null

    if (settingsData) {
      settings = {
        ...(settingsData as EmailSettingsRow),
        sender_city: (settingsData as any)?.sender_city || metaCity || null,
      }
    } else if (metaCity) {
      settings = {
        id: '',
        user_id: user.id,
        sender_name: user.user_metadata?.full_name || '',
        sender_email: user.email || '',
        sender_city: metaCity,
        default_subject: null,
        default_message: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

    // 2. Fetch user email_templates
    const { data: templatesData } = await supabase
      .from('email_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (templatesData) {
      templates = templatesData as EmailTemplateRow[]
    }

    // 3. Fetch user gmail_connections
    const { data: connectionData } = await supabase
      .from('gmail_connections')
      .select('gmail_email, connected_at')
      .eq('user_id', user.id)
      .maybeSingle()

    if (connectionData) {
      gmailStatus = {
        isConnected: true,
        gmailEmail: connectionData.gmail_email,
        connectedAt: connectionData.connected_at,
      }
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header */}
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
            <span className="text-xs font-medium text-foreground">Konfigurasi Email</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Konfigurasi Email & Akun
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Hubungkan akun Gmail pribadi via OAuth 2.0 dan kelola format serta template surat lamaran kerja.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {gmailStatus.isConnected ? (
            <Badge variant="outline" className="text-xs px-2.5 py-1 gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Gmail Terhubung: {gmailStatus.gmailEmail}</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs px-2.5 py-1 gap-1.5 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>Gmail Belum Terhubung</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Gmail OAuth 2.0 Connection Section */}
      <GmailConnectionCard initialStatus={gmailStatus} />

      {/* Main Email Config & Template Manager */}
      <EmailConfigManager
        initialSettings={settings}
        initialTemplates={templates}
      />
    </div>
  )
}
