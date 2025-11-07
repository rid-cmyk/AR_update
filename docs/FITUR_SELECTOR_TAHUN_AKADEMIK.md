# 📅 Fitur Selector Tahun Akademik

## 🎯 Overview

Selector Tahun Akademik adalah komponen yang menampilkan dan mengelola tahun akademik aktif di sistem. Komponen ini **BUKAN placeholder kosong**, melainkan fitur lengkap yang sudah terimplementasi.

## 📍 Lokasi

**Halaman**: Admin → Template → Tab "Tahun Akademik Otomatis"

**Komponen**: `components/admin/tahun-akademik/TahunAkademikSelector.tsx`

## ✨ Fitur Lengkap

### 1. **Tampilan Tahun Akademik Aktif**
- Menampilkan tahun akademik yang sedang aktif
- Format: "2024/2025 - Semester 1"
- Icon semester: 🌞 (S1) atau ❄️ (S2)

### 2. **Dropdown Selector**
- Pilih tahun akademik dari daftar yang tersedia
- Ganti tahun akademik aktif dengan mudah
- Auto-refresh data setelah perubahan

### 3. **Statistik Data**
- Jumlah template ujian per tahun akademik
- Jumlah template raport per tahun akademik
- Jumlah jenis ujian per tahun akademik
- Total data keseluruhan

### 4. **Informasi Sistem**
Card informasi di sebelah kanan menampilkan:
- 🌞 **Semester 1**: Juli - Desember
- ❄️ **Semester 2**: Januari - Juni
- 🔄 Auto-generate berdasarkan kalender
- 📊 Data tersusun rapi per semester

### 5. **Keuntungan Sistem**
- ✅ Tidak perlu input manual
- ✅ Konsisten dengan kalender umum
- ✅ Filter data otomatis
- ✅ Historical data terjaga

## 🎨 Tampilan UI

### Layout:
```
┌─────────────────────────────────────────────────────────────┐
│  Tahun Akademik Otomatis                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────────┐   │
│  │ Selector Tahun       │  │ Sistem Tahun Akademik    │   │
│  │ Akademik             │  │ Otomatis                 │   │
│  │                      │  │                          │   │
│  │ [Dropdown Selector]  │  │ Sistem Otomatis:         │   │
│  │                      │  │ • Semester 1: Jul-Des    │   │
│  │ Statistik:           │  │ • Semester 2: Jan-Jun    │   │
│  │ • Template Ujian: 5  │  │ • Auto-generate          │   │
│  │ • Template Raport: 3 │  │ • Data tersusun rapi     │   │
│  │ • Jenis Ujian: 4     │  │                          │   │
│  └──────────────────────┘  │ Keuntungan:              │   │
│                            │ • Tidak perlu manual     │   │
│                            │ • Konsisten              │   │
│                            │ • Filter otomatis        │   │
│                            └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Cara Penggunaan

### Untuk Admin:

1. **Buka Halaman Template**
   - Navigasi: Dashboard → Admin → Template
   - Tab pertama: "Tahun Akademik Otomatis"

2. **Lihat Tahun Akademik Aktif**
   - Selector menampilkan tahun akademik yang sedang aktif
   - Contoh: "2024/2025 - Semester 1 🌞"

3. **Ganti Tahun Akademik**
   - Klik dropdown selector
   - Pilih tahun akademik yang diinginkan
   - Sistem otomatis update dan refresh data

4. **Lihat Statistik**
   - Statistik ditampilkan di bawah selector
   - Menunjukkan jumlah data per tahun akademik
   - Auto-update saat ganti tahun akademik

## 📊 Komponen Selector

### Props:
```typescript
interface TahunAkademikSelectorProps {
  onTahunAkademikChange?: () => void;  // Callback saat tahun akademik berubah
  showStats?: boolean;                  // Tampilkan statistik
  allowChange?: boolean;                // Izinkan ganti tahun akademik
}
```

### Penggunaan:
```tsx
<TahunAkademikSelector 
  onTahunAkademikChange={() => fetchStats()}
  showStats={true}
  allowChange={true}
/>
```

## 🔄 Flow Kerja

### 1. Load Awal:
```
1. Komponen mount
        ↓
2. Fetch tahun akademik aktif dari API
        ↓
3. Tampilkan di selector
        ↓
4. Fetch statistik data (jika showStats=true)
        ↓
5. Tampilkan statistik
```

### 2. Ganti Tahun Akademik:
```
1. User pilih tahun akademik baru
        ↓
