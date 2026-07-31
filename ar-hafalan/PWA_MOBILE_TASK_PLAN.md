# Task Plan: PWA dengan UI/UX Mobile Terpisah

> **Proyek:** AR-Hafalan — Sistem Monitoring Hafalan Quran
> **Tanggal:** 28 Juli 2026
> **Status:** Draft

---

## Ringkasan Eksekutif

Mengubah aplikasi web AR-Hafalan menjadi **Progressive Web App (PWA)** yang bisa di-install di HP, dengan **UI/UX mobile yang benar-benar terpisah** dari versi desktop. Fungsi tetap sama, tampilan dan cara berinteraksi berbeda.

### Arsitektur: Dual Route Group

```
app/
├── (auth)/                    ← Shared (login/logout)
├── (mobile)/                  ← MOBILE PWA (BARU)
│   ├── layout.tsx
│   ├── guru/...
│   ├── santri/...
│   └── ...
├── (desktop)/                 ← DESKTOP (exists, rename from dashboard)
│   ├── layout.tsx
│   └── ...64 pages
├── api/                       ← Shared (tidak berubah)
└── layout.tsx                 ← Root (tambah PWA meta)
```

### Key Decisions

- **1 codebase** — tidak perlu app terpisah
- **PWA** — install dari browser, offline mode
- **UI/UX berbeda total** — mobile: card-based, bottom nav, touch-friendly | desktop: sidebar, table, hover
- **Fungsi sama** — shared API (147 routes), shared hooks (8), shared UI components (22)

---

## Phase 0: PWA Infrastructure

**Estimasi:** 1-2 hari
**Tujuan:** Agar aplikasi bisa di-install di HP dan memiliki fitur dasar PWA

### Task 0.1: Buat PWA Manifest

- [ ] Buat `public/manifest.json`
  ```json
  {
    "name": "AR-Hafalan",
    "short_name": "AR-Hafalan",
    "description": "Sistem Monitoring Hafalan Quran",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#1890ff",
    "orientation": "portrait-primary",
    "icons": [
      { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
      { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
    ]
  }
  ```
- [ ] Buat folder `public/icons/`
- [ ] Buat/generate icon 192x192 dan 512x512 (bisa dari logo existing)

### Task 0.2: Rewrite Service Worker

- [ ] Rewrite `public/sw.js` (ganti yang kosong saat ini)
  ```js
  const CACHE_NAME = 'ar-hafalan-v1';
  const STATIC_ASSETS = ['/', '/offline', '/manifest.json'];

  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
    );
    self.clients.claim();
  });

  self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('/api/')) {
      // Network-first untuk API
      event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
      );
    } else {
      // Cache-first untuk static assets
      event.respondWith(
        caches.match(event.request).then((cached) => cached || fetch(event.request))
      );
    }
  });
  ```
- [ ] Buat `app/offline/page.tsx` — halaman fallback offline

### Task 0.3: Tambah PWA Metadata ke Root Layout

- [ ] Edit `app/layout.tsx` — tambah export metadata:
  ```tsx
  export const metadata: Metadata = {
    title: "AR-Hapalan Apps",
    description: "Developed by Hendri Sudianto",
    manifest: "/manifest.json",
    themeColor: "#1890ff",
    viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "AR-Hafalan"
    },
  };
  ```
- [ ] Tambah link tag untuk Apple touch icon di `<head>`

### Task 0.4: Service Worker Registration

- [ ] Buat `hooks/usePWAInstall.ts`
  ```ts
  "use client";
  import { useState, useEffect } from "react";

  export function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstallable, setIsInstallable] = useState(false);

    useEffect(() => {
      const handler = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallable(true);
      };
      window.addEventListener("beforeinstallprompt", handler);
      window.addEventListener("appinstalled", () => setIsInstallable(false));
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const install = async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    };

    return { isInstallable, install };
  }
  ```
- [ ] Register service worker di `app/layout.tsx` atau `_app.tsx` equivalent

### Task 0.5: Update CSP Headers

- [ ] Edit `next.config.ts` — tambah `worker-src` ke CSP:
  ```
  worker-src 'self';
  ```

---

## Phase 1: Mobile Layout Shell

**Estimasi:** 2-3 hari
**Tujuan:** Mobile layout dengan bottom navigation dan device detection

### Task 1.1: Device Detection Middleware

