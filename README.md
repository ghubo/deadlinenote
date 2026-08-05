# DeadlineNote

Aplikasi manajemen catatan & deadline untuk mahasiswa, dibangun dengan **React 19**, **Hono**, **Cloudflare Workers/CDN**, **D1 (SQLite)**, dan **R2**.

## Fitur Utama

- **Catatan** per mata kuliah dengan judul, isi, dan tag
- **Image-to-Text** untuk menyalin catatan cetak atau tulisan tangan dari satu gambar JPEG/PNG/WebP maksimal 5 MB ke draft catatan yang dapat dikoreksi
- **Generate Flashcard** dari isi catatan untuk latihan aktif, lengkap dengan tanda `Hafal` / `Latih lagi`
- **Smart Summary** untuk membuat ringkasan terstruktur sementara tanpa mengubah catatan asli
- **Deadline** tersendiri per mata kuliah (ujian, tugas, kuis), termasuk checklist selesai
- **Pomodoro** terintegrasi — timer tetap berjalan saat halaman di-refresh, riwayat bisa dihapus
- **Statistik** progress: rata-rata penguasaan keseluruhan → per mata kuliah → per catatan
- **Pomodoro** terintegrasi — timer tetap berjalan saat halaman di-refresh, riwayat bisa dihapus
- **Statistik** progress: rata-rata penguasaan keseluruhan → per mata kuliah → per catatan
- **Dashboard** prioritas belajar berdasarkan skor penguasaan, hari terakhir review, dan deadline terdekat per mata kuliah
- **Ekspor data** — unduh seluruh catatan, deadline, dan mata kuliah dalam format JSON
- **Halaman kontak** publik dengan validasi, honeypot, dan rate limit ringan
- **Halaman Legal Publik** untuk Kebijakan Privasi (`/privacy`) dan Syarat Layanan (`/terms`)
- **Manajemen akun** — perbarui nama, ubah password, atau hapus akun beserta data aplikasi terkait

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 19, React Router v7, TanStack Query v5; disajikan lewat Cloudflare Workers/CDN |
| Styling | Tailwind CSS v4 |
| Animasi | Motion (Framer Motion) |
| Ikon | Lucide React |
| Backend | Hono v4 di Cloudflare Workers |
| Auth | Better Auth v1 |
| Database | Cloudflare D1 (SQLite) |
| Object storage | Cloudflare R2 untuk gambar OCR sementara |
| AI | OpenAI SDK + Cloudflare AI Gateway & Cloudflare Workers AI (Image-to-Text OCR, Flashcard, dan Smart Summary) |
| Build | Vite v8 + `@cloudflare/vite-plugin` |

---

## Prerequisites

