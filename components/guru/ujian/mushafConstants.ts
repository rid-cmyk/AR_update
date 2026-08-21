export const toArabicDigits = (num: number) => num.toString().replace(/\d/g, (d: any) => '٠١٢٣٤٥٦٧٨٩'[d]);

export const JUZ_TO_PAGE_MAPPING: Record<number, { start: number; end: number; surah: string }> = {
  1: { start: 1, end: 21, surah: 'Al-Fatihah' },
  2: { start: 22, end: 41, surah: 'Al-Baqarah' },
  3: { start: 42, end: 61, surah: 'Al-Baqarah' },
  4: { start: 62, end: 81, surah: 'Ali Imran' },
  5: { start: 82, end: 101, surah: 'An-Nisa' },
  6: { start: 102, end: 121, surah: 'An-Nisa' },
  7: { start: 122, end: 141, surah: 'Al-Maidah' },
  8: { start: 142, end: 161, surah: 'Al-An\'am' },
  9: { start: 162, end: 181, surah: 'Al-A\'raf' },
  10: { start: 182, end: 201, surah: 'Al-Anfal' },
  11: { start: 202, end: 221, surah: 'At-Taubah' },
  12: { start: 222, end: 241, surah: 'Yunus' },
  13: { start: 242, end: 261, surah: 'Yusuf' },
  14: { start: 262, end: 281, surah: 'Al-Hijr' },
  15: { start: 282, end: 301, surah: 'Al-Isra' },
  16: { start: 302, end: 321, surah: 'Al-Kahf' },
  17: { start: 322, end: 341, surah: 'Al-Anbiya' },
  18: { start: 342, end: 361, surah: 'Al-Mu\'minun' },
  19: { start: 362, end: 381, surah: 'Al-Furqan' },
  20: { start: 382, end: 401, surah: 'An-Naml' },
  21: { start: 402, end: 421, surah: 'Al-Ankabut' },
  22: { start: 422, end: 441, surah: 'Ahzab' },
  23: { start: 442, end: 461, surah: 'Ya-Sin' },
  24: { start: 462, end: 481, surah: 'Az-Zumar' },
  25: { start: 482, end: 501, surah: 'Fussilat' },
  26: { start: 502, end: 521, surah: 'Al-Ahqaf' },
  27: { start: 522, end: 541, surah: 'Adh-Dhariyat' },
  28: { start: 542, end: 561, surah: 'Al-Mujadila' },
  29: { start: 562, end: 581, surah: 'Al-Mulk' },
  30: { start: 582, end: 604, surah: 'An-Naba' }
};

export interface AyahItem {
  numberInSurah: number;
  text: string;
  translation?: string;
  audioUrl?: string;
  surahName?: string;
  surahLatinName?: string;
  surahNumber?: number;
}

export const getJuzPagesRange = (juz: number): { start: number; end: number } =>
  JUZ_TO_PAGE_MAPPING[juz] || { start: 1, end: 21 };

export const getJuzPages = (juz: number): number[] => {
  const { start, end } = getJuzPagesRange(juz);
  const pages: number[] = [];
  for (let p = start; p <= end; p++) {
    pages.push(p);
  }
  return pages;
};