- [ ] Edit `middleware.ts` — tambah deteksi mobile:
  ```ts
  const MOBILE_REGEX = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

  // Di dalam middleware function:
  const userAgent = request.headers.get("user-agent") || "";
  const isMobile = MOBILE_REGEX.test(userAgent);

  // Jika mobile dan path bukan di (mobile)/, redirect
  // Jika desktop dan path di (mobile)/, redirect ke (desktop)/
  ```
- [ ] Test: akses dari HP → otomatis masuk `(mobile)/`
- [ ] Test: akses dari PC → tetap di `(desktop)/`

### Task 1.2: Buat Route Group `(mobile)`

- [ ] Buat folder `app/(mobile)/`
- [ ] Buat `app/(mobile)/layout.tsx` — mobile shell:
  ```tsx
  import MobileShell from "@/components/mobile/MobileShell";

  export default function MobileLayout({ children }: { children: React.ReactNode }) {
    return <MobileShell>{children}</MobileShell>;
  }
  ```

### Task 1.3: Buat Mobile Shell Component

- [ ] Buat `components/mobile/MobileShell.tsx`
  - Top bar (logo, notifikasi, profil)
  - Content area (scrollable, padding bottom untuk bottom nav)
  - Bottom tab navigation
  - Safe area insets untuk iPhone (notch, home indicator)

### Task 1.4: Buat Mobile Navigation

- [ ] Buat `components/mobile/MobileNav.tsx`
  - Bottom tab bar dengan 4-5 ikon
  - Role-based menu items (sama dengan Sidebar.tsx tapi versi mobile)
  - Active state indicator
  - Badge untuk notifikasi unread
  - Smooth transition antar tab

- [ ] Menu items per role:
  | Role | Tab Items |
  |------|-----------|
  | Guru | Dashboard, Absensi, Hafalan, Jadwal, Profil |
  | Santri | Dashboard, Hafalan, Absensi, Jadwal, Profil |
  | Admin | Dashboard, Users, Template, Settings, Profil |
  | Ortu | Dashboard, Anak, Hafalan, Absensi, Profil |
  | Yayasan | Dashboard, Santri, Laporan, Notifikasi, Profil |
  | Super Admin | Dashboard, Users, Settings, Notifications, Profil |

### Task 1.5: Buat Mobile Header

- [ ] Buat `components/mobile/MobileHeader.tsx`
  - Logo "AR-Hafalan" kiri
  - Notifikasi bell + count badge kanan
  - Profil avatar → dropdown menu

### Task 1.6: Buat Device Detection Hook

- [ ] Buat `hooks/useIsMobile.ts`
  ```ts
  "use client";
  import { useMediaQuery } from "react-responsive";
  export function useIsMobile(breakpoint = 768) {
    return useMediaQuery({ maxWidth: breakpoint });
  }
  ```

---

## Phase 2: Mobile Pages — MVP Guru

**Estimasi:** 3-4 hari
**Tujuan:** Halaman mobile lengkap untuk role Guru (role yang paling sering dipakai)

### Pattern per Page

```
app/(mobile)/guru/dashboard/
├── page.tsx                  ← Server component, fetch data
└── _components/
    ├── MobileStatCards.tsx    ← Stat cards
    ├── MobileQuickActions.tsx ← Quick action grid
    └── MobileRecentList.tsx  ← Recent activity
```

### Task 2.1: Guru — Dashboard Mobile

- [ ] Buat `app/(mobile)/guru/dashboard/page.tsx`
- [ ] Buat `app/(mobile)/guru/dashboard/_components/MobileStatCards.tsx`
  - 2 kolom stat cards (Total Hafalan, Target Hari Ini, dll)
  - Full-width card dengan icon + angka + label
- [ ] Buat `app/(mobile)/guru/dashboard/_components/MobileQuickActions.tsx`
  - 2x2 grid ikon navigasi cepat (Input Hafalan, Absensi, Jadwal, Ujian)
- [ ] Buat `app/(mobile)/guru/dashboard/_components/MobileRecentList.tsx`
  - List card aktivitas terakhir
  - Tap untuk detail

### Task 2.2: Guru — Absensi Mobile

- [ ] Buat `app/(mobile)/guru/absensi/page.tsx`
  - Card list halaqah yang diampu
  - Tap halaqah → form absensi full-screen
  - Toggle hadir/alpa per santri (switch component)
  - Tombol simpan di bawah (sticky)

### Task 2.3: Guru — Hafalan Mobile

