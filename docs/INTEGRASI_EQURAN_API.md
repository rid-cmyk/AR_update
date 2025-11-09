# Integrasi API Equran.id

## Overview
Sistem mushaf digital telah diintegrasikan dengan API equran.id untuk menampilkan ayat Al-Quran yang asli.

## API Endpoints

### 1. Surat API
**Endpoint:** `/api/quran/surat/[id]`

**Method:** GET

**Parameters:**
- `id`: ID surat (1-114)

**Response:**
```json
{
  "success": true,
  "data": {
    "nomor": 1,
    "nama": "الفاتحة",
    "namaLatin": "Al-Fatihah",
    "jumlahAyat": 7,
    "ayat": [
      {
        "nomorAyat": 1,
        "teksArab": "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ",
        "teksLatin": "bismillāhir-raḥmānir-raḥīm",
        "terjemahan": "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang"
      }
    ]
  }
}
```

**Features:**
- Cache 24 jam untuk performa
- Validasi ID surat
- Proxy ke equran.id API

### 2. Juz API
**Endpoint:** `/api/quran/juz/[id]`

**Method:** GET

**Parameters:**
- `id`: ID juz (1-30)

**Response:**
```json
{
  "success": true,
  "data": {
    "juz": 1,
    "surat": [
      {
        "suratId": 1,
        "namaLatin": "Al-Fatihah",
        "nama": "الفاتحة",
        "ayat": [...]
      }
    ]
  }
}
```

**Features:**
- Mapping juz ke surat dan ayat
- Fetch multiple surat dalam 1 juz
- Filter ayat sesuai range juz

## Komponen MushafDigital

### Props
```typescript
interface MushafDigitalProps {
  juzMulai: number;        // Juz awal (1-30)
  juzSampai: number;       // Juz akhir (1-30)
  tipeUjian: 'per-juz' | 'per-halaman';
  onPageChange?: (pageNumber: number) => void;
  currentPage?: number;
  className?: string;
}
```

### Fitur
- ✅ Ayat asli dari equran.id
- ✅ Teks Arab yang benar
- ✅ Nomor ayat dalam format ﴿١﴾
- ✅ Nama surat dalam bahasa Arab
- ✅ Bismillah otomatis (kecuali At-Taubah)
- ✅ Pagination 15 ayat per halaman
- ✅ Zoom in/out (70%-150%)
- ✅ Navigasi halaman yang smooth

### Format Display
```
﴿ الفاتحة ﴾

بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ

الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿١﴾
الرَّحْمَٰنِ الرَّحِيمِ ﴿٢﴾
مَالِكِ يَوْمِ الدِّينِ ﴿٣﴾
```

## Testing

### Test Script
```bash
node scripts/test-equran-api.js
```

**Expected Output:**
```
✅ Surat API Success!
   Surat: Al-Fatihah (الفاتحة)
   Jumlah Ayat: 7

✅ Juz API Success!
   Juz: 1
   Jumlah Surat: 2
   1. Al-Fatihah (7 ayat)
   2. Al-Baqarah (141 ayat)

✅ Juz 1: 2 surat
✅ Juz 2: 1 surat
✅ Juz 3: 2 surat
```

### Manual Testing
1. Buka browser: http://localhost:3001
2. Login sebagai guru
3. Buat ujian baru dengan tipe "Hafalan"
4. Pilih juz yang ingin ditampilkan
5. Mushaf digital akan menampilkan ayat asli dari equran.id

### Error Handling
Sistem memiliki error handling untuk:
- API tidak tersedia (fallback ke content default)
- Response bukan JSON (warning di console)
- Network error (fallback ke content default)
- Invalid juz ID (error 400)

## Mapping Juz ke Halaman

Setiap juz memiliki sekitar 20 halaman:
- Juz 1: Halaman 1-21
- Juz 2: Halaman 22-41
- Juz 3: Halaman 42-61
- ... dst

## Cache Strategy

API menggunakan Next.js cache dengan revalidate 24 jam:
```typescript
fetch(url, {
  next: { revalidate: 86400 } // 24 jam
})
```

## Error Handling

Jika API equran.id tidak tersedia, sistem akan menampilkan fallback content dengan ayat-ayat dari Al-Fatihah dan Al-Baqarah.

## Dependencies

- Next.js 14+ (App Router)
- Ant Design 5+
- Fetch API (built-in)

## External API

**Source:** https://equran.id/api/v2

**Documentation:** https://github.com/rzkytmgr/quran-api-id

**Rate Limit:** Tidak ada (gratis)

**Availability:** 99.9% uptime