- [Node.js](https://nodejs.org/) 22.12.0+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (termasuk sebagai dev dependency — gunakan `npx wrangler` atau skrip `npm run`)
- Akun [Cloudflare](https://dash.cloudflare.com/sign-up) dengan Workers, D1, dan R2
- Secret `BETTER_AUTH_SECRET` untuk Better Auth
- Secret `CF_AIG_TOKEN`, `CF_AIG_URL`, dan `CF_AIG_MODEL` untuk Cloudflare AI Gateway & Workers AI (Image-to-Text, flashcard, dan Smart Summary)

---

## Setup

### 1. Install dependencies

```bash
npm install
```

---

### 2. Buat D1 database

```bash
npx wrangler d1 create deadlinenote-db
```

Wrangler akan mencetak output seperti ini:

```
✅ Successfully created DB 'deadlinenote-db'

[[d1_databases]]
binding = "DB"
database_name = "deadlinenote-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Salin `database_id` dan tempelkan ke `wrangler.jsonc`:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "deadlinenote-db",
    "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  // ← paste di sini
  }
]
```

---

### 3. Buat bucket R2 untuk OCR

```bash
npx wrangler r2 bucket create deadlinenote-ocr
```

Pastikan binding berikut tersedia di `wrangler.jsonc`:

```jsonc
"r2_buckets": [
  {
    "binding": "OCR_IMAGES",
    "bucket_name": "deadlinenote-ocr"
  }
]
```

Bucket ini hanya digunakan untuk gambar Image-to-Text sementara. Gambar memiliki masa berlaku 10 menit dan dijadwalkan untuk dihapus setelah proses pembacaan selesai.

---

### 4. Jalankan migrasi database

Proyek ini menggunakan sistem migrasi berbasis file SQL yang terurut di `src/worker/db/migrations/`.

| File | Isi |
|---|---|
| `0001_better_auth.sql` | Tabel auth (user, session, account, verification) |
| `0002_app_tables.sql` | Tabel app dengan FK, cascade, constraint kepemilikan, dan limit data |
| `0003_contact_messages.sql` | Pesan kontak dan rate limit kontak |
| `0004_indexes.sql` | Index untuk query user-scoped, dashboard, sesi, review, dan kontak |
| `0005_deadline_completion.sql` | Kolom status penyelesaian & checklist deadline |

Jalankan semua migrasi sekaligus:

```bash
# Lokal (development)
npx wrangler d1 migrations apply deadlinenote-db --local

# Produksi (setelah deploy)
npx wrangler d1 migrations apply deadlinenote-db --remote
```

---

### 5. Tipe Cloudflare Workers

File `worker-configuration.d.ts` sudah disertakan di repositori agar dukungan TypeScript dan auto-complete langsung aktif. Jika Anda mengubah atau menambahkan binding baru di `wrangler.jsonc`, perbarui tipenya dengan menjalankan:

```bash
npm run cf-typegen
```

---

### 6. Atur secret & Cloudflare AI Gateway

1. Salin `.dev.vars.example` menjadi `.dev.vars`:

```bash
cp .dev.vars.example .dev.vars
```

2. Konfigurasi **Cloudflare AI Gateway & Workers AI**:
   Aplikasi ini menggunakan `OpenAI SDK` dengan **Cloudflare AI Gateway** untuk routing model AI (Image-to-Text OCR, Flashcard, & Smart Summary). Daftar model Workers AI yang didukung dapat dilihat di [Dokumentasi Workers AI Models](https://developers.cloudflare.com/workers-ai/models/).

   Atur variabel `CF_AIG_URL` dan `CF_AIG_MODEL` di `.dev.vars`:
   - `CF_AIG_URL`: `https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY/compat`
   - `CF_AIG_MODEL`: `workers-ai/@cf/google/gemma-4-26b-a4b-it` (atau model pilihan Anda dari Cloudflare Workers AI)

3. Untuk deployment produksi:

```bash
npx wrangler secret put BETTER_AUTH_SECRET
npx wrangler secret put CF_AIG_TOKEN
npx wrangler secret put CF_AIG_URL
npx wrangler secret put CF_AIG_MODEL
```

---

### 7. (Opsional) Atur domain kustom

Di `wrangler.jsonc`, jika ingin menggunakan domain kustom, tambahkan di bagian `routes`:

```jsonc
"routes": [
  {
    "pattern": "yourdomain.com",
    "custom_domain": true
  }
]
```

Perbarui juga `allowedHosts` di `src/worker/lib/auth.ts`.

---

### 8. Jalankan server development lokal
```bash
npm run dev
```

Ini menjalankan Vite dengan `@cloudflare/vite-plugin`, yang menyalakan frontend React dan backend Cloudflare Worker secara bersamaan di **http://localhost:5173**.

Route auth tersedia otomatis di `http://localhost:5173/api/auth/...` melalui Better Auth.

---

### 9. Deploy ke Cloudflare Workers

```bash
npm run deploy
```

Perintah ini mem-build app dengan Vite lalu men-deploy frontend dan backend ke Cloudflare Workers melalui Wrangler.

---

## Environment Overview

| Resource | Binding | Kegunaan |
|---|---|---|
| D1 Database | `DB` | Akun user (via Better Auth), mata kuliah, deadline, catatan, sesi pomodoro, log review, pesan kontak |
| R2 Bucket | `OCR_IMAGES` | Menyimpan gambar Image-to-Text sementara sebelum dan selama pemrosesan AI |
| Secret | `BETTER_AUTH_SECRET` | Secret Better Auth |
| Secret | `CF_AIG_TOKEN` | API Key / Access Token untuk Cloudflare AI Gateway |
| Secret | `CF_AIG_URL` | Base URL endpoint Cloudflare AI Gateway (`https://gateway.ai.cloudflare.com/.../compat`) |
| Secret | `CF_AIG_MODEL` | ID Model Workers AI (misal: `dynamic/aistudio_fallback`) |

---

## API Routes

| Method | Path | Auth | Keterangan |
|---|---|---|---|
| `GET/POST` | `/api/auth/**` | — | Handled oleh Better Auth |
| `POST` | `/api/contact` | ❌ Publik | Kirim pesan kontak |
| `GET` | `/api/dashboard` | ✅ | Data prioritas belajar |
| `GET/POST` | `/api/subjects` | ✅ | List dan buat mata kuliah |
| `PUT/DELETE` | `/api/subjects/:id` | ✅ | Update dan hapus mata kuliah |
| `GET/POST` | `/api/notes` | ✅ | List dan buat catatan |
| `GET/PUT/DELETE` | `/api/notes/:id` | ✅ | Detail, update, dan hapus catatan |
| `POST` | `/api/notes/:id/generate-flashcards` | ✅ | Generate flashcard dari isi catatan |
| `POST` | `/api/notes/:id/generate-summary` | ✅ | Generate Smart Summary terstruktur dari isi catatan |
| `POST` | `/api/notes/:id/ocr-image` | ✅ | Upload satu gambar JPEG/PNG/WebP maksimal 5 MB ke R2 sementara |
| `POST` | `/api/notes/:id/extract-text` | ✅ | Transkripsikan gambar sementara milik catatan menjadi teks |
| `GET` | `/api/ocr-images/:key` | ❌ (key sementara) | Menyajikan gambar sementara ke layanan OCR; bukan endpoint UI publik |
| `POST` | `/api/notes/:id/review` | ✅ | Simpan hasil review dan skor penguasaan |
| `GET/POST` | `/api/deadlines` | ✅ | List dan buat deadline |
| `PUT/DELETE` | `/api/deadlines/:id` | ✅ | Update dan hapus deadline |
| `GET/POST` | `/api/sessions` | ✅ | List dan mulai sesi Pomodoro |
| `PUT` | `/api/sessions/:id/complete` | ✅ | Selesaikan sesi Pomodoro aktif |
| `DELETE` | `/api/sessions/:id` | ✅ | Hapus riwayat sesi |
| `GET` | `/api/export` | ✅ | Ekspor catatan, deadline, dan mata kuliah user (JSON) |

Semua error API app menggunakan bentuk JSON stabil:

```json
{ "code": "not_found", "message": "Note not found" }
```

Account update/password/delete ditangani oleh Better Auth client routes (`/api/auth/**`).

Alur Image-to-Text terdiri dari dua request terautentikasi: upload gambar ke `/api/notes/:id/ocr-image`, lalu kirim `imageKey` yang diterima ke `/api/notes/:id/extract-text`. Hasil OCR tetap perlu diperiksa pengguna sebelum disisipkan ke isi catatan.

---

## Useful Commands

| Command | Keterangan |
|---|---|
| `npm run dev` | Jalankan server development lokal |
| `npm run typecheck` | Jalankan TypeScript project references |
| `npm run build` | Build untuk produksi |
| `npm run audit` | Audit dependency vulnerabilities |
| `npm run deploy` | Build + deploy ke Cloudflare |
| `npm run cf-typegen` | Regenerate TypeScript types untuk Cloudflare bindings |
| `npx wrangler d1 execute deadlinenote-db --local --command "SELECT * FROM user"` | Query D1 lokal |
| `npx wrangler tail` | Stream live log dari Worker yang sudah di-deploy |

Catatan audit: saat terakhir dicek, `npm audit` masih melaporkan advisory moderate pada `ws` melalui dependency Cloudflare tooling (`@cloudflare/vite-plugin`/`wrangler`/`miniflare`). `npm audit fix --force` menawarkan perubahan breaking, jadi jangan jalankan otomatis tanpa mengecek rilis Cloudflare tooling yang kompatibel.

---

## Operations Notes

- [Template email UI Gmail untuk membalas pesan DeadlineNote](docs/operations/email-templates.md)