- [ ] Buat `app/(mobile)/guru/hafalan/page.tsx`
  - Card list santri per halaqah
  - Tap santri → form input hafalan (full-screen)
  - Pilihan surat + ayat (dropdown/searchable)
  - Rating mutaba'ah (star/toggle)
  - Tombol simpan

### Task 2.4: Guru — Jadwal Mobile

- [ ] Buat `app/(mobile)/guru/jadwal/page.tsx`
  - Hari ini view (default)
  - Card list jadwal hari ini
  - Swipe left/right untuk ganti hari
  - Timeline vertical view

### Task 2.5: Guru — Lainnya Mobile

- [ ] Buat `app/(mobile)/guru/target/page.tsx` — Target card per santri
- [ ] Buat `app/(mobile)/guru/ujian/page.tsx` — Card list ujian
- [ ] Buat `app/(mobile)/guru/laporan/page.tsx` — Summary + chart full-width
- [ ] Buat `app/(mobile)/guru/grafik/page.tsx` — Full-width charts
- [ ] Buat `app/(mobile)/guru/pengumuman/page.tsx` — Card list
- [ ] Buat `app/(mobile)/guru/notifikasi/page.tsx` — Full-screen notification list
- [ ] Buat `app/(mobile)/guru/prestasi/page.tsx` — Achievement card grid
- [ ] Buat `app/(mobile)/guru/raport/page.tsx` — Card list → preview
- [ ] Buat `app/(mobile)/guru/profil/page.tsx` — Profile card + settings list

---

## Phase 3: Shared Mobile Components

**Estimasi:** 2-3 hari
**Tujuan:** Component library reusable untuk semua mobile pages

### Task 3.1: Core Mobile Components

- [ ] `components/mobile/MobileStatCard.tsx` — Stat card (icon + value + label)
- [ ] `components/mobile/MobileListItem.tsx` — List item card dengan tap handler
- [ ] `components/mobile/MobileChart.tsx` — Full-width chart wrapper (ResponsiveContainer)
- [ ] `components/mobile/MobileForm.tsx` — Full-screen form pattern (header + scroll + sticky footer)
- [ ] `components/mobile/MobileSearchBar.tsx` — Search input dengan icon
- [ ] `components/mobile/MobileEmptyState.tsx` — Empty state dengan ilustrasi
- [ ] `components/mobile/MobileLoading.tsx` — Skeleton loading card
- [ ] `components/mobile/MobileBadge.tsx` — Notification badge
- [ ] `components/mobile/MobileAvatar.tsx` — Profile avatar dengan status indicator

### Task 3.2: Interaction Components

- [ ] `components/mobile/MobilePullToRefresh.tsx` — Pull-to-refresh handler
- [ ] `components/mobile/MobileSwipeAction.tsx` — Swipe left/right action
- [ ] `components/mobile/MobileBottomSheet.tsx` — Bottom sheet modal (ganti dialog)
- [ ] `components/mobile/MobileFullScreenModal.tsx` — Full-screen modal (ganti modal)

### Task 3.3: Navigation Components

- [ ] `components/mobile/MobileTabBar.tsx` — Bottom tab bar
- [ ] `components/mobile/MobileDropdown.tsx` — Dropdown menu (tap to open)
- [ ] `components/mobile/MobileBackButton.tsx` — Back navigation button

---

## Phase 4: Mobile Pages — Santri

**Estimasi:** 2-3 hari

### Task 4.1: Santri — Dashboard Mobile

- [ ] Buat `app/(mobile)/santri/dashboard/page.tsx`
  - Progress juz card (visual progress bar)
  - Hafalan hari ini
  - Stats: total ayat, target tersisa

### Task 4.2: Santri — Hafalan Mobile

- [ ] Buat `app/(mobile)/santri/hafalan/page.tsx` — Card list per surat + progress
- [ ] Buat `app/(mobile)/santri/hafalan/target/page.tsx` — Target card dengan progress
- [ ] Buat `app/(mobile)/santri/hafalan/rekap/page.tsx` — Timeline rekap

### Task 4.3: Santri — Lainnya Mobile

- [ ] Buat `app/(mobile)/santri/absensi/page.tsx` — Calendar view + summary
- [ ] Buat `app/(mobile)/santri/jadwal/page.tsx` — Card list jadwal hari ini
- [ ] Buat `app/(mobile)/santri/progress-juz/page.tsx` — Visual juz progress
- [ ] Buat `app/(mobile)/santri/notifikasi/page.tsx` — Full-screen list
- [ ] Buat `app/(mobile)/santri/raport/page.tsx` — Card list → preview
- [ ] Buat `app/(mobile)/santri/profil/page.tsx` — Profile card

