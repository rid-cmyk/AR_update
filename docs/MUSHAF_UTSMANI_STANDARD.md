# Mushaf Utsmani Standard - 15 Baris Per Halaman

## Overview
Mushaf Utsmani adalah standar penulisan Al-Quran yang paling umum digunakan, dengan karakteristik:
- **15 baris per halaman** (kecuali halaman khusus)
- **604 halaman** total
- **30 juz**
- Format rasm Utsmani

## Halaman Khusus

### Halaman 1: Surat Al-Fatihah
- **1 halaman penuh** untuk Al-Fatihah (7 ayat)
- Tidak mengikuti aturan 15 baris
- Halaman khusus dengan layout centered

### Halaman 2: Al-Baqarah 1-5
- **1 halaman penuh** untuk 5 ayat pertama Al-Baqarah
- Ayat 1-5 saja
- Layout khusus

### Halaman 3-604: Standard 15 Baris
- Setiap halaman berisi **15 baris**
- Ayat disesuaikan dengan baris
- Mengikuti rasm Utsmani

## Struktur Per Juz

### Juz 1 (Halaman 1-21)
```
Halaman 1:  Al-Fatihah 1-7 (khusus)
Halaman 2:  Al-Baqarah 1-5 (khusus)
Halaman 3:  Al-Baqarah 6-... (15 baris)
Halaman 4:  Al-Baqarah ... (15 baris)
...
Halaman 21: Al-Baqarah ... (15 baris)
```

### Juz 2-30 (Halaman 22-604)
```
Setiap halaman: 15 baris standar
```

## Implementasi

### 1. Halaman Khusus
```typescript
const SPECIAL_PAGES = {
  1: {
    type: 'al-fatihah',
    surah: 1,
    ayatStart: 1,
    ayatEnd: 7,
    lines: 'full-page' // Tidak 15 baris
  },
  2: {
    type: 'al-baqarah-opening',
    surah: 2,
    ayatStart: 1,
    ayatEnd: 5,
    lines: 'full-page' // Tidak 15 baris
  }
};
```

### 2. Halaman Standard (15 Baris)
```typescript
const STANDARD_PAGE = {
  lines: 15,
  averageAyatPerLine: 1-2, // Tergantung panjang ayat
  layout: 'justified'
};
```

## Mapping Ayat ke Halaman

### Prinsip Dasar
1. **Halaman 1**: Al-Fatihah lengkap
2. **Halaman 2**: Al-Baqarah 1-5
3. **Halaman 3+**: 15 baris per halaman

### Contoh Distribusi

#### Halaman 1 (Khusus)
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
```

#### Halaman 2 (Khusus)
```
﴿ البقرة ﴾

بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ

الم ﴿١﴾
ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ ﴿٢﴾
الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ ﴿٣﴾
وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ ﴿٤﴾
وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ ﴿٥﴾
```

#### Halaman 3+ (15 Baris Standard)
```
[Baris 1] وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ ﴿٦﴾
[Baris 2] أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ ﴿٧﴾
[Baris 3] إِنَّ الَّذِينَ كَفَرُوا سَوَاءٌ عَلَيْهِمْ أَأَنذَرْتَهُمْ ﴿٨﴾
...
[Baris 15] ... (ayat terakhir di halaman ini)
```

## Navigation untuk Per-Halaman

### Jika Rentang Juz > 1

#### Navigasi Halaman
```
[← Halaman Sebelumnya] [Halaman X dari Y] [Halaman Selanjutnya →]
```

#### Navigasi Juz (Tambahan)
```
[← Juz Sebelumnya] [Juz X] [Juz Selanjutnya →]
```

### Contoh: Juz 1-3 (63 halaman)
```
Halaman 1:  Juz 1, Al-Fatihah
Halaman 2:  Juz 1, Al-Baqarah 1-5
Halaman 3:  Juz 1, Al-Baqarah 6-...
...
Halaman 21: Juz 1, Al-Baqarah ...
Halaman 22: Juz 2, Al-Baqarah ... [Button: Next Juz]
...
Halaman 41: Juz 2, Al-Baqarah ...
Halaman 42: Juz 3, Al-Baqarah ... [Button: Next Juz]
...
Halaman 61: Juz 3, Ali Imran ...
```

## Implementation Strategy

### 1. Detect Special Pages
```typescript
function isSpecialPage(page: number): boolean {
  return page === 1 || page === 2;
}

function getSpecialPageContent(page: number) {
  if (page === 1) {
    return getAlFatihahFullPage();
  }
  if (page === 2) {
    return getAlBaqarah1to5FullPage();
  }
  return null;
}
```

### 2. Standard 15-Line Pages
```typescript
function getStandardPageContent(page: number) {
  // Get ayat for this page
  // Format into 15 lines
  // Return formatted content
}
```

### 3. Navigation Logic
```typescript
function shouldShowJuzNavigation(
  tipeUjian: string,
  juzMulai: number,
  juzSampai: number
): boolean {
  return tipeUjian === 'per-halaman' && juzSampai > juzMulai;
}
```

## Benefits

### Accuracy
- ✅ Sesuai dengan Mushaf Utsmani standar
- ✅ 15 baris per halaman (kecuali khusus)
- ✅ Layout yang familiar untuk penghafal

### User Experience
- ✅ Navigasi halaman yang jelas
- ✅ Navigasi juz tambahan untuk rentang > 1
- ✅ Mudah untuk ujian per halaman

### Flexibility
- ✅ Support per-juz (seluruh juz)
- ✅ Support per-halaman (15 baris)
- ✅ Special handling untuk halaman khusus

## Testing Checklist

### Special Pages
- [ ] Halaman 1: Al-Fatihah lengkap
- [ ] Halaman 2: Al-Baqarah 1-5
- [ ] Layout centered dan indah

### Standard Pages
- [ ] Halaman 3+: 15 baris
- [ ] Ayat terdistribusi dengan benar
- [ ] Nomor ayat ditampilkan

### Navigation
- [ ] Per-halaman: Prev/Next halaman
- [ ] Per-halaman + multi-juz: Prev/Next juz
- [ ] Dropdown selector berfungsi
- [ ] Auto-scroll ke halaman pertama juz

## References

- Mushaf Utsmani Standard
- Mushaf Madinah
- Mushaf Indonesia (Kemenag)

---

**Note**: Implementasi ini mengikuti standar Mushaf Utsmani yang paling umum digunakan di Indonesia dan dunia Islam.
