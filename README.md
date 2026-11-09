# Lamarin — Personal Job Application Mailer

**Lamarin** adalah aplikasi web pribadi modern untuk mengirimkan email lamaran kerja resmi secara otomatis ke HRD perusahaan langsung melalui **Google Gmail API (OAuth 2.0)** menggunakan akun Gmail pribadi utama Anda, lengkap dengan dokumen portofolio dan resume yang tersimpan aman di database dan storage pribadi.

Dibangun dengan standar keamanan ketat, tanpa data dummy, menggunakan arsitektur server-side yang melindungi seluruh kredensial sensitif.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 & shadcn/ui (Base UI primitives)
- **Icons**: Lucide Icons
- **Theme**: Light & Dark mode (next-themes)
- **Database & Auth**: Supabase PostgreSQL dengan Row Level Security (RLS) & Supabase SSR Auth
- **File Storage**: Private Supabase Storage bucket (`application-documents`)
- **Email Engine**: Google Gmail API v1 (OAuth 2.0 with `gmail.send` scope)
- **Deployment**: Vercel

---

## Modul Utama

1. **Dashboard (`/`)**
   - Statistik riil: Total lamaran terkirim, email berhasil, email gagal, dan total dokumen tersimpan.
   - Grafik aktivitas pengiriman berdasarkan tanggal (14 hari terakhir).
   - Aktivitas pengiriman terkini dan daftar perusahaan terakhir dilamar.
   - Akses cepat ke pengiriman lamaran dan manajemen berkas.

2. **Kirim Lamaran (`/kirim-lamaran`)**
   - Validasi format email penerima dan nama perusahaan.
   - Placeholder dinamis `{company_name}` dan `{sender_name}` otomatis terisi.
   - Pilihan lampiran dokumen dari database Supabase (checkbox individual / pilih semua).
   - Live preview pesan sebelum dikirim dan dialog konfirmasi pengiriman.
   - Pengiriman langsung via Google Gmail API OAuth 2.0 (email otomatis tersimpan di folder *Sent/Terkirim* akun Gmail Anda).

3. **Manajemen Dokumen (`/manajemen-dokumen`)**
   - Upload dokumen berformat PDF dan dokumen pendukung.
   - Validasi MIME type dan batasan ukuran berkas di server.
   - Ganti nama dokumen kapan saja.
   - Hapus dokumen secara menyeluruh (database record dan file fisik di storage).
   - Pratinjau aman melalui Signed URL (berlaku 60 detik tanpa URL publik permanen).

4. **Konfigurasi Email (`/konfigurasi-email`)**
   - Identitas pengirim (nama pengirim dan email balasan resmi).
   - Subjek default dan pesan pembuka default multiline.
   - Manajemen template surat lamaran tambahan (CRUD) dengan penanda template utama (*default*).
   - Pratinjau langsung penggantian placeholder.

5. **Riwayat Lamaran (`/riwayat-lamaran`)**
   - Catatan seluruh log pengiriman (`email_logs`).
   - Pencarian berdasarkan nama perusahaan atau email penerima.
   - Penyaringan status (Terkirim, Diproses, Diterima, Gagal).
   - Penyaringan berdasarkan rentang tanggal dan pagination.
   - Modal detail lengkap: isi surat, snapshot lampiran yang dikirimkan, ID pesan Gmail, dan pesan error jika gagal.

---

## Keamanan & Kepatuhan Data

- **Otorisasi Gmail OAuth 2.0**: Menggunakan `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, dan `GMAIL_REFRESH_TOKEN` pada environment server-side. Token tidak pernah dikirim atau terekspos ke browser.
- **Tanpa Pendaftaran Publik**: Akun pengelola dibuat secara manual melalui Supabase Auth Dashboard untuk memastikan hanya pemilik sah yang memiliki akses.
- **Proteksi Rute Ganda**: Seluruh halaman dashboard diproteksi oleh middleware proxy (`src/proxy.ts`) dan verifikasi sesi server di layout dashboard (`src/app/(dashboard)/layout.tsx`).
- **Row Level Security (RLS)**: Seluruh tabel PostgreSQL dan Supabase Storage dilindungi RLS berbasis `auth.uid() = user_id`.
- **Storage Privat**: File CV dan dokumen disimpan dalam bucket privat `application-documents` dan diakses hanya lewat temporary signed URL atau buffer server.

---

## Panduan Instalasi Lokal

1. **Clone repository dan install dependensi**:
   ```bash
   git clone <repository-url>
   cd lamarin
   npm install
   ```

2. **Atur Environment Variables**:
   Salin file `.env.example` ke `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Isi nilai kredensial Supabase dan Google Gmail API OAuth 2.0 Anda.

3. **Jalankan Database Migration**:
   Jalankan file SQL di `supabase/migrations/20261109000000_create_job_application_mailer_schema.sql` pada menu **SQL Editor** Supabase Dashboard Anda.

4. **Jalankan development server**:
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## Panduan Deployment ke Vercel

Untuk panduan lengkap deployment ke production di Vercel beserta cara mendapatkan OAuth Client ID dan Refresh Token dari Google Cloud Console:
**[Panduan Lengkap Deployment Production (DEPLOYMENT.md)](./DEPLOYMENT.md)**

---

## Lisensi

Proyek pribadi dikembangkan untuk keperluan otomasi pengiriman lamaran kerja.
