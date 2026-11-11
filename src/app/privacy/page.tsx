import * as React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Shield,
  Lock,
  Mail,
  Database,
  KeyRound,
  Trash2,
  UserCheck,
  FileText,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  ArrowLeft,
  Send,
  Sparkles,
  Clock,
  LifeBuoy,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Footer } from '@/components/layout/footer'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi - Lamarin',
  description:
    'Kebijakan privasi, transparansi penggunaan data, integrasi Google OAuth & Gmail API, serta komitmen keamanan data pengguna aplikasi Lamarin.',
}

export default function PrivacyPolicyPage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lamarin-two.vercel.app'
  const lastUpdated = '11 November 2026'

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Top Header / Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90 group"
          >
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-xs group-hover:scale-105 transition-transform">
              <Send className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-foreground">
                  lamarin
                </span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                  Privasi
                </Badge>
              </div>
              <span className="text-[10px] text-muted-foreground hidden sm:inline">
                Personal Job Application Mailer
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border/80 bg-background hover:bg-muted transition-colors shadow-2xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Masuk / Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Hero Section */}
        <div className="space-y-4 border-b border-border/60 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
            <Shield className="h-3.5 w-3.5" />
            <span>Dokumen Resmi &bull; Perlindungan Data Pribadi</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Kebijakan Privasi (Privacy Policy)
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
            Kebijakan Privasi ini menjelaskan bagaimana <strong>Lamarin</strong> (&ldquo;kami&rdquo;, &ldquo;aplikasi&rdquo;) mengumpulkan, memproses, menyimpan, dan melindungi data pribadi Anda saat menggunakan layanan kami di{' '}
            <span className="font-mono text-xs sm:text-sm text-foreground bg-muted px-1.5 py-0.5 rounded border border-border/60">
              {siteUrl}
            </span>
            . Kami berkomitmen penuh untuk menjunjung tinggi transparansi, keamanan data, dan kepatuhan terhadap regulasi perlindungan data serta kebijakan resmi Google API.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>Terakhir diperbarui: <strong>{lastUpdated}</strong></span>
            </div>
            <span>&bull;</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Berlaku untuk seluruh pengguna aplikasi Lamarin</span>
            </div>
          </div>
        </div>

        {/* Highlight Cards (Key Commitments) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/70 bg-card/70 shadow-2xs">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1">
                <Shield className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-semibold">Google OAuth &amp; Gmail</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed">
              Kirim email hanya atas instruksi dan persetujuan eksplisit Anda. Tidak pernah membaca atau memindai email pribadi.
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/70 shadow-2xs">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1">
                <Lock className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-semibold">Enkripsi AES-256-GCM</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed">
              Token OAuth disimpan dalam bentuk ciphertext terenkripsi di server. Tidak tersimpan dalam teks mentah.
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/70 shadow-2xs">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1">
                <Database className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-semibold">Supabase RLS</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed">
              Row-Level Security pada PostgreSQL memastikan data dan berkas Anda terisolasi dan hanya dapat diakses oleh Anda.
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/70 shadow-2xs">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-1">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-semibold">Bebas Iklan &amp; Komersialisasi</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed">
              Data Anda tidak pernah dijual, disewakan, dibagikan ke broker data, atau dipakai untuk target iklan apa pun.
            </CardContent>
          </Card>
        </div>

        {/* Section 1: Pendahuluan & Lingkup Layanan */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
              1
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Pendahuluan &amp; Lingkup Layanan
            </h2>
          </div>
          <div className="pl-8 space-y-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Lamarin adalah aplikasi produktivitas personal yang dirancang untuk mempermudah para pencari kerja dalam mengirimkan berkas lamaran kerja resmi, portofolio, dan resume ke pihak perekrut (HRD perusahaan) secara terorganisir, langsung melalui akun email pengguna sendiri via integrasi resmi Google Gmail API.
            </p>
            <p>
              Dengan mengakses dan menggunakan aplikasi Lamarin di <span className="font-mono text-xs">{siteUrl}</span>, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan pengolahan data yang tercantum dalam Kebijakan Privasi ini. Jika Anda tidak menyetujui ketentuan ini, Anda disarankan untuk tidak menggunakan layanan ini.
            </p>
          </div>
        </section>

        {/* Section 2: Data yang Diproses */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
              2
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Data Pribadi yang Kami Kumpulkan dan Proses
            </h2>
          </div>
          <div className="pl-8 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Untuk menjalankan fungsi otomasi lamaran kerja dengan baik, kami hanya memproses data yang secara sukarela dan sadar Anda berikan, meliputi:
            </p>
            <ul className="space-y-2 list-disc list-outside pl-4">
              <li>
                <strong className="text-foreground">Informasi Akun &amp; Profil:</strong> Nama lengkap, alamat email utama, nomor telepon/WhatsApp, dan informasi kontak singkat yang Anda simpan pada konfigurasi profil atau format biodata template surat.
              </li>
              <li>
                <strong className="text-foreground">Alamat Akun Gmail Terhubung:</strong> Alamat email Google resmi Anda yang diberikan saat mengaitkan akun melalui otorisasi OAuth 2.0 untuk keperluan pengiriman email lamaran.
              </li>
              <li>
                <strong className="text-foreground">Dokumen Lamaran Kerja:</strong> Dokumen berkas Curriculum Vitae (CV/Resume), portofolio, sertifikat keahlian, atau surat lamaran dalam format dokumen (seperti PDF) yang Anda unggah ke menu Manajemen Dokumen.
              </li>
              <li>
                <strong className="text-foreground">Riwayat Pengiriman (Email Logs):</strong> Catatan pengiriman surat mencakup nama perusahaan yang dituju, alamat email HRD penerima, subjek email, tanggal dan waktu pengiriman, salinan pesan/surat lamaran yang dikirimkan, ID pesan pengiriman dari Gmail API (Message ID), serta status keberhasilan atau pesan galat teknis apabila pengiriman gagal.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3: Integrasi Google OAuth & Gmail API */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
              3
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Penggunaan Google OAuth 2.0 &amp; Gmail API
            </h2>
          </div>
          <div className="pl-8 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Lamarin memanfaatkan layanan antarmuka pemrograman aplikasi (API) resmi dari Google dengan ketentuan sebagai berikut:
            </p>

            <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-foreground font-semibold text-xs sm:text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span>Scope Izin Gmail: <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">https://www.googleapis.com/auth/gmail.send</code></span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Scope izin ini digunakan <strong>hanya dan secara eksklusif</strong> untuk mengirimkan email pesan lamaran kerja beserta lampiran dokumen ke alamat email penerima atas perintah langsung dan penekanan tombol &ldquo;Kirim Lamaran&rdquo; oleh Anda.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-foreground text-xs sm:text-sm">
                Batasan Tegas Penggunaan Gmail API:
              </h3>
              <ul className="space-y-1.5 list-disc list-outside pl-4">
                <li>
                  <strong>Tidak Membaca Kotak Masuk:</strong> Lamarin tidak membaca, memindai, menyaring, atau memproses isi email masuk pribadi Anda.
                </li>
                <li>
                  <strong>Tidak Mengubah atau Menghapus Pesan:</strong> Lamarin tidak memiliki izin dan tidak dapat menghapus, memodifikasi, atau memindahkan email apa pun di akun Gmail Anda.
                </li>
                <li>
                  <strong>Tidak Mengirimkan Email Otomatis Tanpa Izin:</strong> Setiap email yang dikirimkan melalui sistem selalu melalui input aktif dan persetujuan langsung pengguna pada formulir pengiriman.
                </li>
              </ul>
            </div>

            {/* Google Limited Use Compliance Notice */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-foreground font-semibold text-xs sm:text-sm">
                <Shield className="h-4 w-4 text-primary" />
                <span>Kepatuhan Kebijakan Data Pengguna Google (Google Limited Use Disclosure)</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Penggunaan dan transfer informasi yang diterima dari Google API oleh Lamarin ke aplikasi lain akan sepenuhnya mematuhi{' '}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 inline-flex items-center gap-1"
                >
                  Kebijakan Data Pengguna Layanan Google API (Google API Services User Data Policy)
                  <ExternalLink className="h-3 w-3" />
                </a>
                , termasuk klausul persyaratan <strong>Penggunaan Terbatas (Limited Use requirements)</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Enkripsi Token & Keamanan Penyimpanan */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
              4
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Penyimpanan Data &amp; Standar Enkripsi
            </h2>
          </div>
          <div className="pl-8 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Keamanan data pengguna merupakan prioritas utama arsitektur Lamarin. Kami menerapkan langkah-langkah proteksi tingkat lanjut:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                  <KeyRound className="h-4 w-4 text-emerald-500" />
                  <span>Enkripsi Token OAuth (AES-256-GCM)</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Refresh token dan access token Google OAuth disimpan di database dalam bentuk cipher teks terenkripsi menggunakan algoritma simetris <strong>AES-256-GCM</strong> dengan kunci rahasia tingkat server. Token tidak pernah disimpan dalam format teks mentah (plain text) dan tidak pernah dikirimkan ke peramban (browser) pengguna.
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                  <Database className="h-4 w-4 text-blue-500" />
                  <span>Supabase PostgreSQL &amp; Storage</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Infrastruktur database dan penyimpanan dokumen dikelola melalui <strong>Supabase</strong> dengan implementasi <strong>Row-Level Security (RLS)</strong>. Kebijakan ini secara matematis mengisolasi akses data antar-pengguna, sehingga tidak ada pengguna lain yang dapat melihat, mengubah, atau mengunduh data Anda.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Tanpa Penjualan Data & Tanpa Iklan */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
              5
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Prinsip Tanpa Penjualan Data &amp; Bebas Iklan
            </h2>
          </div>
          <div className="pl-8 space-y-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-foreground font-semibold text-xs sm:text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Komitmen Non-Komersialisasi Data Pribadi</span>
              </div>
              <ul className="space-y-1.5 list-disc list-outside pl-4 text-xs text-muted-foreground">
                <li>
                  Kami <strong>tidak pernah menjual, menyewakan, meminjamkan, atau memperdagangkan</strong> data pribadi, riwayat lamaran, atau dokumen pengguna kepada pihak ketiga mana pun.
                </li>
                <li>
                  Data Anda <strong>tidak pernah digunakan</strong> untuk tujuan pembuatan profil periklanan, pemasaran pihak ketiga, atau pelacakan lintas situs (cross-site tracking).
                </li>
                <li>
                  Aplikasi Lamarin <strong>tidak memuat</strong> iklan pihak ketiga, skrip pelacak pemasaran, atau broker data periklanan.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 6: Hak Pengguna & Mekanisme Penghapusan Data */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
              6
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Hak Pengguna &amp; Mekanisme Penghapusan Data (Right to Erasure)
            </h2>
          </div>
          <div className="pl-8 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Anda memiliki kendali penuh atas data pribadi Anda dalam sistem Lamarin:
            </p>

            <div className="space-y-3">
              <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-1.5">
                <h4 className="font-semibold text-foreground text-xs sm:text-sm flex items-center gap-2">
                  <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                  <span>1. Penghapusan Mandiri Melalui Aplikasi</span>
                </h4>
                <ul className="space-y-1 text-xs list-disc list-outside pl-4">
                  <li>
                    <strong>Dokumen:</strong> Anda dapat menghapus berkas CV atau portofolio kapan saja melalui halaman <em>Manajemen Dokumen</em>. Berkas akan seketika terhapus dari Supabase Storage.
                  </li>
                  <li>
                    <strong>Template:</strong> Anda dapat mengedit atau menghapus template email yang tersimpan kapan saja melalui halaman <em>Konfigurasi Email</em>.
                  </li>
                  <li>
                    <strong>Pemutusan Koneksi Gmail:</strong> Anda dapat memutuskan sambungan akun Gmail kapan saja melalui tombol <em>Putuskan Sambungan</em> di halaman <em>Konfigurasi Email</em>. Tindakan ini akan menghapus token OAuth dari database seketika.
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-1.5">
                <h4 className="font-semibold text-foreground text-xs sm:text-sm flex items-center gap-2">
                  <KeyRound className="h-3.5 w-3.5 text-amber-500" />
                  <span>2. Pencabutan Izin Melalui Akun Google</span>
                </h4>
                <p className="text-xs">
                  Anda dapat mencabut izin akses aplikasi Lamarin secara langsung dan seketika dari dashboard keamanan Google Anda di:{' '}
                  <a
                    href="https://myaccount.google.com/permissions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 inline-flex items-center gap-1"
                  >
                    https://myaccount.google.com/permissions
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  . Setelah izin dicabut, Lamarin tidak akan lagi dapat mengirimkan email apa pun atas nama Anda.
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-1.5">
                <h4 className="font-semibold text-foreground text-xs sm:text-sm flex items-center gap-2">
                  <UserCheck className="h-3.5 w-3.5 text-primary" />
                  <span>3. Permintaan Penghapusan Akun &amp; Seluruh Data (Data Deletion Request)</span>
                </h4>
                <p className="text-xs">
                  Apabila Anda ingin menghapus seluruh akun Anda secara permanen beserta seluruh riwayat lamaran, log pengiriman, dan berkas terkait dari database kami, Anda dapat mengajukan permintaan penghapusan data dengan menghubungi kontak pengelola yang tertera di bawah ini. Tim kami akan memproses dan menghapus seluruh data Anda dari sistem produksi dan cadangan dalam waktu maksimal <strong>7 (tujuh) hari kerja</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Kontak Pengelola */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
              7
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Kontak Pengelola &amp; Layanan Bantuan
            </h2>
          </div>
          <div className="pl-8 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Jika Anda memiliki pertanyaan, keluhan, masukan, atau ingin mengajukan permohonan hak atas data pribadi Anda (termasuk permintaan penghapusan akun), silakan hubungi pengelola resmi Lamarin:
            </p>

            <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold">
                    Email Kontak Pengelola:
                  </span>
                  {contactEmail ? (
                    <a
                      href={`mailto:${contactEmail}`}
                      className="font-mono text-xs sm:text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1.5"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      <span>{contactEmail}</span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 text-foreground font-mono text-xs bg-muted/60 p-2 rounded border border-border/60">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>[Email Pengelola: Konfigurasi NEXT_PUBLIC_CONTACT_EMAIL di Vercel / Repositori Pengembang]</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold">
                    Alamat Website Resmi:
                  </span>
                  <a
                    href={siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs sm:text-sm text-foreground hover:text-primary hover:underline inline-flex items-center gap-1.5"
                  >
                    <span>{siteUrl}</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground flex items-center gap-2">
                <LifeBuoy className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>
                  Permintaan penghapusan data atau pertanyaan terkait privasi akan ditanggapi dalam waktu 1&ndash;3 hari kerja.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 8: Perubahan Kebijakan Privasi */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
              8
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Pembaruan Kebijakan Privasi
            </h2>
          </div>
          <div className="pl-8 space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu guna menyesuaikan dengan perubahan operasional teknis, regulasi hukum yang berlaku, atau penyesuaian kebijakan pihak ketiga (seperti Google API). Setiap pembaruan akan dipublikasikan pada halaman ini dengan mencantumkan tanggal pembaruan terbaru di bagian atas.
            </p>
          </div>
        </section>

        {/* Bottom CTA Box */}
        <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-muted/40 via-card to-muted/40 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-2xs">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              Siap Mengirimkan Lamaran Impian Anda?
            </h3>
            <p className="text-xs text-muted-foreground max-w-md">
              Gunakan Lamarin untuk mengirimkan lamaran kerja resmi dengan aman, cepat, dan terorganisir langsung dari akun Gmail Anda.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs sm:text-sm hover:opacity-95 transition-opacity shadow-xs shrink-0"
          >
            <Send className="h-4 w-4" />
            <span>Masuk ke Aplikasi</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

