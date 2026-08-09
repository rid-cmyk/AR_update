# Plan: Hook Extraction untuk Konsistensi & Organisasi AR-Hafalan

## Konteks
Project AR-Hafalan (Next.js 15 / React 19) sudah punya 17 hook di `hooks/`, tapi banyak komponen masih mengulang logika yang sama (fetch+loading/error, modal state, CRUD flow, status mapping, dll). Target: kurangi duplikasi, tingkatkan konsistensi, perkuat security (logout token clearing).

## Prioritas & Urutan Implementasi

### Phase 1 — High-Impact Consolidation (menghilangkan 50+ baris boilerplate per adopsi)

| # | Hook baru / perlu diadopsi | File sumber | Target adopsi |
|---|---------------------------|-------------|---------------|
| 1 | **`useAsyncList`** (new) | `hooks/useAsyncList.ts` | `StatistikTemplate`, `SystemStatus`, `TahunAkademikSelector`, `AbsensiSummary`, `ForgotPasscodeNotifications`, `AnnouncementList`, `TemplateUjianClient`, `TemplateRaportClient`, `PengumumanClient`, `super-admin/users`, `yayasan/raport`, `santri/progress-juz` (12+) |
| 2 | **`useCrudModal<T>`** (new, extends `useModal`) | `hooks/useCrudModal.ts` | `guru/target`, `guru/prestasi`, `admin/jadwal`, `admin/halaqah`, `admin/guru-permissions`, `admin/pengumuman`, `santri/hafalan`, `guru/ujian`, 3× `m/…/raport`, `NotificationPopover`, `FABChatGuru` (15+) |
| 3 | **`useStatusColor`** (extend `useStatusTag`) | `hooks/useStatusTag.tsx` | `AbsensiSummary`, `santri/absensi`, `guru/absensi`, `guru/target`, `yayasan/santri`, `yayasan/raport`, `progress-juz`, `hafalan/target`, `JuzProgress`, `guru/ujian` (11+) |

### Phase 2 — Security & Flow Consistency

| # | Hook | File sumber | Target adopsi |
|---|------|-------------|---------------|
| 4 | **`useLogout`** (new) | `hooks/useLogout.ts` | `HeaderBar`, `ProfileContent`, 4× `m/…/profil` (6) |
| 5 | **`useCrudNotifications`** (new, absorbs `CrudNotifications` class) | `hooks/useCrudNotifications.ts` | Ganti `CrudNotifications` + ~15 komponen yang inline `message.*`/`notification.*` |
| 6 | **`useTableFilters`** (new) | `hooks/useTableFilters.ts` | `guru/ujian`, `guru/target`, `guru/hafalan`, `santri/hafalan` (4) |

### Phase 3 — UX / Lifecycle Cleanup

| # | Hook | File sumber | Target adopsi |
|---|------|-------------|---------------|
| 7 | **`useMounted`** (new) | `hooks/useMounted.ts` | 9 komponen mobile yayasan, `guru/raport`, `guru/prestasi`, `MushafDigital`, `FormPenilaianUjianNew`, `FormUjianWizard`, `MobileHeader`, `FABChatGuru` |
| 8 | **`useDebouncedEffect`** (new) | `hooks/useDebouncedEffect.ts` | `guru/target`, `guru/hafalan` |
| 9 | **`useCountdown` + `useInterval`** (new) | `hooks/useCountdown.ts`, `hooks/useInterval.ts` | `CountdownTimer`, `Sidebar`, `ForgotPasscodeNotifications` |
| 10 | **`useDualLayoutForm`** (new, desktop WebSideDrawer + mobile Modal) | `hooks/useDualLayoutForm.ts` | 6+ CRUD pages yang pakai `renderFormContent()` IIFE |

### Phase 4 — Polish & Reuse

| # | Hook | File sumber | Target adopsi |
|---|------|-------------|---------------|
| 11 | **`useAuthMe`** (new, atau adopsi `useAuth`) | `hooks/useAuthMe.ts` | `admin/profil`, `admin/layout`, 4× `m/…/profil`, `login` |
| 12 | **`useFormatDate`** (new, `lib/utils/date.ts`) | `lib/utils/date.ts` + `hooks/useFormatDate.ts` | 6+ komponen |
| 13 | **`useMushafPages`** (new) | `hooks/useMushafPages.ts` | `MushafDigital.tsx` (799 baris) |

## Penolakan / Out of Scope

- Perubahan signifikan ke `usePageData`/`useJadwal`/`useNotifikasi`/`useOrtuChildDashboard` (sudah stabil, di luar scope rencana ini).
- `use-toast.ts` dan `use-auth.ts` — tidak diubah, hanya diadopsi/diuji konsistensi.
- `lib/`, `app/api/`, dan Prisma schema — tidak diubah.

## Konvensi yang Dipegang

- Semua hook diletakkan di `hooks/` dengan format camelCase (`useFoo.ts`).
- Tidak ada comment kecuali JSDoc untuk public API.
- Import ikuti pola yang ada di file yang diedit (`import prisma from` vs `import { prisma }` — ikuti gaya file target).
- Jangan mengandalkan ESLint sebagai quality gate (sesuai `next.config.ts`).
- Setiap hook baru WAJIB ditambah unit test di `tests/unit/` (Vitest).

## Validation

1. `npm test` — 60+ existing tests tetap lulus + tests baru untuk setiap hook.
2. `npx tsc --noEmit` — type check bersih.
3. Build: `npm run build && npm start` — pastikan SSR/hydration aman.

## Catatan Eksekusi

- Lakukan Phase 1 terlebih dahulu karena dampak terbesar.
- Setiap hook diimplementasikan + diadopsi secara bertahap per komponen (incremental, jangan bulk refactor).
- Komponen desktop dan mobile yang pakai dual-layout harus tetap konsisten (lihat AGENTS.md `renderFormContent()` pattern).
