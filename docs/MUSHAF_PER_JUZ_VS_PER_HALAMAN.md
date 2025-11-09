# Mushaf Digital: Per-Juz vs Per-Halaman

## Overview
Mushaf Digital mendukung dua mode tampilan yang berbeda sesuai dengan tipe ujian:
1. **Per-Juz**: Menampilkan seluruh ayat dalam satu juz
2. **Per-Halaman**: Menampilkan ayat per halaman mushaf (20-23 halaman per juz)

## Mode Per-Juz

### Karakteristik
- Menampilkan **seluruh ayat** dalam satu juz dalam satu view
- Cocok untuk ujian hafalan juz lengkap
- Navigasi antar juz (bukan per halaman)
- Scroll untuk melihat semua ayat dalam juz

### Contoh Display
```
﴿ الفاتحة ﴾

بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ

الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿١﴾
الرَّحْمَٰنِ الرَّحِيمِ ﴿٢﴾
...
[Semua 7 ayat Al-Fatihah]

﴿ البقرة ﴾

بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ

الم ﴿١﴾
ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ ﴿٢﴾
...
[Semua 141 ayat Al-Baqarah dalam Juz 1]
```

### Header Info
- **Top**: "الجزء ١" (Juz 1)
- **Left**: Nama surat pertama
- **Center**: Nomor juz
- **Right**: Range ayat (e.g., "آية ١-١٤٨")

### Navigation
- **Button**: "الجزء السابق" / "الجزء التالي"
- **Selector**: "الجزء: [dropdown]"
- **Info**: "عرض الجزء ١ من ٣ جزء"

### Use Case
```typescript
<MushafDigital
  juzMulai={1}
  juzSampai={3}
  tipeUjian="per-juz"  // Mode Per-Juz
  currentPage={1}
  onPageChange={setCurrentPage}
/>
```

**Result**: 
- 3 views (Juz 1, Juz 2, Juz 3)
- Setiap view menampilkan seluruh ayat dalam juz tersebut
- Total ayat per view: ~148-564 ayat

## Mode Per-Halaman

### Karakteristik
- Menampilkan ayat **per halaman mushaf** standar
- Cocok untuk ujian hafalan per halaman
- Navigasi per halaman (20-23 halaman per juz)
- Setiap halaman ~7-25 ayat

### Contoh Display
```
﴿ الفاتحة ﴾

بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ

الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿١﴾
الرَّحْمَٰنِ الرَّحِيمِ ﴿٢﴾
مَالِكِ يَوْمِ الدِّينِ ﴿٣﴾
إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٤﴾
اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٥﴾
صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ ﴿٦﴾
غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾

﴿ البقرة ﴾

بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ

الم ﴿١﴾
[Hanya beberapa ayat pertama Al-Baqarah]
```

### Header Info
- **Top**: "صفحة ١" (Page 1)
- **Left**: Nama surat
- **Center**: Nomor juz
- **Right**: Range ayat (e.g., "آية ١-٧")

### Navigation
- **Button**: "الصفحة السابقة" / "الصفحة التالية"
- **Selector**: "الصفحة: [dropdown]"
- **Info**: "عرض الصفحة ١ من ٦٣ صفحة • الجزء ١"

### Use Case
```typescript
<MushafDigital
  juzMulai={1}
  juzSampai={3}
  tipeUjian="per-halaman"  // Mode Per-Halaman
  currentPage={1}
  onPageChange={setCurrentPage}
/>
```

**Result**:
- 63 views (21 + 20 + 22 halaman)
- Setiap view menampilkan ~7-25 ayat
- Total halaman: Juz 1 (21) + Juz 2 (20) + Juz 3 (22)

## Comparison Table

| Feature | Per-Juz | Per-Halaman |
|---------|---------|-------------|
| **Views** | 1 per juz | 20-23 per juz |
| **Ayat per View** | 148-564 ayat | 7-25 ayat |
| **Scrolling** | Panjang (banyak ayat) | Pendek (sedikit ayat) |
| **Navigation** | Antar juz | Antar halaman |
| **Header** | "الجزء ١" | "صفحة ١" |
| **Use Case** | Ujian juz lengkap | Ujian per halaman |
| **Total Views (Juz 1-3)** | 3 views | 63 views |

## Implementation Details

