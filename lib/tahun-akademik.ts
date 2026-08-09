import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TahunAkademikInfo {
  tahunAjaranId?: number;
  semesterId?: number;
  tahunMulai: number;
  tahunSelesai: number;
  namaLengkap: string;
  semesterUrutan: number;
  namaSemester: string;
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
  let semesterUrutan: number;
  let namaSemester: string;
  let tanggalMulai: Date;
  let tanggalSelesai: Date;

  if (currentMonth >= 1 && currentMonth <= 6) {
    // Januari - Juni: Semester 2
    tahunMulai = currentYear - 1;
    tahunSelesai = currentYear;
    semesterUrutan = 2;
    namaSemester = 'Semester 2 Genap';
    tanggalMulai = new Date(currentYear, 0, 1); // 1 Januari
    tanggalSelesai = new Date(currentYear, 5, 30); // 30 Juni
  } else {
    // Juli - Desember: Semester 1
    tahunMulai = currentYear;
    tahunSelesai = currentYear + 1;
    semesterUrutan = 1;
    namaSemester = 'Semester 1 Ganjil';
    tanggalMulai = new Date(currentYear, 6, 1); // 1 Juli
    tanggalSelesai = new Date(currentYear, 11, 31); // 31 Desember
  }

  const namaLengkap = `${tahunMulai}/${tahunSelesai}`;

  return {
    tahunMulai,
    tahunSelesai,
    namaLengkap,
    semesterUrutan,
    namaSemester,
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
      namaLengkap: `${year}/${year + 1}`,
      semesterUrutan: 1,
      namaSemester: 'Semester 1 Ganjil',
      tanggalMulai: new Date(year, 6, 1), // 1 Juli
      tanggalSelesai: new Date(year, 11, 31), // 31 Desember
      isActive: false
    });

    // Semester 2: Januari - Juni (tahun berikutnya)
    academicYears.push({
      tahunMulai: year,
      tahunSelesai: year + 1,
      namaLengkap: `${year}/${year + 1}`,
      semesterUrutan: 2,
      namaSemester: 'Semester 2 Genap',
      tanggalMulai: new Date(year + 1, 0, 1), // 1 Januari
      tanggalSelesai: new Date(year + 1, 5, 30), // 30 Juni
      isActive: false
    });
  }

  return academicYears;
}

/**
 * Membuat atau mengupdate tahun akademik otomatis (TahunAjaran dan Semester)
 */
export async function ensureCurrentAcademicYear(): Promise<TahunAkademikInfo> {
  const currentInfo = getCurrentAcademicYear();

  try {
    // 1. Cek TahunAjaran
    let tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: {
        tahunMulai_tahunSelesai: {
          tahunMulai: currentInfo.tahunMulai,
          tahunSelesai: currentInfo.tahunSelesai,
        }
      }
    });

    if (!tahunAjaran) {
      // Buat TahunAjaran baru
      tahunAjaran = await prisma.tahunAjaran.create({
        data: {
          tahunMulai: currentInfo.tahunMulai,
          tahunSelesai: currentInfo.tahunSelesai,
          namaLengkap: currentInfo.namaLengkap,
          tanggalMulai: new Date(currentInfo.tahunMulai, 6, 1),
          tanggalSelesai: new Date(currentInfo.tahunSelesai, 5, 30),
          isActive: true
        }
      });
      // Nonaktifkan TahunAjaran lain jika ada (opsional)
      await prisma.tahunAjaran.updateMany({
        where: { id: { not: tahunAjaran.id }, isActive: true },
        data: { isActive: false }
      });
    }

    // 2. Cek Semester
    let semester = await prisma.semester.findFirst({
      where: {
        tahunAjaranId: tahunAjaran.id,
        semesterUrutan: currentInfo.semesterUrutan
      }
    });

    if (!semester) {
      // Buat Semester baru
      semester = await prisma.semester.create({
        data: {
          tahunAjaranId: tahunAjaran.id,
          namaSemester: currentInfo.namaSemester,
          semesterUrutan: currentInfo.semesterUrutan,
          tanggalMulai: currentInfo.tanggalMulai,
          tanggalSelesai: currentInfo.tanggalSelesai,
          isActive: true
        }
      });
      // Nonaktifkan Semester lain
      await prisma.semester.updateMany({
        where: { id: { not: semester.id }, isActive: true },
        data: { isActive: false }
      });
    } else if (!semester.isActive) {
      // Aktifkan Semester
      await prisma.semester.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
      semester = await prisma.semester.update({
        where: { id: semester.id },
        data: { isActive: true }
      });
    }

    return {
      ...currentInfo,
      tahunAjaranId: tahunAjaran.id,
      semesterId: semester.id
    };

  } catch (error) {
    console.error('Error ensuring current academic year:', error);
    throw error;
  }
}

