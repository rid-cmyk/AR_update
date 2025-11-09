# Navigasi Mushaf Digital - Lengkap

## Overview
Mushaf Digital memiliki sistem navigasi yang cerdas dan adaptif berdasarkan mode dan rentang juz yang dipilih.

---

## Mode Per-Juz

### Juz Tunggal (Juz 1 saja)
```
┌─────────────────────────────────────────┐
│         المصحف الشريف                    │
│         📚 الجزء 1                       │
├─────────────────────────────────────────┤
│                                         │
│   [Seluruh ayat Juz 1 ditampilkan]     │
│   - Al-Fatihah (7 ayat)                │
│   - Al-Baqarah 1-141 (141 ayat)        │
│                                         │
├─────────────────────────────────────────┤
│  ❌ Tidak ada navigasi juz              │
│  (Hanya 1 juz)                          │
└─────────────────────────────────────────┘
```

### Multi-Juz (Juz 1-3)
```
┌─────────────────────────────────────────┐
│         المصحف الشريف                    │
│         📚 الجزء 1-3                     │
├─────────────────────────────────────────┤
│                                         │
│   [Seluruh ayat Juz 1 ditampilkan]     │
│                                         │
├─────────────────────────────────────────┤
│  ✅ NAVIGASI JUZ                        │
│  [← الجزء السابق] [الجزء 1] [الجزء التالي →] │
│        (disabled)      (active)   (enabled)  │
└─────────────────────────────────────────┘
```

---

## Mode Per-Halaman

### Juz Tunggal (Juz 1 saja)
```
┌─────────────────────────────────────────┐
│         المصحف الشريف                    │
│         📄 Per Halaman                   │
├─────────────────────────────────────────┤
│         صفحة 1                          │
│                                         │
│   [Ayat untuk halaman 1]               │
│   - Al-Fatihah 1-7                     │
│                                         │
├─────────────────────────────────────────┤
│  ❌ Tidak ada navigasi juz              │
│  (Hanya 1 juz)                          │
│                                         │
│  ✅ NAVIGASI HALAMAN                    │
│  [← الصفحة السابقة] [الصفحة 1] [الصفحة التالية →] │
│        (disabled)      (1/21)     (enabled)    │
└─────────────────────────────────────────┘
```

### Multi-Juz (Juz 1-3) - FITUR UTAMA!
```
┌─────────────────────────────────────────┐
│         المصحف الشريف                    │
│         📄 Per Halaman                   │
│         📚 الجزء 1-3                     │
├─────────────────────────────────────────┤
│         صفحة 1 (Juz 1)                  │
│                                         │
│   [Ayat untuk halaman 1]               │
│   - Al-Fatihah 1-7                     │
│                                         │
├─────────────────────────────────────────┤
│  ✅ NAVIGASI JUZ (Muncul!)              │
│  [← الجزء السابق] [الجزء 1] [الجزء التالي →] │
│        (disabled)      (1/3)      (enabled)  │
│                                         │
│  ✅ NAVIGASI HALAMAN                    │
│  [← الصفحة السابقة] [الصفحة 1] [الصفحة التالية →] │
│        (disabled)      (1/63)     (enabled)    │
└─────────────────────────────────────────┘
```

---

## Kondisi Navigasi

### Navigasi Juz Muncul Jika:
```typescript
// Kondisi: juzSampai > juzMulai
// Berlaku untuk SEMUA mode (per-juz DAN per-halaman)

if (juzSampai > juzMulai) {
  // Tampilkan navigasi juz
  return (
    <Card>
      <Button onClick={handlePrevJuz}>الجزء السابق</Button>
      <Text>الجزء {activeJuz}</Text>
      <Button onClick={handleNextJuz}>الجزء التالي</Button>
    </Card>
  )
}
```

### Navigasi Halaman Muncul Jika:
```typescript
// Kondisi: tipeUjian === 'per-halaman'
// Selalu muncul untuk mode per-halaman

if (tipeUjian === 'per-halaman') {
  return (
    <Card>
      <Button onClick={handlePrevPage}>الصفحة السابقة</Button>
      <Select value={currentPage}>...</Select>
      <Button onClick={handleNextPage}>الصفحة التالية</Button>
    </Card>
  )
}
```

---

## Skenario Lengkap

### Skenario 1: Per-Juz, Juz 1
```
Mode: per-juz
Juz: 1 (tunggal)

Navigasi:
❌ Navigasi Juz: Tidak ada
❌ Navigasi Halaman: Tidak ada

Views: 1 view (seluruh Juz 1)
```

### Skenario 2: Per-Juz, Juz 1-3
```
Mode: per-juz
Juz: 1-3 (multi)

Navigasi:
✅ Navigasi Juz: Ada (3 juz)
❌ Navigasi Halaman: Tidak ada

Views: 3 views (Juz 1, 2, 3)
```

### Skenario 3: Per-Halaman, Juz 1
```
Mode: per-halaman
Juz: 1 (tunggal)

Navigasi:
❌ Navigasi Juz: Tidak ada
✅ Navigasi Halaman: Ada (21 halaman)

Views: 21 views (halaman 1-21)
```

