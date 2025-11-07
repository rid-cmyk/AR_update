import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TahunAkademikInfo {
  id?: number;
  tahunMulai: number;
  tahunSelesai: number;
  semester: 'S1' | 'S2';
  namaLengkap: string;
  tanggalMulai: Date;
  tanggalSelesai: Date;
  isActive: boolean;
}

/**
 * Menentukan tahun akademik dan semester berdasarkan tanggal
 * Aturan:
 * - Januari - Juni: Semester 2 (tahun akademik sebelumnya)
 * - Juli - Desember: Semester 1 (tahun akademik baru)
 */
export function getCurrentAcademicYear(date: Date = new Date()): TahunAkademikInfo {
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth() + 1; // 1-12

  let tahunMulai: number;
  let tahunSelesai: number;
  let semester: 'S1' | 'S2';
  let tanggalMulai: Date;
  let tanggalSelesai: Date;

  if (currentMonth >= 1 && currentMonth <= 6) {
    // Januari - Juni: Semester 2
    tahunMulai = currentYear - 1;
    tahunSelesai = currentYear;
    semester = 'S2';
    tanggalMulai = new Date(currentYear, 0, 1); // 1 Januari
    tanggalSelesai = new Date(currentYear, 5, 30); // 30 Juni
  } else {
    // Juli - Desember: Semester 1
    tahunMulai = currentYear;
    tahunSelesai = currentYear + 1;
    semester = 'S1';
    tanggalMulai = new Date(currentYear, 6, 1); // 1 Juli
    tanggalSelesai = new Date(currentYear, 11, 31); // 31 Desember
  }

  const namaLengkap = `${tahunMulai}/${tahunSelesai} Semester ${semester === 'S1' ? '1' : '2'}`;

  return {
    tahunMulai,
    tahunSelesai,
    semester,
    namaLengkap,
    tanggalMulai,
    tanggalSelesai,
    isActive: true
  };
}

/**
 * Mendapatkan semua tahun akademik yang mungkin berdasarkan range tahun
 */
export function generateAcademicYears(startYear: number, endYear: number): TahunAkademikInfo[] {
  const academicYears: TahunAkademikInfo[] = [];

  for (let year = startYear; year <= endYear; year++) {
    // Semester 1: Juli - Desember
    academicYears.push({
      tahunMulai: year,
      tahunSelesai: year + 1,
      semester: 'S1',
      namaLengkap: `${year}/${year + 1} Semester 1`,
      tanggalMulai: new Date(year, 6, 1), // 1 Juli
      tanggalSelesai: new Date(year, 11, 31), // 31 Desember
      isActive: false
    });

    // Semester 2: Januari - Juni (tahun berikutnya)
    academicYears.push({
      tahunMulai: year,
      tahunSelesai: year + 1,
      semester: 'S2',
      namaLengkap: `${year}/${year + 1} Semester 2`,
      tanggalMulai: new Date(year + 1, 0, 1), // 1 Januari
      tanggalSelesai: new Date(year + 1, 5, 30), // 30 Juni
      isActive: false
    });
  }

  return academicYears;
}

/**
 * Membuat atau mengupdate tahun akademik otomatis
 */
export async function ensureCurrentAcademicYear(): Promise<TahunAkademikInfo> {
  const currentAcademicYear = getCurrentAcademicYear();

  try {
    // Cek apakah tahun akademik sudah ada
    const existing = await prisma.tahunAjaran.findUnique({
      where: {
        tahunMulai_tahunSelesai_semester: {
          tahunMulai: currentAcademicYear.tahunMulai,
          tahunSelesai: currentAcademicYear.tahunSelesai,
          semester: currentAcademicYear.semester
        }
      }
    });

    if (existing) {
      // Update status aktif jika belum
      if (!existing.isActive) {
        // Nonaktifkan semua tahun akademik lain
        await prisma.tahunAjaran.updateMany({
          where: { isActive: true },
          data: { isActive: false }
        });

        // Aktifkan tahun akademik saat ini
        await prisma.tahunAjaran.update({
          where: { id: existing.id },
          data: { isActive: true }
        });
      }

      return {
        ...currentAcademicYear,
        id: existing.id
      };
    }

    // Buat tahun akademik baru
    // Nonaktifkan semua tahun akademik lain
    await prisma.tahunAjaran.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    const newAcademicYear = await prisma.tahunAjaran.create({
      data: {
        tahunMulai: currentAcademicYear.tahunMulai,
        tahunSelesai: currentAcademicYear.tahunSelesai,
        semester: currentAcademicYear.semester,
        namaLengkap: currentAcademicYear.namaLengkap,
        tanggalMulai: currentAcademicYear.tanggalMulai,
        tanggalSelesai: currentAcademicYear.tanggalSelesai,
        isActive: true
      }
    });

    return {
      ...currentAcademicYear,
      id: newAcademicYear.id
    };

  } catch (error) {
    console.error('Error ensuring current academic year:', error);
    throw error;
  }
}