---

## Phase 5: Mobile Pages — Admin

**Estimasi:** 3-4 hari

### Task 5.1: Admin — Dashboard Mobile

- [ ] Buat `app/(mobile)/admin/dashboard/page.tsx`
  - Stat overview cards
  - Quick action grid (6-8 items)
  - Recent activity list

### Task 5.2: Admin — Management Mobile

- [ ] Buat `app/(mobile)/admin/halaqah/page.tsx` — Card list → detail
- [ ] Buat `app/(mobile)/admin/jadwal/page.tsx` — List/card schedule
- [ ] Buat `app/(mobile)/admin/pengumuman/page.tsx` — Card list
- [ ] Buat `app/(mobile)/admin/laporan/page.tsx` — Summary + chart

### Task 5.3: Admin — Template Mobile

- [ ] Buat `app/(mobile)/admin/template/page.tsx` — Card list
- [ ] Buat `app/(mobile)/admin/template/tahun-akademik/page.tsx`
- [ ] Buat `app/(mobile)/admin/template/jenis-ujian/page.tsx`
- [ ] Buat `app/(mobile)/admin/template/raport/page.tsx`
- [ ] Buat `app/(mobile)/admin/template-ujian/page.tsx`
- [ ] Buat `app/(mobile)/admin/template-raport/page.tsx`
- [ ] Buat `app/(mobile)/admin/tahun-akademik/page.tsx`

### Task 5.4: Admin — Settings Mobile

- [ ] Buat `app/(mobile)/admin/settings/page.tsx` — Settings list (iOS-style)
- [ ] Buat `app/(mobile)/admin/settings/general/page.tsx`
- [ ] Buat `app/(mobile)/admin/settings/system/page.tsx`
- [ ] Buat `app/(mobile)/admin/settings/security/page.tsx`
- [ ] Buat `app/(mobile)/admin/settings/notifications/page.tsx`
- [ ] Buat `app/(mobile)/admin/settings/backup/page.tsx`
- [ ] Buat `app/(mobile)/admin/guru-permissions/page.tsx`
- [ ] Buat `app/(mobile)/admin/profil/page.tsx`

---

## Phase 6: Mobile Pages — Ortu

**Estimasi:** 2 hari

### Task 6.1: Ortu — Semua Halaman Mobile

- [ ] Buat `app/(mobile)/ortu/dashboard/page.tsx` — Anak card + progress summary
- [ ] Buat `app/(mobile)/ortu/absensi/page.tsx` — Calendar view
- [ ] Buat `app/(mobile)/ortu/hafalan/page.tsx` — Progress card per anak
- [ ] Buat `app/(mobile)/ortu/target/page.tsx` — Target card + progress
- [ ] Buat `app/(mobile)/ortu/raport/page.tsx` — Card list → preview
- [ ] Buat `app/(mobile)/ortu/notifikasi/page.tsx` — Full-screen list
- [ ] Buat `app/(mobile)/ortu/pengumuman/page.tsx` — Card list
- [ ] Buat `app/(mobile)/ortu/profil/page.tsx` — Profile card

---

## Phase 7: Mobile Pages — Yayasan

**Estimasi:** 1-2 hari

### Task 7.1: Yayasan — Semua Halaman Mobile

- [ ] Buat `app/(mobile)/yayasan/dashboard/page.tsx` — Stat overview cards
- [ ] Buat `app/(mobile)/yayasan/santri/page.tsx` — Searchable card list
- [ ] Buat `app/(mobile)/yayasan/laporan/page.tsx` — Summary + chart
- [ ] Buat `app/(mobile)/yayasan/raport/page.tsx` — Card list
- [ ] Buat `app/(mobile)/yayasan/notifikasi/page.tsx` — Full-screen list
- [ ] Buat `app/(mobile)/yayasan/profil/page.tsx` — Profile card

---

## Phase 8: Mobile Pages — Super Admin

**Estimasi:** 1 hari

### Task 8.1: Super Admin — Semua Halaman Mobile

- [ ] Buat `app/(mobile)/super-admin/dashboard/page.tsx` — System stat cards
- [ ] Buat `app/(mobile)/super-admin/users/page.tsx` — Searchable user list (card)
- [ ] Buat `app/(mobile)/super-admin/notifications/forgot-passcode/page.tsx` — Card list
- [ ] Buat `app/(mobile)/super-admin/settings/backup-database/page.tsx` — Backup action cards
- [ ] Buat `app/(mobile)/super-admin/profil/page.tsx` — Profile card

