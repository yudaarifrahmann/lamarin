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
  Clock,
  LifeBuoy,
  Server,
  Cloud,
  FileCheck,
  RefreshCw,
  EyeOff,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Footer } from '@/components/layout/footer'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi (Privacy Policy) - Lamarin',
  description:
    'Kebijakan privasi resmi aplikasi Lamarin. Kepatuhan terhadap Google API Services User Data Policy (Limited Use), keamanan token AES-256-GCM, dan perlindungan Supabase RLS.',
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
                  Privasi &amp; Keamanan
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
            <span>Dokumen Resmi &bull; Perlindungan Data Pribadi &amp; Kepatuhan Google OAuth</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Kebijakan Privasi (Privacy Policy)
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
            Kebijakan Privasi ini menjelaskan bagaimana aplikasi <strong>Lamarin</strong> (&ldquo;kami&rdquo;, &ldquo;layanan&rdquo;) mengumpulkan, menggunakan, menyimpan, memproses, dan melindungi data Anda saat mengakses{' '}
            <span className="font-mono text-xs sm:text-sm text-foreground bg-muted px-1.5 py-0.5 rounded border border-border/60">
              {siteUrl}
            </span>
            . Dokumen ini disusun secara transparan dan sesuai dengan arsitektur teknis yang benar-benar diterapkan di dalam kode aplikasi kami, serta memenuhi persyaratan verifikasi resmi <strong>Google OAuth Brand Verification</strong> dan <strong>Google API Services User Data Policy</strong>.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>Terakhir diperbarui: <strong>{lastUpdated}</strong></span>
            </div>
            <span>&bull;</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Berlaku efektif sejak tanggal pembaruan</span>
            </div>
          </div>
        </div>

        {/* Mandatory Google Limited Use Disclosure Box */}
        <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 sm:p-6 space-y-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-foreground font-bold text-sm sm:text-base">
            <Shield className="h-5 w-5 text-primary shrink-0" />
            <span>Pernyataan Kepatuhan Google API &amp; Limited Use Disclosure</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
            Aplikasi Lamarin menggunakan layanan antarmuka pemrograman aplikasi (API) Google. Sesuai dengan ketentuan resmi Google API:
          </p>
          <blockquote className="border-l-4 border-primary pl-4 py-1 text-xs sm:text-sm font-medium text-foreground bg-muted/40 rounded-r-lg italic">
            &ldquo;Lamarin&apos;s use and transfer to any other app of information received from Google APIs will adhere to{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80 inline-flex items-center gap-1 font-semibold not-italic"
            >
              Google API Services User Data Policy
              <ExternalLink className="h-3 w-3 inline" />
            </a>
            , including the Limited Use requirements.&rdquo;
          </blockquote>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <em>Terjemahan:</em> Penggunaan dan transfer informasi yang diterima dari Google API oleh Lamarin ke aplikasi lain akan sepenuhnya mematuhi <strong>Kebijakan Data Pengguna Layanan Google API</strong>, termasuk seluruh persyaratan <strong>Penggunaan Terbatas (Limited Use)</strong>. Data yang diperoleh dari Google API tidak pernah digunakan untuk melatih model kecerdasan buatan (AI/ML) atau dialihkan ke pihak ketiga selain yang diperlukan untuk penyediaan layanan pengiriman email atas instruksi Anda.
          </p>
        </div>

        {/* 4 Key Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/70 bg-card/70 shadow-2xs">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1">
                <Mail className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-semibold">Izin gmail.send Khusus</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed">
              Hanya digunakan untuk mengirim email lamaran saat Anda menekan tombol kirim. Kami tidak pernah membaca isi inbox Anda.
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
              Refresh token OAuth disimpan dalam bentuk ciphertext terenkripsi di server dengan kunci rahasia tingkat militer.
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/70 shadow-2xs">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1">
                <Database className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-semibold">Supabase RLS &amp; Storage</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed">
              Row-Level Security pada PostgreSQL memastikan data dan dokumen CV di bucket privat hanya bisa diakses oleh akun Anda.
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/70 shadow-2xs">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-1">
                <EyeOff className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-semibold">Tanpa Iklan &amp; Penjualan Data</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed">
              Data Anda tidak pernah dijual, disewakan, atau dibagikan ke broker data maupun platform iklan pihak ketiga.
            </CardContent>
          </Card>
        </div>

        {/* Section 1: Identitas Aplikasi dan Pengelola */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
              1
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Identitas Aplikasi dan Pengelola Lamarin
            </h2>
          </div>
          <div className="pl-8 space-y-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              <strong>Lamarin</strong> (&ldquo;Personal Job Application Mailer&rdquo;) adalah aplikasi web produktivitas personal yang dikembangkan untuk membantu individu/pencari kerja dalam menyusun, mengelola, dan mengirimkan berkas lamaran kerja resmi, portofolio, dan resume kepada pihak perekrut (HRD perusahaan) secara langsung melalui akun Gmail pengguna sendiri.
            </p>
            <p>
              Aplikasi ini beroperasi pada domain resmi: <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">{siteUrl}</code>. Pengelolaan sistem dilakukan secara independen dengan komitmen kepatuhan regulasi perlindungan data pribadi dan standar keamanan cloud modern.
            </p>
          </div>
        </section>

        {/* Section 2: Jenis Data yang Dikumpulkan */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
              2
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Kategori Data yang Dikumpulkan dan Diproses
            </h2>
          </div>
          <div className="pl-8 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Kami hanya memproses data yang benar-benar dibutuhkan untuk pengoperasian aplikasi Lamarin:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                  <UserCheck className="h-4 w-4 text-primary" />
                  <span>Data Profil &amp; Akun Pengguna</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Nama lengkap, alamat email utama yang terdaftar, nomor kontak/telepon (jika Anda cantumkan pada format biodata), serta preferensi identitas pengirim resmi.
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                  <Mail className="h-4 w-4 text-emerald-500" />
                  <span>Informasi Koneksi Gmail</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Alamat email akun Google yang Anda hubungkan untuk pengiriman lamaran (diperoleh melalui scope <code>userinfo.email</code>) dan waktu koneksi dibuat.
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span>Dokumen Lamaran Kerja</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Berkas Curriculum Vitae (CV/Resume), surat lamaran kerja, portofolio, dan sertifikat (format PDF, DOC, DOCX, JPG, PNG berukuran maksimal 10 MB per file) yang Anda unggah secara sukarela ke media penyimpanan privat.
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                  <FileCheck className="h-4 w-4 text-purple-500" />
                  <span>Riwayat Pengiriman (Email Logs)</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Nama perusahaan tujuan, posisi pekerjaan yang dilamar, alamat email HRD penerima, subjek surat, salinan pesan surat yang dikirim, nama dokumen yang dilampirkan, tanggal dan waktu pengiriman (timestamp), status pengiriman (queued, sent, failed), status hasil lamaran (submitted, in_review, interview, accepted, rejected), ID pesan pengiriman dari Google Gmail API, serta log kesalahan teknis jika pengiriman gagal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Google OAuth - Akses & Tujuan */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
              3
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Google OAuth: Data yang Diakses &amp; Tujuan Autentikasi
            </h2>
          </div>
          <div className="pl-8 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Aplikasi Lamarin menggunakan protokol standar industri <strong>OAuth 2.0</strong> untuk mengautentikasi pengguna secara aman tanpa perlu mengetahui atau menyimpan kata sandi akun Google Anda. Google OAuth digunakan dalam dua fungsi yang terpisah secara arsitektur:
            </p>

            <div className="space-y-2.5">
              <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-1">
                <h4 className="font-semibold text-foreground text-xs sm:text-sm">
                  1. Masuk ke Akun Aplikasi (Sign-In with Google)
                </h4>
                <p className="text-xs text-muted-foreground">
                  Dikelola melalui Supabase Auth. Sistem hanya mengakses identitas dasar Anda (alamat email terverifikasi, nama profil, dan avatar profil) untuk memvalidasi sesi masuk Anda dan membuat akun di Lamarin.
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-1">
                <h4 className="font-semibold text-foreground text-xs sm:text-sm">
                  2. Menghubungkan Akun Gmail Pengirim (Gmail Connection)
                </h4>
                <p className="text-xs text-muted-foreground">
                  Dikelola secara independen di menu <em>Konfigurasi Email</em>. Sistem meminta otorisasi scope <code>https://www.googleapis.com/auth/userinfo.email</code> untuk memverifikasi alamat email pengirim dan <code>https://www.googleapis.com/auth/gmail.send</code> untuk mengirimkan email lamaran atas nama Anda.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 text-xs text-muted-foreground space-y-1">
              <strong className="text-foreground flex items-center gap-1.5 font-semibold">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Batasan Tegas Akses Google OAuth:
              </strong>
              <p>
                Lamarin <strong>TIDAK PERNAH</strong> meminta izin membaca email (<code>gmail.readonly</code>), tidak meminta izin mengubah kontak, dan tidak meminta akses ke Google Drive Anda. Kami sama sekali tidak memiliki kemampuan teknis untuk membaca atau memindai email pribadi yang masuk ke kotak masuk Anda.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Gmail API - Izin gmail.send */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
              4
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Gmail API: Penggunaan Izin <code className="font-mono text-xs">gmail.send</code>
            </h2>
          </div>
          <div className="pl-8 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Izin <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">https://www.googleapis.com/auth/gmail.send</code> digunakan secara spesifik dan ketat dengan ketentuan sebagai berikut:
            </p>
            <ul className="space-y-2 list-disc list-outside pl-4">
              <li>
                <strong className="text-foreground">Hanya Atas Tindakan Pengguna:</strong> Email hanya dikirim melalui endpoint resmi <code>gmailClient.users.messages.send</code> ketika Anda secara sadar mengisi formulir pengiriman lamaran (atau memilih template surat) dan secara aktif menekan tombol &ldquo;Kirim Lamaran Sekarang&rdquo;.
              </li>
              <li>
                <strong className="text-foreground">Tanpa Otomasi Liar:</strong> Tidak ada proses pengiriman otomatis massal tanpa izin, tidak ada background blast liar, dan tidak ada email yang dikirim tanpa persetujuan eksplisit Anda pada setiap lamaran.
              </li>
              <li>
                <strong className="text-foreground">Penyusunan Format Standar:</strong> Sistem merakit pesan dalam format MIME standar RFC 2822 / RFC 2045 di sisi server, menyertakan lampiran berkas CV/resume yang Anda pilih, dan mengirimkannya ke alamat email HRD tujuan.
              </li>
              <li>
                <strong className="text-foreground">Transparansi Penuh pada Kotak Surat Anda:</strong> Karena email dikirimkan menggunakan akun Gmail Anda sendiri, setiap email lamaran yang terkirim akan otomatis muncul di folder <em>Sent (Terkirim)</em> akun Gmail Anda, sehingga Anda memiliki rekam jejak independen di Google.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 5: Token OAuth - Penyimpanan Terenkripsi */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
              5
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Token OAuth: Enkripsi AES-256-GCM &amp; Penggunaannya
            </h2>
          </div>
          <div className="pl-8 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Saat Anda menyetujui koneksi Gmail di layar persetujuan Google, Google menerbitkan <em>refresh token</em> offline. Mekanisme pengamanan token yang kami terapkan:
            </p>
            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-foreground font-semibold text-xs sm:text-sm">
                <KeyRound className="h-4 w-4 text-emerald-500" />
                <span>Enkripsi Standar Militer AES-256-GCM</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sebelum disimpan ke tabel <code>gmail_connections</code> di database, token mentah dienkripsi menggunakan algoritma simetris <strong>AES-256-GCM</strong> (Galois/Counter Mode) dengan vektor inisialisasi (IV) 96-bit acak dan tag autentikasi 128-bit. Kunci enkripsi 256-bit disimpan secara rahasia di environment server (<code>GMAIL_TOKEN_ENCRYPTION_KEY</code>).
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-outside pl-4">
                <li>Token tidak pernah disimpan dalam format teks polos (plain text).</li>
                <li>Token terenkripsi tidak pernah dikirimkan atau diekspos ke peramban (browser) frontend pengguna.</li>
                <li>Tujuan penyimpanan token: Hanya untuk memperbarui <em>access token</em> berdurasi singkat di server saat Anda mengirimkan lamaran kerja.</li>
                <li>Alur pertukaran kode OAuth dilindungi dari serangan Cross-Site Request Forgery (CSRF) menggunakan parameter <code>state</code> unik yang divalidasi via secure httpOnly cookie.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 6: Supabase - Auth, PostgreSQL, Storage */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
              6
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Infrastruktur Supabase: Auth, PostgreSQL, &amp; Storage
            </h2>
          </div>
          <div className="pl-8 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Seluruh lapisan data Lamarin dikelola menggunakan infrastruktur komputasi awan <strong>Supabase</strong> yang berstandar enterprise:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Supabase Auth</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Mengelola otentikasi identitas, manajemen sesi berbasis JWT dengan cookie <code>httpOnly</code> yang aman, pendaftaran email, dan pengiriman kode verifikasi OTP 6 digit.
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                  <Database className="h-4 w-4 text-blue-500" />
                  <span>PostgreSQL + RLS</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Menyimpan profil, template surat, dan log pengiriman. Setiap tabel dilindungi oleh <strong>Row-Level Security (RLS)</strong> bawaan PostgreSQL (<code>auth.uid() = user_id</code>), sehingga data Anda terisolasi secara kriptografis dan tidak bisa diakses pengguna lain.
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                  <Cloud className="h-4 w-4 text-purple-500" />
                  <span>Supabase Storage Privat</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dokumen CV dan portofolio disimpan dalam bucket privat <code>application-documents</code> dalam direktori unik berbasis ID pengguna. Pratinjau dokumen hanya dapat dibuka melalui <em>short-lived signed URL</em> sementara, bukan URL publik terbuka.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Penggunaan Data (Tabel Tujuan) */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
              7
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Tujuan Pengolahan Setiap Kategori Data
            </h2>
          </div>
          <div className="pl-8 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Berikut adalah transparansi pemetaan tujuan pengolahan data pengguna:
            </p>
            <div className="overflow-x-auto rounded-xl border border-border/80">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/80 bg-muted/40 font-semibold text-foreground">
                    <th className="p-3">Kategori Data</th>
                    <th className="p-3">Data Spesifik</th>
                    <th className="p-3">Tujuan Pengolahan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td className="p-3 font-medium text-foreground">Akun &amp; Profil</td>
                    <td className="p-3">Nama, email, password hash / OAuth ID, nomor kontak</td>
                    <td className="p-3">Autentikasi akun, identitas pengirim pada surat lamaran, dan komunikasi sistem.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-foreground">Koneksi Gmail</td>
                    <td className="p-3">Alamat Gmail pengirim, refresh token terenkripsi</td>
                    <td className="p-3">Otorisasi transmisi pengiriman email lamaran resmi melalui Google Gmail API.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-foreground">Dokumen Lamaran</td>
                    <td className="p-3">File PDF/DOC CV, resume, portofolio, sertifikat</td>
                    <td className="p-3">Disimpan di storage privat dan dilampirkan ke email lamaran saat dikirim ke HRD.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-foreground">Riwayat Lamaran</td>
                    <td className="p-3">Nama perusahaan, email HRD, posisi, subjek, log status</td>
                    <td className="p-3">Memberikan dashboard pencatatan dan pelacakan lamaran kerja bagi pengguna.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 8: Pembagian Data & Layanan Pihak Ketiga */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
              8
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Pembagian Data &amp; Layanan Pihak Ketiga (Subprosesor)
            </h2>
          </div>
          <div className="pl-8 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Lamarin hanya membagikan data kepada pihak ketiga berlisensi resmi yang bertindak sebagai penyedia infrastruktur teknis (subprosesor) demi menjalankan layanan:
            </p>
            <ul className="space-y-2 list-disc list-outside pl-4">
              <li>
                <strong className="text-foreground">Google LLC (Amerika Serikat):</strong> Menyediakan layanan Google OAuth untuk autentikasi dan Google Gmail API untuk pengiriman email lamaran kerja.
              </li>
              <li>
                <strong className="text-foreground">Supabase Inc. (Amerika Serikat / Global):</strong> Menyediakan backend PostgreSQL database terisolasi, autentikasi sesi, dan penyimpanan cloud terenkripsi untuk dokumen.
              </li>
              <li>
                <strong className="text-foreground">Vercel Inc. (Amerika Serikat / Global):</strong> Menyediakan infrastruktur komputasi edge dan serverless untuk menjalankan aplikasi web Next.js secara aman melalui jaringan HTTPS.
              </li>
              <li>
                <strong className="text-foreground">Google Gemini API (Opsional):</strong> Digunakan hanya jika pengguna memilih fitur <em>AI Vision Layout Analysis</em> untuk memindai gambar template surat lamaran. Data gambar hanya diproses secara sementara (ephemeral) untuk mengekstrak struktur tata letak blok visual dan tidak disimpan secara permanen atau digunakan untuk melatih model AI.
              </li>
            </ul>

            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-1.5 text-xs text-muted-foreground">
              <strong className="text-foreground flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Larangan Tegas Penjualan Data &amp; Iklan:
              </strong>
              <p>
                Kami <strong>TIDAK PERNAH</strong> menjual, menyewakan, meminjamkan, atau memperdagangkan data pribadi pengguna kepada pihak ketiga mana pun. Data Anda tidak pernah digunakan untuk tujuan pembuatan profil periklanan, penargetan iklan komersial, atau analitik pelacak lintas platform (cross-site trackers).
              </p>
            </div>
          </div>
        </section>

        {/* Section 9: Keamanan Data */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
              9
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Langkah Perlindungan Keamanan yang Benar-Benar Diterapkan
            </h2>
          </div>
          <div className="pl-8 space-y-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Kami hanya mencantumkan langkah keamanan yang benar-benar aktif diimplementasikan dalam kode sumber Lamarin:
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Enkripsi Data In-Transit (TLS 1.3 / HTTPS):</strong> Seluruh data yang ditransmisikan antara browser, server Vercel, Supabase, dan Google API dienkripsi melalui protokol SSL/TLS modern.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Enkripsi Data At-Rest:</strong> Refresh token dienkripsi secara independen dengan AES-256-GCM sebelum masuk ke database. Seluruh database PostgreSQL dan storage Supabase juga dienkripsi pada level disk/infrastruktur.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Row-Level Security (RLS) PostgreSQL:</strong> Isolasi ketat pada level mesin basis data yang secara matematis mencegah satu pengguna membaca atau memodifikasi data milik pengguna lain.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Mitigasi XSS &amp; CSRF:</strong> Cookie otentikasi disetel dengan flag <code>httpOnly</code>, <code>secure</code>, dan <code>sameSite=lax</code>. Alur OAuth divalidasi dengan token <code>state</code> acak.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Pratinjau Dokumen Berizin:</strong> Dokumen privat tidak pernah dibuka via URL publik permanen, melainkan menggunakan URL bertanda tangan (signed URL) sementara yang kedaluwarsa secara otomatis.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 10: Retensi Data */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
              10
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Retensi, Penyimpanan, &amp; Penghapusan Data
            </h2>
          </div>
          <div className="pl-8 space-y-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Data Anda disimpan hanya selama akun Anda berstatus aktif atau sampai Anda memutuskan untuk menghapusnya:
            </p>
            <ul className="space-y-1.5 list-disc list-outside pl-4">
              <li>
                <strong>Dokumen:</strong> Berkas CV/resume disimpan di Supabase Storage sampai Anda memilih untuk menghapusnya melalui antarmuka <em>Manajemen Dokumen</em>.
              </li>
              <li>
                <strong>Koneksi Gmail:</strong> Token OAuth disimpan sampai Anda menekan tombol <em>Putuskan Sambungan</em> di menu <em>Konfigurasi Email</em> atau mencabut izin di akun Google Anda.
              </li>
              <li>
                <strong>Riwayat Lamaran:</strong> Log pengiriman disimpan agar Anda dapat memantau status lamaran kerja Anda dan dapat dihapus sesuai permintaan.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 11: Hak Pengguna & Prosedur Permintaan */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
              11
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Hak Pengguna: Akses, Koreksi, &amp; Prosedur Penghapusan Data
            </h2>
          </div>
          <div className="pl-8 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Anda memiliki kendali penuh atas informasi pribadi Anda di Lamarin:
            </p>

            <div className="space-y-3">
              <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-1.5">
                <h4 className="font-semibold text-foreground text-xs sm:text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>1. Hak Akses dan Koreksi Mandiri</span>
                </h4>
                <p className="text-xs">
                  Anda dapat melihat riwayat pengiriman lamaran, mengunduh salinan berkas yang tersimpan, mengedit template surat, dan memperbarui identitas profil kapan saja langsung melalui menu navigasi aplikasi.
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-1.5">
                <h4 className="font-semibold text-foreground text-xs sm:text-sm flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-rose-500" />
                  <span>2. Penghapusan Mandiri Seketika</span>
                </h4>
                <ul className="space-y-1 text-xs list-disc list-outside pl-4">
                  <li>
                    <strong>Hapus Berkas Dokumen:</strong> Buka menu <em>Manajemen Dokumen</em> &rarr; klik ikon hapus pada berkas terkait. Berkas akan seketika terhapus dari Supabase Storage dan PostgreSQL.
                  </li>
                  <li>
                    <strong>Putuskan Sambungan Gmail:</strong> Buka menu <em>Konfigurasi Email</em> &rarr; klik <em>Putuskan Sambungan</em>. Baris token terenkripsi akan dihapus seketika dari database.
                  </li>
                  <li>
                    <strong>Cabut Akses Google Secara Langsung:</strong> Anda dapat membatalkan otorisasi aplikasi Lamarin kapan saja melalui halaman resmi Google:{' '}
                    <a
                      href="https://myaccount.google.com/permissions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 inline-flex items-center gap-1"
                    >
                      https://myaccount.google.com/permissions
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-1.5">
                <h4 className="font-semibold text-foreground text-xs sm:text-sm flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-emerald-500" />
                  <span>3. Prosedur Permintaan Penghapusan Akun Total (Right to Erasure)</span>
                </h4>
                <p className="text-xs">
                  Untuk mengajukan penghapusan total akun beserta seluruh rekam jejak, riwayat log lamaran, profil, dan dokumen yang tersimpan:
                </p>
                <ol className="text-xs list-decimal list-outside pl-4 space-y-1">
                  <li>Kirimkan email permohonan ke alamat email kontak pengelola resmi yang tertera di Bagian 12.</li>
                  <li>Gunakan subjek email: <code>Permohonan Penghapusan Akun Lamarin - [Email Anda]</code>.</li>
                  <li>Tim pengelola akan memverifikasi kepemilikan akun dan melakukan penghapusan permanen seluruh baris data serta berkas storage dalam waktu maksimal <strong>7 (tujuh) hari kerja</strong>. Anda akan menerima email konfirmasi setelah proses selesai.</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Section 12: Kontak Pengelola */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
              12
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Kontak Pengelola untuk Pertanyaan Privasi
            </h2>
          </div>
          <div className="pl-8 space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini, pelaksanaan hak perlindungan data Anda, atau permohonan penghapusan akun, silakan hubungi pengelola resmi Lamarin:
            </p>

            <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-semibold">
                    Email Kontak Resmi Privasi:
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
                    Alamat Website Resmi Aplikasi:
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
                  Waktu respons resmi: Kami menanggapi seluruh pertanyaan dan permohonan privasi dalam 1&ndash;3 hari kerja.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 13: Perubahan Kebijakan */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
              13
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Pembaruan Kebijakan Privasi
            </h2>
          </div>
          <div className="pl-8 space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu untuk mencerminkan peningkatan fitur, perubahan regulasi perlindungan data yang berlaku, atau pembaruan kebijakan penyedia pihak ketiga seperti Google API. Setiap pembaruan akan langsung dipublikasikan pada halaman ini dengan mencantumkan tanggal revisi terbaru di bagian atas.
            </p>
          </div>
        </section>

        {/* Bottom CTA Box */}
        <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-muted/40 via-card to-muted/40 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-2xs">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              Kembali ke Aplikasi Lamarin
            </h3>
            <p className="text-xs text-muted-foreground max-w-md">
              Kirimkan lamaran kerja resmi Anda dengan aman, terenkripsi, dan terorganisir langsung dari akun Gmail pribadi Anda.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs sm:text-sm hover:opacity-95 transition-opacity shadow-xs shrink-0"
          >
            <Send className="h-4 w-4" />
            <span>Masuk ke Dashboard</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
