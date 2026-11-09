# Panduan Instalasi dan Deployment Production (Vercel, Supabase & Gmail OAuth 2.0)

Dokumen ini berisi panduan lengkap langkah demi langkah untuk mengonfigurasi dan melakukan deployment aplikasi **Lamarin (Personal Job Application Mailer)** ke **Vercel** dengan backend **Supabase** dan integrasi **Google Gmail API (OAuth 2.0)** langsung melalui tombol *Hubungkan Gmail*.

---

## Daftar Isi
1. [Prasyarat](#1-prasyarat)
2. [Langkah 1: Membuat Project Supabase](#2-langkah-1-membuat-project-supabase)
3. [Langkah 2: Menjalankan SQL Migration (Termasuk Tabel gmail_connections)](#3-langkah-2-menjalankan-sql-migration-termasuk-tabel-gmail_connections)
4. [Langkah 3: Konfigurasi Private Storage Bucket](#4-langkah-3-konfigurasi-private-storage-bucket)
5. [Langkah 4: Membuat Akun Pertama (Owner)](#5-langkah-4-membuat-akun-pertama-owner)
6. [Langkah 5: Konfigurasi Google Cloud Console & Gmail API OAuth 2.0](#6-langkah-5-konfigurasi-google-cloud-console--gmail-api-oauth-20)
7. [Langkah 6: Menghasilkan Encryption Key AES-256-GCM](#7-langkah-6-menghasilkan-encryption-key-aes-256-gcm)
8. [Langkah 7: Konfigurasi Environment Variables di Vercel](#8-langkah-7-konfigurasi-environment-variables-di-vercel)
9. [Langkah 8: Menghubungkan Akun Gmail Melalui Aplikasi](#9-langkah-8-menghubungkan-akun-gmail-melalui-aplikasi)

---

## 1. Prasyarat

Sebelum memulai, pastikan Anda telah memiliki:
- Akun Google / Gmail pribadi utama yang akan digunakan sebagai pengirim email lamaran.
- Akun [Supabase](https://supabase.com).
- Akun [Google Cloud Console](https://console.cloud.google.com).
- Akun [Vercel](https://vercel.com).
- Repository Git (GitHub / GitLab).

---

## 2. Langkah 1: Membuat Project Supabase

1. Buka dashboard [Supabase](https://app.supabase.com) dan buat project baru.
2. Dapatkan kredensial project di **Project Settings -> API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

## 3. Langkah 2: Menjalankan SQL Migration (Termasuk Tabel gmail_connections)

Jalankan kedua file migration di menu **SQL Editor** Supabase:
1. `supabase/migrations/20261109000000_create_job_application_mailer_schema.sql` (Skema dasar, dokumen, template, log, dan storage RLS).
2. `supabase/migrations/20261109000001_create_gmail_connections.sql` (Tabel penyimpanan token OAuth terenkripsi dengan proteksi RLS).

---

## 4. Langkah 3: Konfigurasi Private Storage Bucket

Pastikan bucket `application-documents` berstatus **Private** di menu **Storage** Supabase.

---

## 5. Langkah 4: Membuat Akun Pertama (Owner)

Di menu **Authentication -> Users**, buat akun pengguna Anda dengan opsi **Auto Confirm User?** aktif.

---

## 6. Langkah 5: Konfigurasi Google Cloud Console & Gmail API OAuth 2.0

1. Buka [Google Cloud Console](https://console.cloud.google.com) dan buat project baru (misal: `Lamarin Mailer`).
2. Aktifkan **Gmail API** di menu **APIs & Services -> Enabled APIs & Services**.
3. Buka **APIs & Services -> OAuth consent screen**:
   - Pilih **External** -> klik **Create**.
   - Isi nama aplikasi (`Lamarin Mailer`) dan email dukungan Anda.
   - Pada bagian **Scopes**, tambahkan:
     - `https://www.googleapis.com/auth/gmail.send`
     - `https://www.googleapis.com/auth/userinfo.email`
   - Pada bagian **Test Users** (SANGAT PENTING):
     - Tambahkan alamat email Gmail pribadi utama Anda.
4. Buka **APIs & Services -> Credentials**:
   - Klik **+ Create Credentials** -> **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `Lamarin Web Client`.
   - Pada bagian **Authorized redirect URIs**, tambahkan:
     - Untuk pengujian lokal: `http://localhost:3000/api/auth/gmail/callback`
     - Untuk production Vercel: `https://<domain-project-anda>.vercel.app/api/auth/gmail/callback`
   - Klik **Create** dan simpan:
     - `GOOGLE_CLIENT_ID`
     - `GOOGLE_CLIENT_SECRET`

---

## 7. Langkah 6: Menghasilkan Encryption Key AES-256-GCM

Refresh token Gmail disimpan dalam bentuk terenkripsi menggunakan algoritma standar militer AES-256-GCM. Buat kunci rahasia 32-byte acak:

Pada terminal PowerShell / Bash:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Salin nilai hex 64-karakter yang dihasilkan. Ini adalah nilai untuk `GMAIL_TOKEN_ENCRYPTION_KEY`.

---

## 8. Langkah 7: Konfigurasi Environment Variables di Vercel

Di dashboard Vercel, buka **Project Settings -> Environment Variables**, lalu tambahkan:

| Key | Deskripsi |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL Project Supabase Anda |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Public Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Secret Key |
| `NEXT_PUBLIC_APP_URL` | URL production aplikasi (misal: `https://lamarin.vercel.app`) |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID dari Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 Client Secret dari Google Cloud Console |
| `GOOGLE_REDIRECT_URI` | `https://<domain-anda>.vercel.app/api/auth/gmail/callback` |
| `GMAIL_TOKEN_ENCRYPTION_KEY` | Kunci enkripsi AES-256-GCM (dari Langkah 6) |

---

## 9. Langkah 8: Menghubungkan Akun Gmail Melalui Aplikasi

1. Buka aplikasi Lamarin di browser, lalu login.
2. Buka menu **Konfigurasi Email**.
3. Pada kartu **Koneksi Akun Gmail (OAuth 2.0)**, klik tombol **Hubungkan Gmail**.
4. Anda akan diarahkan ke Google OAuth Consent Screen:
   - Pilih akun Gmail pribadi utama Anda.
   - Setujui izin pengiriman email (`gmail.send`).
5. Sistem akan memvalidasi state anti-CSRF, menukarkan authorization code dengan refresh token, mengenkripsi token dengan AES-256-GCM, dan menyimpannya di Supabase.
6. Anda otomatis diarahkan kembali ke halaman Konfigurasi Email dengan badge **Gmail Terhubung** dan status koneksi aktif di halaman Dashboard.