---

## Phase 9: Polish & Testing

**Estimasi:** 2-3 hari

### Task 9.1: Animations & Transitions

- [ ] Tambah page transition animations (framer-motion sudah ada di dependencies)
- [ ] Tambah tap feedback (scale on press)
- [ ] Tambah loading states per page
- [ ] Tambah pull-to-refresh di semua list pages

### Task 9.2: Offline Support

- [ ] Test service worker caching
- [ ] Test offline fallback page
- [ ] Tambah indicator "offline" di mobile header
- [ ] Cache API responses untuk data statis

### Task 9.3: PWA Testing

- [ ] Test "Add to Home Screen" di Android Chrome
- [ ] Test "Add to Home Screen" di iOS Safari
- [ ] Test standalone mode (no browser UI)
- [ ] Test portrait lock
- [ ] Test splash screen

### Task 9.4: Cross-Device Testing

- [ ] Test di iPhone (various sizes)
- [ ] Test di Android (various sizes)
- [ ] Test di tablet
- [ ] Test landscape mode (should stay portrait)
- [ ] Test safe area insets (notch, home indicator)

### Task 9.5: Performance

- [ ] Audit bundle size (pastikan mobile tidak load desktop components)
- [ ] Lazy load mobile pages
- [ ] Optimize images untuk mobile
- [ ] Test Lighthouse PWA score (target: 90+)

---

## Estimasi Total

| Phase | Hari | Keterangan |
|-------|------|------------|
| Phase 0: PWA Infrastructure | 1-2 | Manifest, SW, meta, icons |
| Phase 1: Mobile Layout Shell | 2-3 | Middleware, layout, navigation |
| Phase 2: MVP Guru Pages | 3-4 | 13 halaman mobile |
| Phase 3: Shared Components | 2-3 | Component library |
| Phase 4: Santri Pages | 2-3 | 10 halaman mobile |
| Phase 5: Admin Pages | 3-4 | 20+ halaman mobile |
| Phase 6: Ortu Pages | 2 | 8 halaman mobile |
| Phase 7: Yayasan Pages | 1-2 | 6 halaman mobile |
| Phase 8: Super Admin Pages | 1 | 5 halaman mobile |
| Phase 9: Polish & Testing | 2-3 | Animations, offline, testing |
| **TOTAL** | **~19-26 hari** | — |

---

## Tech Stack yang Digunakan

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| Next.js | 15 | Framework (App Router) |
| React | 19 | UI Library |
| TypeScript | 5 | Type Safety |
| Tailwind CSS | 4 | Styling (mobile-first) |
| Ant Design | 5 | UI Components (shared) |
| Radix UI | - | Primitives (shared) |
| Framer Motion | 12 | Animations (sudah ada) |
| react-responsive | 10 | Device detection (sudah ada) |
| Recharts | 3 | Charts (shared) |
| SWR | 2 | Data fetching (shared) |

---

## Referensi

- **Current layout:** `components/layout/LayoutApp.tsx:12` — `useMediaQuery({ maxWidth: 768 })`
- **Current mobile:** `components/layout/MobileMenu.tsx` — placeholder, perlu rewrite
- **Desktop sidebar:** `components/layout/Sidebar.tsx` — 615 baris, 6 role navigasi
- **Dashboard layout:** `app/(dashboard)/layout.tsx` — wrapper LayoutApp
- **Middleware:** `middleware.ts` — auth + RBAC (perlu tambah device detection)
- **Package:** `package.json` — sudah punya framer-motion, react-responsive, recharts

---

## Phase 10: Integrasi WhatsApp Notification (FSN WA Gateway)

**Estimasi:** 6-7 hari
**Tujuan:** Kirim notifikasi via WhatsApp ke Guru, Yayasan, dan Orang Tua

### Ringkasan

| Aspek | Detail |
|-------|--------|
| **API** | FSN WA Gateway (`api.fullstacknotes.org`) |
| **API Key & Session ID** | Disimpan di `.env` + `SystemSetting` (admin bisa ganti dari UI) |
| **Toggle** | Global admin toggle (on/off untuk semua user) |
| **Recipient** | Guru, Yayasan, Orang Tua (berdasarkan `noTlp` di User) |
| **Events** | Semua event notifikasi |

