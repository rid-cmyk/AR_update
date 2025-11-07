/**
 * Middleware untuk auto-inject tahun akademik ke semua data
 * Memastikan semua data tersimpan dengan tahun akademik yang benar
 */

import { prisma } from '@/lib/database/prisma';
import { getCurrentTahunAkademik } from './tahun-akademik-utils';

export interface TahunAkademikContext {
  tahunAjaranId: number;
  tahunMulai: number;
  tahunSelesai: number;
  semester: 'S1' | 'S2';
  namaLengkap: string;
}

/**
 * Mendapatkan tahun akademik aktif atau current
 */
export async function getActiveTahunAkademik(): Promise<TahunAkademikContext | null> {
  try {
    // Cari tahun akademik aktif di database
    const activeTahunAkademik = await prisma.tahunAjaran.findFirst({
      where: { isActive: true }
    });

    if (activeTahunAkademik) {
      return {
        tahunAjaranId: activeTahunAkademik.id,
        tahunMulai: activeTahunAkademik.tahunMulai,
        tahunSelesai: activeTahunAkademik.tahunSelesai,
        semester: activeTahunAkademik.semester as 'S1' | 'S2',
        namaLengkap: activeTahunAkademik.namaLengkap
      };
    }

    // Jika tidak ada yang aktif, buat otomatis berdasarkan tanggal saat ini
    const currentTahunAkademik = getCurrentTahunAkademik();
    
    // Cek apakah sudah ada di database
    let existingTahunAkademik = await prisma.tahunAjaran.findFirst({
      where: {
        tahunMulai: currentTahunAkademik.tahunMulai,
        tahunSelesai: currentTahunAkademik.tahunSelesai,
        semester: currentTahunAkademik.semester
      }
    });

    // Jika belum ada, buat baru
    if (!existingTahunAkademik) {
      existingTahunAkademik = await prisma.tahunAjaran.create({
        data: {
          tahunMulai: currentTahunAkademik.tahunMulai,
          tahunSelesai: currentTahunAkademik.tahunSelesai,
          semester: currentTahunAkademik.semester,
          namaLengkap: currentTahunAkademik.namaLengkap,
          tanggalMulai: currentTahunAkademik.tanggalMulai,
          tanggalSelesai: currentTahunAkademik.tanggalSelesai,
          isActive: true // Set sebagai aktif karena ini tahun akademik saat ini
        }
      });
    }

    return {
      tahunAjaranId: existingTahunAkademik.id,
      tahunMulai: existingTahunAkademik.tahunMulai,
      tahunSelesai: existingTahunAkademik.tahunSelesai,
      semester: existingTahunAkademik.semester as 'S1' | 'S2',
      namaLengkap: existingTahunAkademik.namaLengkap
    };

  } catch (error) {
    console.error('Error getting active tahun akademik:', error);
    return null;
  }
}

/**
 * Helper untuk menambahkan tahun akademik ke data yang akan disimpan
 */
export async function withTahunAkademik<T extends Record<string, any>>(
  data: T,
  customTahunAjaranId?: number
): Promise<T & { tahunAjaranId: number }> {
  if (customTahunAjaranId) {
    return { ...data, tahunAjaranId: customTahunAjaranId };
  }

  const activeTahunAkademik = await getActiveTahunAkademik();
  if (!activeTahunAkademik) {
    throw new Error('Tidak dapat menentukan tahun akademik aktif');
  }

  return { ...data, tahunAjaranId: activeTahunAkademik.tahunAjaranId };
}

/**
 * Helper untuk filter data berdasarkan tahun akademik
 */
export function createTahunAkademikFilter(tahunAjaranId?: number) {
  if (tahunAjaranId) {
    return { tahunAjaranId };
  }
  
  // Jika tidak ada filter spesifik, return empty object (akan menampilkan semua)
  return {};
}

/**
 * Helper untuk mendapatkan where clause dengan tahun akademik
 */
export async function getWhereWithTahunAkademik(
  baseWhere: Record<string, any> = {},
  tahunAjaranId?: number
): Promise<Record<string, any>> {
  if (tahunAjaranId) {
    return { ...baseWhere, tahunAjaranId };
  }

  const activeTahunAkademik = await getActiveTahunAkademik();
  if (activeTahunAkademik) {
    return { ...baseWhere, tahunAjaranId: activeTahunAkademik.tahunAjaranId };
  }

  // Jika tidak ada tahun akademik aktif, return base where saja
  return baseWhere;
}

/**
 * Utility untuk format display tahun akademik
 */
export function formatTahunAkademikDisplay(tahunAkademik: TahunAkademikContext): string {
  return `${tahunAkademik.namaLengkap}`;
}

/**
 * Helper untuk validasi tahun akademik
 */
export async function validateTahunAkademik(tahunAjaranId: number): Promise<boolean> {
  try {
    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id: tahunAjaranId }
    });
    return !!tahunAjaran;
  } catch (error) {
    console.error('Error validating tahun akademik:', error);
    return false;
  }
}

/**
 * Helper untuk mendapatkan statistik data per tahun akademik
 */
export async function getTahunAkademikStats(tahunAjaranId: number) {
  try {
    const [ujianCount, raportCount, templateUjianCount, templateRaportCount] = await Promise.all([
      prisma.ujianSantri.count({ where: { tahunAjaranId } }),
      prisma.raportSantri.count({ where: { tahunAjaranId } }),
      prisma.templateUjian.count({ where: { tahunAjaranId } }),
      prisma.templateRaport.count({ where: { tahunAjaranId } })
    ]);

    return {
      ujianSantri: ujianCount,
      raportSantri: raportCount,
      templateUjian: templateUjianCount,
      templateRaport: templateRaportCount,
      total: ujianCount + raportCount + templateUjianCount + templateRaportCount
    };
  } catch (error) {
    console.error('Error getting tahun akademik stats:', error);
    return {
      ujianSantri: 0,
      raportSantri: 0,
      templateUjian: 0,
      templateRaport: 0,
      total: 0
    };
  }
}