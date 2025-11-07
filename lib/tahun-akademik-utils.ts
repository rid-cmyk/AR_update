/**
 * Utility functions untuk mengelola Tahun Akademik otomatis
 * Sistem: Januari-Juni = Semester 2, Juli-Desember = Semester 1
 */

export interface TahunAkademikInfo {
  tahunMulai: number;
  tahunSelesai: number;
  semester: 'S1' | 'S2';
  namaLengkap: string;
  tanggalMulai: Date;
  tanggalSelesai: Date;
}

/**
 * Mendapatkan informasi tahun akademik berdasarkan tanggal
 */
export function getTahunAkademikFromDate(date: Date = new Date()): TahunAkademikInfo {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12

  if (month >= 1 && month <= 6) {
    // Januari - Juni = Semester 2 (tahun sebelumnya/tahun ini)
    return {
      tahunMulai: year - 1,
      tahunSelesai: year,
      semester: 'S2',
      namaLengkap: `${year - 1}/${year} Semester 2`,
      tanggalMulai: new Date(year, 0, 1), // 1 Januari
      tanggalSelesai: new Date(year, 5, 30), // 30 Juni
    };
  } else {
    // Juli - Desember = Semester 1 (tahun ini/tahun depan)
    return {
      tahunMulai: year,
      tahunSelesai: year + 1,
      semester: 'S1',
      namaLengkap: `${year}/${year + 1} Semester 1`,
      tanggalMulai: new Date(year, 6, 1), // 1 Juli
      tanggalSelesai: new Date(year, 11, 31), // 31 Desember
    };
  }
}

/**
 * Mendapatkan tahun akademik saat ini
 */
export function getCurrentTahunAkademik(): TahunAkademikInfo {
  return getTahunAkademikFromDate(new Date());
}

/**
 * Mendapatkan daftar tahun akademik dalam rentang tertentu
 */
export function getTahunAkademikRange(startYear: number, endYear: number): TahunAkademikInfo[] {
  const result: TahunAkademikInfo[] = [];
  
  for (let year = startYear; year <= endYear; year++) {
    // Semester 1 (Juli - Desember)
    result.push({
      tahunMulai: year,
      tahunSelesai: year + 1,
      semester: 'S1',
      namaLengkap: `${year}/${year + 1} Semester 1`,
      tanggalMulai: new Date(year, 6, 1), // 1 Juli
      tanggalSelesai: new Date(year, 11, 31), // 31 Desember
    });
    
    // Semester 2 (Januari - Juni tahun berikutnya)
    result.push({
      tahunMulai: year,
      tahunSelesai: year + 1,
      semester: 'S2',
      namaLengkap: `${year}/${year + 1} Semester 2`,
      tanggalMulai: new Date(year + 1, 0, 1), // 1 Januari tahun berikutnya
      tanggalSelesai: new Date(year + 1, 5, 30), // 30 Juni tahun berikutnya
    });
  }
  
  return result.sort((a, b) => a.tanggalMulai.getTime() - b.tanggalMulai.getTime());
}

/**
 * Cek apakah tanggal berada dalam tahun akademik tertentu
 */
export function isDateInTahunAkademik(date: Date, tahunAkademik: TahunAkademikInfo): boolean {
  return date >= tahunAkademik.tanggalMulai && date <= tahunAkademik.tanggalSelesai;
}

/**
 * Mendapatkan tahun akademik berdasarkan tahun dan semester
 */
export function getTahunAkademikBySemester(tahunMulai: number, semester: 'S1' | 'S2'): TahunAkademikInfo {
  if (semester === 'S1') {
    return {
      tahunMulai,
      tahunSelesai: tahunMulai + 1,
      semester: 'S1',
      namaLengkap: `${tahunMulai}/${tahunMulai + 1} Semester 1`,
      tanggalMulai: new Date(tahunMulai, 6, 1), // 1 Juli
      tanggalSelesai: new Date(tahunMulai, 11, 31), // 31 Desember
    };
  } else {
    return {
      tahunMulai: tahunMulai - 1,
      tahunSelesai: tahunMulai,
      semester: 'S2',
      namaLengkap: `${tahunMulai - 1}/${tahunMulai} Semester 2`,
      tanggalMulai: new Date(tahunMulai, 0, 1), // 1 Januari
      tanggalSelesai: new Date(tahunMulai, 5, 30), // 30 Juni
    };
  }
}

/**
 * Format display tahun akademik
 */
export function formatTahunAkademik(tahunAkademik: TahunAkademikInfo): string {
  return tahunAkademik.namaLengkap;
}

/**
 * Mendapatkan tahun akademik sebelumnya
 */
export function getPreviousTahunAkademik(current: TahunAkademikInfo): TahunAkademikInfo {
  if (current.semester === 'S2') {
    // Jika semester 2, sebelumnya adalah semester 1 tahun yang sama
    return getTahunAkademikBySemester(current.tahunMulai + 1, 'S1');
  } else {
    // Jika semester 1, sebelumnya adalah semester 2 tahun sebelumnya
    return getTahunAkademikBySemester(current.tahunMulai, 'S2');
  }
}

/**
 * Mendapatkan tahun akademik selanjutnya
 */
export function getNextTahunAkademik(current: TahunAkademikInfo): TahunAkademikInfo {
  if (current.semester === 'S1') {
    // Jika semester 1, selanjutnya adalah semester 2 tahun yang sama
    return getTahunAkademikBySemester(current.tahunSelesai, 'S2');
  } else {
    // Jika semester 2, selanjutnya adalah semester 1 tahun berikutnya
    return getTahunAkademikBySemester(current.tahunSelesai, 'S1');
  }
}