### Timing per Event

| Event | Waktu Kirim | Trigger | Recipient |
|-------|------------|---------|-----------|
| **Ziyadah & Muroja'ah** | **Realtime** | Guru input hafalan → langsung kirim | Orang Tua santri |
| **Absensi** | **Malam hari** | Setelah `jamSelesai` halaqah terakhir hari itu | Orang Tua santri |
| **Lupa Passcode** | **Realtime** | User minta reset passcode → langsung kirim | User yang lupa |
| **Target hafalan** | **Realtime** | Guru buat/update/hapus target → langsung kirim | Orang Tua santri |
| **Pengumuman** | **Realtime** | Admin buat pengumuman → langsung kirim | Guru + Yayasan + Orang Tua |
| **Ujian** | **Realtime** | Submit/verifikasi ujian → langsung kirim | Admin / Guru |

### Template Pesan

#### Ziyadah (Hafalan Baru)
```
🕌 AR-Hafalan

Anak Anda *{namaSantri}* telah menyelesaikan hafalan baru:

📖 Surat: {namaSurat} Ayat {ayatAwal}-{ayatAkhir}
👨‍🏫 Guru: {namaGuru}
📅 Tanggal: {tanggal}

Semangat terus! 🌟
```

#### Muroja'ah (Review)
```
🕌 AR-Hafalan

Anak Anda *{namaSantri}* telah melakukan muroja'ah:

📖 Surat: {namaSurat} Ayat {ayatAwal}-{ayatAkhir}
👨‍🏫 Guru: {namaGuru}
📅 Tanggal: {tanggal}

Alhamdulillah 🤲
```

#### Absensi Malam Hari (Detail per Halaqah)
```
📋 Rekap Absensi Hafalan — {tanggal}

🕌 Halaqah: {namaHalaqah}
🕐 Jam: {jamMulai} - {jamSelesai}

✅ Hadir: {n} santri
❌ Alpha: {n} santri ({nama-nama})
⏸️ Izin: {n} santri
```

#### Target Hafalan
```
🎯 Target Hafalan Baru

Anak Anda *{namaSantri}* mendapat target:
📖 Surat: {namaSurat} Ayat {ayatAwal}-{ayatAkhir}
👨‍🏫 Guru: {namaGuru}

Capai targetmu! 💪
```

#### Target Selesai
```
🎉 Target Tercapai!

Anak Anda *{namaSantri}* telah menyelesaikan target:
📖 Surat: {namaSurat}
👨‍🏫 Guru: {namaGuru}

Alhamdulillah! 🤲🌟
```

#### Ujian Disubmit
```
📝 Ujian Menunggu Verifikasi

{namaSantri} — {jenisUjian}
👨‍🏫 Guru: {namaGuru}
📅 Tanggal: {tanggal}

Menunggu verifikasi admin.
```

#### Ujian Diverifikasi
```
✅ Ujian {status}

{namaSantri} — {jenisUjian}
Nilai: {nilai}
Status: {diverifikasi/ditolak}

{keterangan}
```

#### Pengumuman Baru
```
📢 Pengumuman Baru

Judul: {judul}
Dari: {namaAdmin}

{isiPendek}...

Buka aplikasi untuk membaca selengkapnya.
```

#### Lupa Passcode
```
🔑 Passcode Baru Anda

Halo *{namaUser}*,

Passcode baru Anda: *{passcode}*

Gunakan passcode ini untuk login. Jangan bagikan ke orang lain.
```

### Arsitektur WhatsApp Service

```
Event terjadi (hafalan, absensi, ujian, pengumuman, dll)
    │
    ▼
Buat Notifikasi record di DB (existing)
    │
    ▼
Cek admin toggle: SystemSetting.data.whatsapp_enabled
    │
    ├── OFF → Selesai (hanya in-app)
    │
    └── ON → Ambil recipient phone numbers (noTlp dari User)
              │
              ▼
         Format pesan (template per event)
              │
              ▼
         Kirim via FSN WA Gateway API (axios)
              │
              ▼
         Log status (berhasil/gagal) ke console
```

### Absensi Malam Hari — Cara Kerja

```
1. Cron job / scheduler jalan setiap 30 menit (18:00 - 23:00 WIB)
2. GET /api/cron/absensi-wa dipanggil
3. Query Jadwal hari ini → cari jamSelesai terakhir
4. Jika waktu sekarang > jamSelesai terakhir:
   a. Ambil semua Absensi hari ini (per jadwal/halaqah)
   b. Format pesan detail per halaqah
   c. Kirim WA ke orang tua santri
5. Jika sudah dikirim hari ini → skip (cegah duplikat)
```