/**
 * Mendapatkan tahun akademik aktif
 */
export async function getActiveAcademicYear() {
  try {
    const active = await prisma.tahunAjaran.findFirst({
      where: { isActive: true }
    });

    if (!active) {
      // Jika tidak ada yang aktif, buat otomatis
      return await ensureCurrentAcademicYear();
    }

    return active;
  } catch (error) {
    console.error('Error getting active academic year:', error);
    throw error;
  }
}

/**
 * Mendapatkan tahun akademik berdasarkan tanggal
 */
export async function getAcademicYearByDate(date: Date) {
  const academicYearInfo = getCurrentAcademicYear(date);
  
  try {
    const academicYear = await prisma.tahunAjaran.findUnique({
      where: {
        tahunMulai_tahunSelesai_semester: {
          tahunMulai: academicYearInfo.tahunMulai,
          tahunSelesai: academicYearInfo.tahunSelesai,
          semester: academicYearInfo.semester
        }
      }
    });

    return academicYear;
  } catch (error) {
    console.error('Error getting academic year by date:', error);
    return null;
  }
}

/**
 * Inisialisasi tahun akademik untuk beberapa tahun
 */
export async function initializeAcademicYears(startYear: number = 2020, endYear: number = 2030) {
  const academicYears = generateAcademicYears(startYear, endYear);
  const currentAcademicYear = getCurrentAcademicYear();

  try {
    for (const academicYear of academicYears) {
      // Cek apakah sudah ada
      const existing = await prisma.tahunAjaran.findUnique({
        where: {
          tahunMulai_tahunSelesai_semester: {
            tahunMulai: academicYear.tahunMulai,
            tahunSelesai: academicYear.tahunSelesai,
            semester: academicYear.semester
          }
        }
      });

      if (!existing) {
        // Set aktif jika ini tahun akademik saat ini
        const isActive = 
          academicYear.tahunMulai === currentAcademicYear.tahunMulai &&
          academicYear.tahunSelesai === currentAcademicYear.tahunSelesai &&
          academicYear.semester === currentAcademicYear.semester;

        await prisma.tahunAjaran.create({
          data: {
            tahunMulai: academicYear.tahunMulai,
            tahunSelesai: academicYear.tahunSelesai,
            semester: academicYear.semester,
            namaLengkap: academicYear.namaLengkap,
            tanggalMulai: academicYear.tanggalMulai,
            tanggalSelesai: academicYear.tanggalSelesai,
            isActive
          }
        });
      }
    }

    console.log(`✅ Initialized academic years from ${startYear} to ${endYear}`);
  } catch (error) {
    console.error('Error initializing academic years:', error);
    throw error;
  }
}

/**
 * Helper untuk mendapatkan filter tahun akademik
 */
export function getAcademicYearFilter(tahunAkademikId?: number) {
  if (!tahunAkademikId) {
    return {};
  }

  return {
    tahunAjaranId: tahunAkademikId
  };
}

/**
 * Format display tahun akademik
 */
export function formatAcademicYear(tahunMulai: number, tahunSelesai: number, semester: 'S1' | 'S2'): string {
  return `${tahunMulai}/${tahunSelesai} Semester ${semester === 'S1' ? '1' : '2'}`;
}