2. Kirim request ke API untuk set aktif
        ↓
3. Update state lokal
        ↓
4. Trigger callback onTahunAkademikChange
        ↓
5. Parent component refresh data
        ↓
6. Statistik auto-update
```

## 🎯 Integrasi dengan Sistem

### Auto-Filter Data:
Semua data di sistem otomatis terfilter berdasarkan tahun akademik aktif:
- Template Ujian
- Template Raport
- Jenis Ujian
- Data Ujian Santri
- Data Raport Santri

### Context Provider:
```typescript
import { useTahunAkademikContext } from '@/hooks/use-tahun-akademik'

function MyComponent() {
  const { tahunAjaranId, activeTahunAkademik } = useTahunAkademikContext()
  
  // Filter data berdasarkan tahunAjaranId
  const filteredData = data.filter(item => item.tahunAjaranId === tahunAjaranId)
}
```

## 📈 Statistik yang Ditampilkan

### Format:
```
📊 Statistik Tahun Akademik 2024/2025 - Semester 1

Template Ujian:    5 template
Template Raport:   3 template
Jenis Ujian:       4 jenis
─────────────────────────────
Total:            12 data
```

### API Endpoint:
```
GET /api/admin/tahun-akademik/stats?tahunAjaranId=1
```

## 🚀 Keunggulan

### ✅ User Experience:
1. **Visual yang Jelas**: Icon semester dan format yang konsisten
2. **Mudah Digunakan**: Dropdown sederhana untuk ganti tahun
3. **Informasi Lengkap**: Statistik dan info sistem di satu tempat
4. **Responsive**: Bekerja di semua ukuran layar

### ✅ Developer Experience:
1. **Reusable Component**: Bisa dipakai di halaman lain
2. **Props Flexible**: Konfigurasi sesuai kebutuhan
3. **Type-Safe**: Full TypeScript support
4. **Context Integration**: Terintegrasi dengan context provider

### ✅ System Benefits:
1. **Konsistensi Data**: Semua data terfilter otomatis
2. **Historical Data**: Data lama tetap tersimpan
3. **Scalable**: Mudah tambah tahun akademik baru
4. **Maintainable**: Kode yang clean dan terstruktur

## ⚠️ Catatan Penting

### Bukan Placeholder!
Text "Selector Tahun Akademik akan ditampilkan di sini" **TIDAK ADA** di implementasi final. Yang ada adalah:
- ✅ Komponen `TahunAkademikSelector` yang sudah lengkap
- ✅ Dropdown untuk pilih tahun akademik
- ✅ Statistik data per tahun akademik
- ✅ Card informasi sistem di sebelah kanan

### Fitur Sudah Aktif:
Semua fitur selector tahun akademik sudah:
- ✅ Terimplementasi penuh
- ✅ Terintegrasi dengan sistem
- ✅ Berfungsi dengan baik
- ✅ Siap digunakan di production

## 🔗 Related Files

### Components:
- `components/admin/tahun-akademik/TahunAkademikSelector.tsx` - Komponen selector
- `components/admin/tahun-akademik/AutoGenerateDialog.tsx` - Dialog auto-generate

### Pages:
- `app/(dashboard)/admin/template/page.tsx` - Halaman template (menggunakan selector)
- `app/(dashboard)/admin/tahun-akademik/page.tsx` - Halaman manajemen tahun akademik

### API:
- `app/api/admin/tahun-akademik/route.ts` - CRUD tahun akademik
- `app/api/admin/tahun-akademik/active/route.ts` - Get/Set tahun akademik aktif
- `app/api/admin/tahun-akademik/stats/route.ts` - Statistik data

### Hooks:
- `hooks/use-tahun-akademik.ts` - React hooks untuk tahun akademik

### Utils:
- `lib/tahun-akademik-utils.ts` - Utility functions
- `lib/tahun-akademik-middleware.ts` - Middleware auto-inject

## 📚 Dokumentasi Terkait

- `DOKUMENTASI_TAHUN_AKADEMIK.md` - Dokumentasi lengkap sistem tahun akademik
- `PERUBAHAN_TAHUN_AKADEMIK_OTOMATIS.md` - Perubahan dari manual ke otomatis

---

**Last Updated**: 2025-11-07  
**Version**: 2.0.0  
**Status**: ✅ Production Ready

**Kesimpulan**: Selector Tahun Akademik adalah fitur lengkap yang sudah terimplementasi, bukan placeholder kosong yang menunggu untuk diisi!