### Database yang Dibaca

| Model | Field yang Dipakai |
|-------|-------------------|
| `Jadwal` | `hari`, `jamMulai`, `jamSelesai`, `halaqahId`, `isActive` |
| `Halaqah` | `namaHalaqah` |
| `Absensi` | `status` (alpha/izin/masuk), `tanggal`, `santriId`, `jadwalId` |
| `OrangTuaSantri` | Relasi orang tua ↔ santri |
| `User` | `noTlp` (phone number orang tua) |
| `SystemSetting` | `data.whatsapp_enabled` |

### Service Layer

#### `lib/services/whatsapp.ts` — WA Client

```ts
// Kirim pesan WA via FSN Gateway
export async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean>

// Helper: ambil config dari .env atau SystemSetting
export async function getWhatsAppConfig(): Promise<{ apiUrl: string; apiKey: string; sessionId: string; enabled: boolean }>

// Helper: format phone number untuk WA (pakai phoneFormatter yang sudah ada)
import { formatPhoneNumberForWhatsApp } from "@/lib/utils/phoneFormatter";
```

#### `lib/services/whatsapp-notifier.ts` — Event Handlers

```ts
// Hafalan (realtime)
export async function notifyHafalan(santriId: number, type: 'ziyadah' | 'murojaah', detail: {
  namaSurat: string; ayatAwal: number; ayatAkhir: number; namaGuru: string
})

// Absensi (malam hari - batch)
export async function sendAbsensiRecap(): Promise<{ sent: number; failed: number }>

// Lupa passcode (realtime)
export async function notifyForgotPasscode(userId: number, newPasscode: string)

// Target hafalan (realtime)
export async function notifyTarget(santriId: number, action: 'created' | 'completed' | 'deleted', detail: {
  namaSurat: string; namaGuru: string
})

// Pengumuman (realtime)
export async function notifyPengumuman(pengumumanId: number, judul: string, isi: string, targetAudience: string)

// Ujian (realtime)
export async function notifyUjian(santriId: number, action: 'submitted' | 'verified' | 'rejected', detail: {
  jenisUjian: string; namaGuru: string; nilai?: number; keterangan?: string
})
```

### Database Changes

#### SystemSetting Model (SUDAH ADA di schema:547-551)

```prisma
model SystemSetting {
  id        String   @id @default("global")
  data      Json
  updatedAt DateTime @updatedAt
}
```

Data yang disimpan di `data` field (JSON):

```json
{
  "whatsapp_enabled": true,
  "whatsapp_api_key": "fsk_...",
  "whatsapp_session_id": "wa_..."
}
```

> **Catatan:** Tidak perlu migration baru — model sudah ada.

### Environment Variables

Tambahkan ke `.env`:

```
WHATSAPP_API_URL=https://api.fullstacknotes.org/api/v1/messages/send
WHATSAPP_API_KEY=fsk_483bcc64...
WHATSAPP_SESSION_ID=wa_13d70a2a_498db58228cf
```

### File yang Perlu Dibuat/Diubah

#### Baru (4 file)

| File | Fungsi |
|------|--------|
| `lib/services/whatsapp.ts` | WA client (axios call ke FSN Gateway) |
| `lib/services/whatsapp-notifier.ts` | Event handlers + template pesan |
| `app/api/cron/absensi-wa/route.ts` | Cron endpoint untuk absensi malam hari |
| `components/admin/WhatsAppSettings.tsx` | Admin toggle + config UI |

#### Diubah (13 file)

| File | Perubahan |
|------|-----------|
| `.env` | Tambah `WHATSAPP_API_URL`, `WHATSAPP_API_KEY`, `WHATSAPP_SESSION_ID` |
| `app/api/guru/target/route.ts` | Tambah `notifyTarget()` setelah create target |
| `app/api/guru/target/[id]/route.ts` | Tambah `notifyTarget()` setelah update/delete |
| `app/api/guru/target-juz/[id]/route.ts` | Tambah `notifyTarget()` setelah update/delete |
| `app/api/guru/ujian/[id]/submit/route.ts` | Tambah `notifyUjian()` + **fix hardcoded userId=1** |
| `app/api/admin/ujian/[id]/verify/route.ts` | Tambah `notifyUjian()` |
| `app/api/guru/prestasi/route.ts` | Tambah `notifyHafalan()` |
| `app/api/guru/prestasi/[id]/route.ts` | Tambah `notifyHafalan()` |
| `app/api/pengumuman/route.ts` | Tambah `notifyPengumuman()` setelah create |
| `app/api/notifications/forgot-passcode/route.ts` | Tambah `notifyForgotPasscode()` |
| `app/api/notifikasi/route.ts` | Fix: tambah `isRead` field atau handle properly |
| `app/(dashboard)/admin/settings/notifications/page.tsx` | Tambah WhatsApp settings section |
| `prisma/schema.prisma` | Tambah field `isRead` ke model `Notifikasi` (optional) |