### Per-Juz Mode
```typescript
const generateJuzContent = async (juz: number): Promise<string> => {
  // Fetch seluruh juz
  const response = await fetch(`/api/quran/juz/${juz}`);
  const result = await response.json();
  
  // Tampilkan SEMUA ayat dalam juz
  result.data.surat.forEach((surat: any) => {
    lines.push(`﴿ ${surat.nama} ﴾`)
    
    // Tampilkan SEMUA ayat
    surat.ayat.forEach((ayat: any) => {
      lines.push(`${ayat.teksArab} ﴿${ayat.nomorAyat}﴾`)
    })
  })
  
  return lines.join('\n')
}
```

### Per-Halaman Mode
```typescript
const generatePageContent = async (pageNumber: number, juz: number): Promise<string> => {
  // Fetch juz
  const response = await fetch(`/api/quran/juz/${juz}`);
  const result = await response.json();
  
  // Kumpulkan semua ayat
  const allAyat = []
  result.data.surat.forEach((surat: any) => {
    surat.ayat.forEach((ayat: any) => {
      allAyat.push(ayat)
    })
  })
  
  // Hitung ayat per halaman
  const ayatPerPage = Math.ceil(allAyat.length / totalPages)
  const pageAyat = allAyat.slice(startIdx, endIdx)
  
  // Tampilkan hanya ayat untuk halaman ini
  return formatAyat(pageAyat)
}
```

## Loading Strategy

### Per-Juz
```typescript
if (tipeUjian === 'per-juz') {
  for (let juz = juzMulai; juz <= juzSampai; juz++) {
    const content = await generateJuzContent(juz);
    allPages.push({
      pageNumber: juz,
      juz: juz,
      content: content  // Seluruh juz
    });
  }
}
```

### Per-Halaman
```typescript
if (tipeUjian === 'per-halaman') {
  for (let juz = juzMulai; juz <= juzSampai; juz++) {
    for (let page = startPage; page <= endPage; page++) {
      const content = await generatePageContent(page, juz);
      allPages.push({
        pageNumber: page,
        juz: juz,
        content: content  // Hanya halaman ini
      });
    }
  }
}
```

## Performance Considerations

### Per-Juz
- **Pros**: 
  - Fewer API calls (1 per juz)
  - Simpler navigation
  - Better for continuous reading
- **Cons**: 
  - Larger content per view
  - More scrolling required
  - Higher memory usage per view

### Per-Halaman
- **Pros**: 
  - Smaller content per view
  - Less scrolling
  - Lower memory per view
  - More granular navigation
- **Cons**: 
  - More API calls (20-23 per juz)
  - More complex pagination
  - More views to manage

## Best Practices

### When to Use Per-Juz
- ✅ Ujian hafalan juz lengkap
- ✅ Review seluruh juz
- ✅ Muraja'ah juz
- ✅ Santri sudah hafal juz lengkap

### When to Use Per-Halaman
- ✅ Ujian hafalan per halaman
- ✅ Tahfidz bertahap
- ✅ Santri masih menghafal
- ✅ Evaluasi detail per halaman

## Testing

### Test Per-Juz
```bash
# Start dev server
npm run dev

# Navigate to ujian page
# Select tipeUjian: "per-juz"
# Select juzMulai: 1, juzSampai: 3
# Expected: 3 views (Juz 1, 2, 3)
```

### Test Per-Halaman
```bash
# Start dev server
npm run dev

# Navigate to ujian page
# Select tipeUjian: "per-halaman"
# Select juzMulai: 1, juzSampai: 3
# Expected: 63 views (21 + 20 + 22 pages)
```

## API Endpoints Used

Both modes use the same API:
```
GET /api/quran/juz/[id]
```

The difference is in how the data is processed:
- **Per-Juz**: Display all ayat from response
- **Per-Halaman**: Slice ayat into pages

## Future Enhancements

### Per-Juz Mode
- [ ] Add section markers (Rub', Nisf, etc.)
- [ ] Add juz summary at the end
- [ ] Add total ayat count
- [ ] Add estimated reading time

### Per-Halaman Mode
- [ ] Match exact mushaf page layout
- [ ] Add page markers
- [ ] Add tajwid highlighting
- [ ] Add footnotes

---

**Last Updated**: November 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
