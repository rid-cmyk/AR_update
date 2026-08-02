# AGENTS.md

Sistem manajemen hafalan Al-Quran: Next.js 15 App Router, React 19, Ant Design + Tailwind, Prisma/PostgreSQL, auth JWT via cookie, deploy Vercel. UI/pesan aplikasi berbahasa Indonesia.

## Perintah
- Dev: `npm run dev` (turbo). Build: `npm run build` / `npm start` — build TIDAK menjalankan ESLint (`next.config.ts` `eslint.ignoreDuringBuilds: true`).
- **Test Runner & Verifikasi:** `npm test` (Vitest unit test suite di `tests/unit/`, 60+ tes lulus) dan `npx tsc --noEmit`. Setiap fitur atau refaktor wajib diuji dengan tes unit dan type check.
- DB: `npm run prisma:generate` → `npm run prisma:push` (pakai `db push`, BUKAN `prisma migrate`; `prisma/migrations/` hanya berisi SQL ad-hoc) → `npm run prisma:seed`.

## Struktur & konvensi
- Role-based routing: `app/(dashboard)/<role>/`, `app/(mobile)/<role>/`, API di `app/api/...`. Role: super-admin, admin, guru, santri, ortu, yayasan.
- Route handler Next 15 pakai `params` async: `{ params }: { params: Promise<{ id: string }> }`.
- Path alias `@/*` → root repo (juga `@/lib`, `@/components`, `@/app`).
- Prisma diekspor default DAN named (`lib/database/prisma.ts`) — dua gaya import (`import prisma from` / `import { prisma }`) dipakai di codebase; ikuti gaya file yang sedang diedit.
- Auth: `getAuthUser()` (`lib/auth.ts`) atau `withAuth()` (`lib/api-helpers.ts`) → `{ user, error }`; balas 401 bila `!user || error`. `user.namaLengkap` = nama tampilan (dipakai notifikasi WA). JWT di cookie http-only `auth_token`; `middleware.ts` mengamankan route per role. Beberapa endpoint lama TIDAK punya auth — jangan jadikan contoh.
- ESLint longgar: `no-unused-vars` & `no-explicit-any` off; ignores `scripts/`, `scratch/`, `prisma/seed*`. Jangan andalkan lint sebagai quality gate.
- `scripts/` berisi script setup/test sekali jalan (node/ps1, langsung pakai DB); yang berawalan `test-*/check-*` di-gitignore.

## Sistem Ujian, KKM Per-Juz & Remedial
- **Penilaian Ujian:** Kategori ujian (`kenaikan_juz`, `uas`, `mhq`, `tasmi`) dihitung dan disimpan **per-juz** (`nilaiPerJuz: Record<number, number>`).
- **KKM & Remedial:** Evaluasi kelulusan KKM dan penentuan remedial berlaku **per-juz** (bukan hasil akhir). Hasil akhir hanya digunakan untuk menentukan predikat kehormatan (*Mumtaz, Jayyid Jiddan, Jayyid, Maqbul*).
- **Rapor Tahfidz:** Generate rapor harus menyertakan rincian penilaian per-juz dan status kelulusan tiap juz.

## UI/UX Engineering & Responsive Layout (Adaptive Dual-Mode)
- **Mode Desktop/Laptop (`>= 1024px`, `lg:`):** Menggunakan tata letak *Split-Screen 12 Kolom* (panel form penilaian di kiri `lg:col-span-5`, mushaf digital di kanan `lg:col-span-7`).
- **Mode Mobile/HP (`< 1024px`, `lg:hidden`):** Menggunakan pola **Expandable Bottom Sheet (Persistent Bottom Sheet 3 Status: `collapsed` -> `half` -> `full`)** *ala aplikasi Grab*. Mushaf Al-Qur'an Digital selalu terbuka penuh di latar belakang, sementara form penilaian berada di dalam bottom sheet yang mudah dijangkau ibu jari (*thumb zone*). Hindari menumpuk form secara vertikal di bawah mushaf.
- **Zero Code Duplication:** Gunakan helper render function (contoh: `renderFormContent()`) agar komponen form penilaian bisa dipakai di Desktop Left Panel maupun Mobile Bottom Sheet tanpa duplikasi kode.

## WhatsApp notification
- Client: `lib/services/whatsapp.ts`; event handlers + template: `lib/services/whatsapp-notifier.ts`.
- Config: env `WHATSAPP_API_KEY` + `WHATSAPP_SESSION_ID` ATAU DB `SystemSetting(id="global").data.whatsapp_api_key / whatsapp_session_id`; toggle = `data.whatsapp_enabled`. **Cache 5 menit** — panggil `resetConfigCache()` setelah ubah config via DB. WA hanya terkirim bila enabled + apiKey + sessionId (semuanya wajib).
- Dipanggil fire-and-forget (`.catch(console.error)`) dari route: hafalan (`guru/hafalan` & `hafalan` POST), target, ujian, prestasi, pengumuman, forgot-passcode.
- Rekap absensi harian via cron `/api/cron/absensi-wa` (jadwal `vercel.json`: `*/30 18-23 * * *`); terkirim 1×/hari berkat guard `absensi_wa_last_sent` di `SystemSetting.data`.
- Test kirim: POST `/api/admin-settings/whatsapp/test`.

## Operasional
- `.env.example` dirujuk README tapi TIDAK ada di repo; `.env*` di-gitignore.
- Deploy: Vercel (`vercel.json` berisi cron). `next.config.ts` `output: "standalone"`.