/**
 * Mendapatkan tahun ajaran aktif
 */
export async function getActiveAcademicYear() {
  try {
    const active = await prisma.tahunAjaran.findFirst({
      where: { isActive: true }
    });

    if (!active) {
      const ensured = await ensureCurrentAcademicYear();
      return await prisma.tahunAjaran.findUnique({ where: { id: ensured.tahunAjaranId } });
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
  const info = getCurrentAcademicYear(date);
  try {
    return await prisma.tahunAjaran.findUnique({
      where: {
        tahunMulai_tahunSelesai: {
          tahunMulai: info.tahunMulai,
          tahunSelesai: info.tahunSelesai,
        }
      }
    });
  } catch (error) {
    console.error('Error getting academic year by date:', error);
    return null;
  }
}

/**
 * Mendapatkan semester aktif
 */
export async function getActiveSemester() {
  try {
    const activeSemester = await prisma.semester.findFirst({
      where: { isActive: true },
      include: { tahunAjaran: true }
    });

    if (!activeSemester) {
      // Jika tidak ada yang aktif, buat otomatis
      await ensureCurrentAcademicYear();
      return await prisma.semester.findFirst({
        where: { isActive: true },
        include: { tahunAjaran: true }
      });
    }

    return activeSemester;
  } catch (error) {
    console.error('Error getting active semester:', error);
    throw error;
  }
}

/**
 * Mendapatkan tahun akademik berdasarkan tanggal
 */
export async function getSemesterByDate(date: Date) {
  const info = getCurrentAcademicYear(date);
  
  try {
    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: {
        tahunMulai_tahunSelesai: {
          tahunMulai: info.tahunMulai,
          tahunSelesai: info.tahunSelesai,
        }
      }
    });

    if (!tahunAjaran) return null;

    const semester = await prisma.semester.findFirst({
      where: {
        tahunAjaranId: tahunAjaran.id,
        semesterUrutan: info.semesterUrutan
      },
      include: { tahunAjaran: true }
    });

    return semester;
  } catch (error) {
    console.error('Error getting semester by date:', error);
    return null;
  }
}

/**
 * Mendapatkan id TahunAjaran untuk periode berjalan.
 */
export async function getCurrentTahunAjaranId(): Promise<number | null> {
  const active = await prisma.tahunAjaran.findFirst({ where: { isActive: true } });
  if (active) return active.id;

  const byDate = await getAcademicYearByDate(new Date());
  if (byDate) return byDate.id;

  const ensured = await ensureCurrentAcademicYear();
  return ensured.tahunAjaranId ?? null;
}

/**
 * Mendapatkan id Semester untuk periode berjalan.
 */
export async function getCurrentSemesterId(): Promise<number | null> {
  const active = await prisma.semester.findFirst({ where: { isActive: true } });
  if (active) return active.id;

  const byDate = await getSemesterByDate(new Date());
  if (byDate) return byDate.id;

  const ensured = await ensureCurrentAcademicYear();
  return ensured.semesterId ?? null;
}

/**
 * Helper untuk mendapatkan filter tahun akademik (diubah ke semesterId)
 */
export function getAcademicYearFilter(semesterId?: number) {
  if (!semesterId) {
    return {};
  }
  return { semesterId };
}

/**
 * Format display tahun akademik
 */
export function formatAcademicYear(tahunMulai: number, tahunSelesai: number, namaSemester: string): string {
  return `${tahunMulai}/${tahunSelesai} - ${namaSemester}`;
}