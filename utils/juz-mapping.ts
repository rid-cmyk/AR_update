// 📚 Data Mapping Juz ke Surat dan Ayat
// Sumber: Mushaf Al-Quran standar 30 Juz

export interface JuzMapping {
  juzNumber: number;
  suratName: string;
  ayatMulai: number;
  ayatSelesai: number;
  totalAyat: number;
}

export const JUZ_MAPPING: JuzMapping[] = [
  // JUZ 1 (148 ayat total)
  { juzNumber: 1, suratName: 'Al-Fatihah', ayatMulai: 1, ayatSelesai: 7, totalAyat: 7 },
  { juzNumber: 1, suratName: 'Al-Baqarah', ayatMulai: 1, ayatSelesai: 141, totalAyat: 141 },

  // JUZ 2 (111 ayat total)
  { juzNumber: 2, suratName: 'Al-Baqarah', ayatMulai: 142, ayatSelesai: 252, totalAyat: 111 },

  // JUZ 3 (126 ayat total)
  { juzNumber: 3, suratName: 'Al-Baqarah', ayatMulai: 253, ayatSelesai: 286, totalAyat: 34 },
  { juzNumber: 3, suratName: 'Ali-Imran', ayatMulai: 1, ayatSelesai: 92, totalAyat: 92 },

  // JUZ 4 (131 ayat total)
  { juzNumber: 4, suratName: 'Ali-Imran', ayatMulai: 93, ayatSelesai: 200, totalAyat: 108 },
  { juzNumber: 4, suratName: 'An-Nisa', ayatMulai: 1, ayatSelesai: 23, totalAyat: 23 },

  // JUZ 5 (124 ayat total)
  { juzNumber: 5, suratName: 'An-Nisa', ayatMulai: 24, ayatSelesai: 147, totalAyat: 124 },

  // JUZ 6 (111 ayat total)
  { juzNumber: 6, suratName: 'An-Nisa', ayatMulai: 148, ayatSelesai: 176, totalAyat: 29 },
  { juzNumber: 6, suratName: 'Al-Maidah', ayatMulai: 1, ayatSelesai: 82, totalAyat: 82 },

  // JUZ 7 (149 ayat total)
  { juzNumber: 7, suratName: 'Al-Maidah', ayatMulai: 83, ayatSelesai: 120, totalAyat: 38 },
  { juzNumber: 7, suratName: 'Al-An\'am', ayatMulai: 1, ayatSelesai: 110, totalAyat: 110 },
  { juzNumber: 7, suratName: 'Al-A\'raf', ayatMulai: 1, ayatSelesai: 1, totalAyat: 1 },

  // JUZ 8 (142 ayat total)
  { juzNumber: 8, suratName: 'Al-An\'am', ayatMulai: 111, ayatSelesai: 165, totalAyat: 55 },
  { juzNumber: 8, suratName: 'Al-A\'raf', ayatMulai: 1, ayatSelesai: 87, totalAyat: 87 },

  // JUZ 9 (129 ayat total)
  { juzNumber: 9, suratName: 'Al-A\'raf', ayatMulai: 88, ayatSelesai: 206, totalAyat: 119 },
  { juzNumber: 9, suratName: 'Al-Anfal', ayatMulai: 1, ayatSelesai: 40, totalAyat: 40 },

  // JUZ 10 (129 ayat total)
  { juzNumber: 10, suratName: 'Al-Anfal', ayatMulai: 41, ayatSelesai: 75, totalAyat: 35 },
  { juzNumber: 10, suratName: 'At-Taubah', ayatMulai: 1, ayatSelesai: 92, totalAyat: 92 },

  // JUZ 11 (148 ayat total)
  { juzNumber: 11, suratName: 'At-Taubah', ayatMulai: 93, ayatSelesai: 129, totalAyat: 37 },
  { juzNumber: 11, suratName: 'Yunus', ayatMulai: 1, ayatSelesai: 109, totalAyat: 109 },
  { juzNumber: 11, suratName: 'Hud', ayatMulai: 1, ayatSelesai: 5, totalAyat: 5 },

  // JUZ 12 (111 ayat total)
  { juzNumber: 12, suratName: 'Hud', ayatMulai: 6, ayatSelesai: 123, totalAyat: 118 },
  { juzNumber: 12, suratName: 'Yusuf', ayatMulai: 1, ayatSelesai: 52, totalAyat: 52 },

  // JUZ 13 (146 ayat total)
  { juzNumber: 13, suratName: 'Yusuf', ayatMulai: 53, ayatSelesai: 111, totalAyat: 59 },
  { juzNumber: 13, suratName: 'Ar-Ra\'d', ayatMulai: 1, ayatSelesai: 43, totalAyat: 43 },
  { juzNumber: 13, suratName: 'Ibrahim', ayatMulai: 1, ayatSelesai: 52, totalAyat: 52 },

  // JUZ 14 (123 ayat total)
  { juzNumber: 14, suratName: 'Al-Hijr', ayatMulai: 1, ayatSelesai: 99, totalAyat: 99 },
  { juzNumber: 14, suratName: 'An-Nahl', ayatMulai: 1, ayatSelesai: 50, totalAyat: 50 },

  // JUZ 15 (145 ayat total)
  { juzNumber: 15, suratName: 'An-Nahl', ayatMulai: 51, ayatSelesai: 128, totalAyat: 78 },
  { juzNumber: 15, suratName: 'Al-Isra', ayatMulai: 1, ayatSelesai: 111, totalAyat: 111 },

  // JUZ 16 (128 ayat total)
  { juzNumber: 16, suratName: 'Al-Kahf', ayatMulai: 1, ayatSelesai: 110, totalAyat: 110 },
  { juzNumber: 16, suratName: 'Maryam', ayatMulai: 1, ayatSelesai: 98, totalAyat: 98 },

  // JUZ 17 (140 ayat total)
  { juzNumber: 17, suratName: 'Taha', ayatMulai: 1, ayatSelesai: 135, totalAyat: 135 },
  { juzNumber: 17, suratName: 'Al-Anbiya', ayatMulai: 1, ayatSelesai: 112, totalAyat: 112 },

  // JUZ 18 (139 ayat total)
  { juzNumber: 18, suratName: 'Al-Hajj', ayatMulai: 1, ayatSelesai: 78, totalAyat: 78 },
  { juzNumber: 18, suratName: 'Al-Mu\'minun', ayatMulai: 1, ayatSelesai: 118, totalAyat: 118 },

  // JUZ 19 (154 ayat total)
  { juzNumber: 19, suratName: 'An-Nur', ayatMulai: 1, ayatSelesai: 64, totalAyat: 64 },
  { juzNumber: 19, suratName: 'Al-Furqan', ayatMulai: 1, ayatSelesai: 77, totalAyat: 77 },
  { juzNumber: 19, suratName: 'Ash-Shu\'ara', ayatMulai: 1, ayatSelesai: 227, totalAyat: 227 },

  // JUZ 20 (131 ayat total)
  { juzNumber: 20, suratName: 'An-Naml', ayatMulai: 1, ayatSelesai: 93, totalAyat: 93 },
  { juzNumber: 20, suratName: 'Al-Qasas', ayatMulai: 1, ayatSelesai: 88, totalAyat: 88 },

  // JUZ 21 (125 ayat total)
  { juzNumber: 21, suratName: 'Al-\'Ankabut', ayatMulai: 1, ayatSelesai: 69, totalAyat: 69 },
  { juzNumber: 21, suratName: 'Ar-Rum', ayatMulai: 1, ayatSelesai: 60, totalAyat: 60 },
  { juzNumber: 21, suratName: 'Luqman', ayatMulai: 1, ayatSelesai: 34, totalAyat: 34 },
  { juzNumber: 21, suratName: 'As-Sajdah', ayatMulai: 1, ayatSelesai: 30, totalAyat: 30 },

  // JUZ 22 (78 ayat total)
  { juzNumber: 22, suratName: 'Al-Ahzab', ayatMulai: 1, ayatSelesai: 73, totalAyat: 73 },
  { juzNumber: 22, suratName: 'Saba', ayatMulai: 1, ayatSelesai: 54, totalAyat: 54 },
  { juzNumber: 22, suratName: 'Fatir', ayatMulai: 1, ayatSelesai: 45, totalAyat: 45 },

  // JUZ 23 (78 ayat total)
  { juzNumber: 23, suratName: 'Ya-Sin', ayatMulai: 1, ayatSelesai: 83, totalAyat: 83 },
  { juzNumber: 23, suratName: 'As-Saffat', ayatMulai: 1, ayatSelesai: 182, totalAyat: 182 },

  // JUZ 24 (171 ayat total)
  { juzNumber: 24, suratName: 'Sad', ayatMulai: 1, ayatSelesai: 88, totalAyat: 88 },
  { juzNumber: 24, suratName: 'Az-Zumar', ayatMulai: 1, ayatSelesai: 75, totalAyat: 75 },

  // JUZ 25 (77 ayat total)
  { juzNumber: 25, suratName: 'Ghafir', ayatMulai: 1, ayatSelesai: 85, totalAyat: 85 },
  { juzNumber: 25, suratName: 'Fussilat', ayatMulai: 1, ayatSelesai: 54, totalAyat: 54 },

  // JUZ 26 (109 ayat total)
  { juzNumber: 26, suratName: 'Ash-Shura', ayatMulai: 1, ayatSelesai: 53, totalAyat: 53 },
  { juzNumber: 26, suratName: 'Az-Zukhruf', ayatMulai: 1, ayatSelesai: 89, totalAyat: 89 },
  { juzNumber: 26, suratName: 'Ad-Dukhan', ayatMulai: 1, ayatSelesai: 59, totalAyat: 59 },

  // JUZ 27 (114 ayat total)
  { juzNumber: 27, suratName: 'Al-Jathiyah', ayatMulai: 1, ayatSelesai: 37, totalAyat: 37 },
  { juzNumber: 27, suratName: 'Al-Ahqaf', ayatMulai: 1, ayatSelesai: 35, totalAyat: 35 },
  { juzNumber: 27, suratName: 'Muhammad', ayatMulai: 1, ayatSelesai: 38, totalAyat: 38 },
  { juzNumber: 27, suratName: 'Al-Fath', ayatMulai: 1, ayatSelesai: 29, totalAyat: 29 },

  // JUZ 28 (77 ayat total)
  { juzNumber: 28, suratName: 'Al-Hujurat', ayatMulai: 1, ayatSelesai: 18, totalAyat: 18 },
  { juzNumber: 28, suratName: 'Qaf', ayatMulai: 1, ayatSelesai: 45, totalAyat: 45 },
  { juzNumber: 28, suratName: 'Adh-Dhariyat', ayatMulai: 1, ayatSelesai: 60, totalAyat: 60 },

  // JUZ 29 (170 ayat total)
  { juzNumber: 29, suratName: 'At-Tur', ayatMulai: 1, ayatSelesai: 49, totalAyat: 49 },
  { juzNumber: 29, suratName: 'An-Najm', ayatMulai: 1, ayatSelesai: 62, totalAyat: 62 },
  { juzNumber: 29, suratName: 'Al-Qamar', ayatMulai: 1, ayatSelesai: 55, totalAyat: 55 },
  { juzNumber: 29, suratName: 'Ar-Rahman', ayatMulai: 1, ayatSelesai: 78, totalAyat: 78 },
  { juzNumber: 29, suratName: 'Al-Waqi\'ah', ayatMulai: 1, ayatSelesai: 96, totalAyat: 96 },
  { juzNumber: 29, suratName: 'Al-Hadid', ayatMulai: 1, ayatSelesai: 29, totalAyat: 29 },

  // JUZ 30 (564 ayat total - surat-surat pendek)
  { juzNumber: 30, suratName: 'Al-Mujadilah', ayatMulai: 1, ayatSelesai: 22, totalAyat: 22 },
  { juzNumber: 30, suratName: 'Al-Hashr', ayatMulai: 1, ayatSelesai: 24, totalAyat: 24 },
  { juzNumber: 30, suratName: 'Al-Mumtahanah', ayatMulai: 1, ayatSelesai: 13, totalAyat: 13 },
  { juzNumber: 30, suratName: 'As-Saff', ayatMulai: 1, ayatSelesai: 14, totalAyat: 14 },
  { juzNumber: 30, suratName: 'Al-Jumu\'ah', ayatMulai: 1, ayatSelesai: 11, totalAyat: 11 },
  { juzNumber: 30, suratName: 'Al-Munafiqun', ayatMulai: 1, ayatSelesai: 11, totalAyat: 11 },
  { juzNumber: 30, suratName: 'At-Taghabun', ayatMulai: 1, ayatSelesai: 18, totalAyat: 18 },
  { juzNumber: 30, suratName: 'At-Talaq', ayatMulai: 1, ayatSelesai: 12, totalAyat: 12 },
  { juzNumber: 30, suratName: 'At-Tahrim', ayatMulai: 1, ayatSelesai: 12, totalAyat: 12 },
  { juzNumber: 30, suratName: 'Al-Mulk', ayatMulai: 1, ayatSelesai: 30, totalAyat: 30 },
  { juzNumber: 30, suratName: 'Al-Qalam', ayatMulai: 1, ayatSelesai: 52, totalAyat: 52 },
  { juzNumber: 30, suratName: 'Al-Haqqah', ayatMulai: 1, ayatSelesai: 52, totalAyat: 52 },
  { juzNumber: 30, suratName: 'Al-Ma\'arij', ayatMulai: 1, ayatSelesai: 44, totalAyat: 44 },
  { juzNumber: 30, suratName: 'Nuh', ayatMulai: 1, ayatSelesai: 28, totalAyat: 28 },
  { juzNumber: 30, suratName: 'Al-Jinn', ayatMulai: 1, ayatSelesai: 28, totalAyat: 28 },
  { juzNumber: 30, suratName: 'Al-Muzzammil', ayatMulai: 1, ayatSelesai: 20, totalAyat: 20 },
  { juzNumber: 30, suratName: 'Al-Muddaththir', ayatMulai: 1, ayatSelesai: 56, totalAyat: 56 },
  { juzNumber: 30, suratName: 'Al-Qiyamah', ayatMulai: 1, ayatSelesai: 40, totalAyat: 40 },
  { juzNumber: 30, suratName: 'Al-Insan', ayatMulai: 1, ayatSelesai: 31, totalAyat: 31 },
  { juzNumber: 30, suratName: 'Al-Mursalat', ayatMulai: 1, ayatSelesai: 50, totalAyat: 50 },
  { juzNumber: 30, suratName: 'An-Naba', ayatMulai: 1, ayatSelesai: 40, totalAyat: 40 },
  { juzNumber: 30, suratName: 'An-Nazi\'at', ayatMulai: 1, ayatSelesai: 46, totalAyat: 46 },
  { juzNumber: 30, suratName: 'Abasa', ayatMulai: 1, ayatSelesai: 42, totalAyat: 42 },
  { juzNumber: 30, suratName: 'At-Takwir', ayatMulai: 1, ayatSelesai: 29, totalAyat: 29 },
  { juzNumber: 30, suratName: 'Al-Infitar', ayatMulai: 1, ayatSelesai: 19, totalAyat: 19 },
  { juzNumber: 30, suratName: 'Al-Mutaffifin', ayatMulai: 1, ayatSelesai: 36, totalAyat: 36 },
  { juzNumber: 30, suratName: 'Al-Inshiqaq', ayatMulai: 1, ayatSelesai: 25, totalAyat: 25 },
  { juzNumber: 30, suratName: 'Al-Buruj', ayatMulai: 1, ayatSelesai: 22, totalAyat: 22 },
  { juzNumber: 30, suratName: 'At-Tariq', ayatMulai: 1, ayatSelesai: 17, totalAyat: 17 },
  { juzNumber: 30, suratName: 'Al-A\'la', ayatMulai: 1, ayatSelesai: 19, totalAyat: 19 },
  { juzNumber: 30, suratName: 'Al-Ghashiyah', ayatMulai: 1, ayatSelesai: 26, totalAyat: 26 },
  { juzNumber: 30, suratName: 'Al-Fajr', ayatMulai: 1, ayatSelesai: 30, totalAyat: 30 },
  { juzNumber: 30, suratName: 'Al-Balad', ayatMulai: 1, ayatSelesai: 20, totalAyat: 20 },
  { juzNumber: 30, suratName: 'Ash-Shams', ayatMulai: 1, ayatSelesai: 15, totalAyat: 15 },
  { juzNumber: 30, suratName: 'Al-Layl', ayatMulai: 1, ayatSelesai: 21, totalAyat: 21 },
  { juzNumber: 30, suratName: 'Ad-Duha', ayatMulai: 1, ayatSelesai: 11, totalAyat: 11 },
  { juzNumber: 30, suratName: 'Ash-Sharh', ayatMulai: 1, ayatSelesai: 8, totalAyat: 8 },
  { juzNumber: 30, suratName: 'At-Tin', ayatMulai: 1, ayatSelesai: 8, totalAyat: 8 },
  { juzNumber: 30, suratName: 'Al-Alaq', ayatMulai: 1, ayatSelesai: 19, totalAyat: 19 },
  { juzNumber: 30, suratName: 'Al-Qadr', ayatMulai: 1, ayatSelesai: 5, totalAyat: 5 },
  { juzNumber: 30, suratName: 'Al-Bayyinah', ayatMulai: 1, ayatSelesai: 8, totalAyat: 8 },
  { juzNumber: 30, suratName: 'Az-Zalzalah', ayatMulai: 1, ayatSelesai: 8, totalAyat: 8 },
  { juzNumber: 30, suratName: 'Al-Adiyat', ayatMulai: 1, ayatSelesai: 11, totalAyat: 11 },
  { juzNumber: 30, suratName: 'Al-Qari\'ah', ayatMulai: 1, ayatSelesai: 11, totalAyat: 11 },
  { juzNumber: 30, suratName: 'At-Takathur', ayatMulai: 1, ayatSelesai: 8, totalAyat: 8 },
  { juzNumber: 30, suratName: 'Al-Asr', ayatMulai: 1, ayatSelesai: 3, totalAyat: 3 },
  { juzNumber: 30, suratName: 'Al-Humazah', ayatMulai: 1, ayatSelesai: 9, totalAyat: 9 },
  { juzNumber: 30, suratName: 'Al-Fil', ayatMulai: 1, ayatSelesai: 5, totalAyat: 5 },
  { juzNumber: 30, suratName: 'Quraish', ayatMulai: 1, ayatSelesai: 4, totalAyat: 4 },
  { juzNumber: 30, suratName: 'Al-Ma\'un', ayatMulai: 1, ayatSelesai: 7, totalAyat: 7 },
  { juzNumber: 30, suratName: 'Al-Kawthar', ayatMulai: 1, ayatSelesai: 3, totalAyat: 3 },
  { juzNumber: 30, suratName: 'Al-Kafirun', ayatMulai: 1, ayatSelesai: 6, totalAyat: 6 },
  { juzNumber: 30, suratName: 'An-Nasr', ayatMulai: 1, ayatSelesai: 3, totalAyat: 3 },
  { juzNumber: 30, suratName: 'Al-Masad', ayatMulai: 1, ayatSelesai: 5, totalAyat: 5 },
  { juzNumber: 30, suratName: 'Al-Ikhlas', ayatMulai: 1, ayatSelesai: 4, totalAyat: 4 },
  { juzNumber: 30, suratName: 'Al-Falaq', ayatMulai: 1, ayatSelesai: 5, totalAyat: 5 },
  { juzNumber: 30, suratName: 'An-Nas', ayatMulai: 1, ayatSelesai: 6, totalAyat: 6 }
];

// Helper functions
export function getJuzMappingBySurat(suratName: string): JuzMapping[] {
  return JUZ_MAPPING.filter(mapping => mapping.suratName === suratName);
}

export function getJuzMappingByJuz(juzNumber: number): JuzMapping[] {
  return JUZ_MAPPING.filter(mapping => mapping.juzNumber === juzNumber);
}

export function getAllJuzNumbers(): number[] {
  return Array.from(new Set(JUZ_MAPPING.map(mapping => mapping.juzNumber))).sort();
}

export function getAllSuratNames(): string[] {
  return Array.from(new Set(JUZ_MAPPING.map(mapping => mapping.suratName)));
}