### Bug Fix yang Serta Dilakukan

| Bug | Lokasi | Fix |
|-----|--------|-----|
| **Hardcoded userId=1** | `guru/ujian/[id]/submit/route.ts:101` | Query admin user ID from DB |
| **Notifikasi tidak ada isRead** | `prisma/schema.prisma:182` | Tambah field `isRead Boolean @default(false)` + migration |
| **Duplikat notifikasi** | `pengumuman/route.ts:292` | Hapus createMany notifikasi saat buat pengumuman, cukup pakai Pengumuman model |
| **Validasi pengumuman updatekurang** | `pengumuman/[id]/route.ts:148` | Tambah `'yayasan'` ke validasi |

### Cron Scheduler Setup

Untuk absensi malam hari, perlu scheduler yang memanggil `/api/cron/absensi-wa`:

#### Opsi A: External Cron (Recommended untuk production)
```bash
# Crontab (Linux) — setiap 30 menit dari jam 18:00-23:00
*/30 18-22 * * * curl -s https://yourdomain.com/api/cron/absensi-wa

# Atau Vercel Cron (jika deploy di Vercel)
# vercel.json:
{ "crons": [{ "path": "/api/cron/absensi-wa", "schedule": "*/30 18-22 * * *" }] }
```

#### Opsi B: Self-hosted scheduler (jika server sendiri)
- Gunakan `node-cron` atau `bull` queue
- Jalankan sebagai background process

### Admin Settings UI

Tambah tab/section di `app/(dashboard)/admin/settings/notifications/page.tsx`:

```
WhatsApp Notification Settings
├── Toggle: Aktifkan/Nonaktifkan WhatsApp
├── API Key: [input field] (masked)
├── Session ID: [input field]
├── Test Button: "Kirim Pesan Test"
└── Status: Connected / Disconnected
```

### Urutan Implementasi

| Fase | Task | Estimasi |
|------|------|----------|
| **1** | `whatsapp.ts` — basic WA client + config helper | 0.5 hari |
| **2** | `.env` + SystemSetting config | 0.5 hari |
| **3** | Admin toggle UI (`WhatsAppSettings.tsx`) | 0.5 hari |
| **4** | `whatsapp-notifier.ts` — semua event handlers + templates | 1.5 hari |
| **5** | Integrasikan ke 12+ routes (realtime events) | 1-2 hari |
| **6** | Cron endpoint absensi malam hari (`/api/cron/absensi-wa`) | 1 hari |
| **7** | Fix bugs existing (hardcoded userId, isRead, duplikat) | 0.5 hari |
| **8** | Testing & debugging | 1 hari |
| **Total** | | **~6-7 hari** |

---

## Estimasi Total Keseluruhan

| Phase | Hari | Keterangan |
|-------|------|------------|
| Phase 0: PWA Infrastructure | 1-2 | Manifest, SW, meta, icons |
| Phase 1: Mobile Layout Shell | 2-3 | Middleware, layout, navigation |
| Phase 2: MVP Guru Pages | 3-4 | 13 halaman mobile |
| Phase 3: Shared Components | 2-3 | Component library |
| Phase 4: Santri Pages | 2-3 | 10 halaman mobile |
| Phase 5: Admin Pages | 3-4 | 20+ halaman mobile |
| Phase 6: Ortu Pages | 2 | 8 halaman mobile |
| Phase 7: Yayasan Pages | 1-2 | 6 halaman mobile |
| Phase 8: Super Admin Pages | 1 | 5 halaman mobile |
| Phase 9: Polish & Testing | 2-3 | Animations, offline, testing |
| Phase 10: WhatsApp Notification | 6-7 | FSN WA Gateway integration |
| **TOTAL** | **~25-33 hari** | — |