### Skenario 4: Per-Halaman, Juz 1-3 ⭐
```
Mode: per-halaman
Juz: 1-3 (multi)

Navigasi:
✅ Navigasi Juz: Ada (3 juz) ← FITUR INI!
✅ Navigasi Halaman: Ada (63 halaman)

Views: 63 views (halaman 1-63)

Contoh Flow:
1. User di halaman 1 (Juz 1)
2. Klik "Next Halaman" → Halaman 2 (Juz 1)
3. Klik "Next Halaman" 19x → Halaman 21 (Juz 1)
4. Klik "Next Halaman" → Halaman 22 (Juz 2) ← Auto update activeJuz
5. ATAU klik "Next Juz" → Langsung ke halaman 22 (Juz 2)
```

---

## Auto-Update activeJuz

### Logic
```typescript
// activeJuz ter-update otomatis saat:
// 1. User navigasi halaman (prev/next)
// 2. User pilih halaman dari dropdown
// 3. User klik button juz (prev/next)

useEffect(() => {
  const currentPageData = getCurrentPage();
  if (currentPageData && currentPageData.juz !== activeJuz) {
    setActiveJuz(currentPageData.juz);
  }
}, [currentPage, pages]);
```

### Contoh
```
Halaman 1-21: activeJuz = 1
Halaman 22-41: activeJuz = 2
Halaman 42-61: activeJuz = 3

User di halaman 20 → activeJuz = 1
User klik "Next Halaman" → halaman 21 → activeJuz = 1
User klik "Next Halaman" → halaman 22 → activeJuz = 2 (auto-update!)
```

---

## Button States

### Button "الجزء السابق"
```typescript
disabled={activeJuz <= juzMulai}

// Contoh: Juz 1-3
// activeJuz = 1 → disabled (tidak bisa ke juz 0)
// activeJuz = 2 → enabled (bisa ke juz 1)
// activeJuz = 3 → enabled (bisa ke juz 2)
```

### Button "الجزء التالي"
```typescript
disabled={activeJuz >= juzSampai}

// Contoh: Juz 1-3
// activeJuz = 1 → enabled (bisa ke juz 2)
// activeJuz = 2 → enabled (bisa ke juz 3)
// activeJuz = 3 → disabled (tidak bisa ke juz 4)
```

### Button "الصفحة السابقة"
```typescript
disabled={currentPage <= pages[0]?.pageNumber}

// Contoh: Halaman 1-63
// currentPage = 1 → disabled
// currentPage = 2 → enabled
// currentPage = 63 → enabled
```

### Button "الصفحة التالية"
```typescript
disabled={currentPage >= pages[pages.length - 1]?.pageNumber}

// Contoh: Halaman 1-63
// currentPage = 1 → enabled
// currentPage = 62 → enabled
// currentPage = 63 → disabled
```

---

## Visual Flow

### Per-Halaman, Juz 1-3 (63 halaman)

```
Halaman 1 (Juz 1)
    ↓ [Next Halaman]
Halaman 2 (Juz 1)
    ↓ [Next Halaman]
    ...
Halaman 21 (Juz 1)
    ↓ [Next Halaman] atau [Next Juz]
Halaman 22 (Juz 2) ← activeJuz auto-update ke 2
    ↓ [Next Halaman]
Halaman 23 (Juz 2)
    ↓ [Next Halaman]
    ...
Halaman 41 (Juz 2)
    ↓ [Next Halaman] atau [Next Juz]
Halaman 42 (Juz 3) ← activeJuz auto-update ke 3
    ↓ [Next Halaman]
    ...
Halaman 61 (Juz 3)
```

---

## Benefits

### User Experience
- ✅ Navigasi intuitif
- ✅ Dua cara navigasi (halaman & juz)
- ✅ Auto-update juz saat navigasi halaman
- ✅ Button disabled yang jelas

### Flexibility
- ✅ Support single juz
- ✅ Support multi-juz
- ✅ Support per-juz mode
- ✅ Support per-halaman mode

### Consistency
- ✅ Navigasi konsisten di semua mode
- ✅ Logic yang jelas dan predictable
- ✅ State management yang baik

---

## Testing Checklist

### Per-Juz Mode
- [ ] Single juz: Tidak ada navigasi juz
- [ ] Multi-juz: Ada navigasi juz
- [ ] Button prev/next berfungsi
- [ ] activeJuz ter-update

### Per-Halaman Mode
- [ ] Single juz: Hanya navigasi halaman
- [ ] Multi-juz: Navigasi halaman + juz
- [ ] Button prev/next halaman berfungsi
- [ ] Button prev/next juz berfungsi
- [ ] activeJuz auto-update saat navigasi halaman
- [ ] Dropdown selector berfungsi

### Edge Cases
- [ ] Halaman pertama: Prev disabled
- [ ] Halaman terakhir: Next disabled
- [ ] Juz pertama: Prev juz disabled
- [ ] Juz terakhir: Next juz disabled
- [ ] Navigasi dari juz 1 ke juz 2: Auto ke halaman 22
- [ ] Navigasi dari juz 2 ke juz 3: Auto ke halaman 42

---

**Status**: ✅ Fully Implemented
**Version**: 1.0.0
**Last Updated**: November 2025
