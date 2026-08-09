/**
 * Middleware untuk auto-inject tahun akademik ke semua data
 * Memastikan semua data tersimpan dengan tahun akademik yang benar
 */

import { prisma } from '@/lib/database/prisma';
import { getCurrentTahunAkademik } from './tahun-akademik-utils';
import { ensureCurrentAcademicYear, getActiveSemester } from './tahun-akademik';

export interface TahunAkademikContext {
  tahunAjaranId: number;
  semesterId: number;
  tahunMulai: number;
  tahunSelesai: number;
  semesterUrutan: number;
  namaSemester: string;
  namaLengkap: string;
}

/**
 * Mendapatkan semester aktif atau current
 */
export async function getActiveTahunAkademik(): Promise<TahunAkademikContext | null> {
  try {
    const activeSemester = await getActiveSemester();

    if (activeSemester && activeSemester.tahunAjaran) {
      return {
        tahunAjaranId: activeSemester.tahunAjaranId,
        semesterId: activeSemester.id,
        tahunMulai: activeSemester.tahunAjaran.tahunMulai,
        tahunSelesai: activeSemester.tahunAjaran.tahunSelesai,
        semesterUrutan: activeSemester.semesterUrutan,
        namaSemester: activeSemester.namaSemester,
        namaLengkap: `${activeSemester.tahunAjaran.tahunMulai}/${activeSemester.tahunAjaran.tahunSelesai}`
      };
    }

    const ensured = await ensureCurrentAcademicYear();
    
    return {
      tahunAjaranId: ensured.tahunAjaranId as number,
      semesterId: ensured.semesterId as number,
      tahunMulai: ensured.tahunMulai,
      tahunSelesai: ensured.tahunSelesai,
      semesterUrutan: ensured.semesterUrutan,
      namaSemester: ensured.namaSemester,
      namaLengkap: ensured.namaLengkap
    };

  } catch (error) {
    console.error('Error getting active tahun akademik:', error);
    return null;
  }
}

/**
 * Helper untuk menambahkan semester ke data yang akan disimpan
 */
export async function withTahunAkademik<T extends Record<string, any>>(
  data: T,
  customSemesterId?: number
): Promise<T & { semesterId: number }> {
  if (customSemesterId) {
    return { ...data, semesterId: customSemesterId };
  }

  const activeTahunAkademik = await getActiveTahunAkademik();
  if (!activeTahunAkademik) {
    throw new Error('Tidak dapat menentukan tahun akademik aktif');
  }

  return { ...data, semesterId: activeTahunAkademik.semesterId };
}

/**
 * Helper untuk filter data berdasarkan tahun akademik (semesterId)
 */
export function createTahunAkademikFilter(semesterId?: number) {
  if (semesterId) {
    return { semesterId };
  }
  
  // Jika tidak ada filter spesifik, return empty object (akan menampilkan semua)
  return {};
}

/**
 * Helper untuk mendapatkan where clause dengan semester
 */
export async function getWhereWithTahunAkademik(
  baseWhere: Record<string, any> = {},
  semesterId?: number
): Promise<Record<string, any>> {
  if (semesterId) {
    return { ...baseWhere, semesterId };
  }

  const activeTahunAkademik = await getActiveTahunAkademik();
  if (activeTahunAkademik) {
    return { ...baseWhere, semesterId: activeTahunAkademik.semesterId };
  }

  // Jika tidak ada tahun akademik aktif, return base where saja
  return baseWhere;
}

/**
 * Utility untuk format display tahun akademik
 */
export function formatTahunAkademikDisplay(tahunAkademik: TahunAkademikContext): string {
  return `${tahunAkademik.namaLengkap} - ${tahunAkademik.namaSemester}`;
}

/**
 * Helper untuk validasi semester
 */
export async function validateTahunAkademik(semesterId: number): Promise<boolean> {
  try {
    const semester = await prisma.semester.findUnique({
      where: { id: semesterId }
    });
    return !!semester;
  } catch (error) {
    console.error('Error validating tahun akademik:', error);
    return false;
  }
}

/**
 * Helper untuk mendapatkan statistik data per semester
 */
export async function getTahunAkademikStats(semesterId: number) {
  try {
    const [ujianCount, raportCount, templateUjianCount, templateRaportCount] = await Promise.all([
      prisma.ujianSantri.count({ where: { semesterId } }),
      prisma.raportSantri.count({ where: { semesterId } }),
      prisma.templateUjian.count({ where: { semesterId } }),
      prisma.templateRaport.count({ where: { semesterId } })
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