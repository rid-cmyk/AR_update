import { cache } from 'react';
import { prisma } from '@/lib/database/prisma';

// Mengambil daftar Halaqah untuk Dropdown Filter
export const getGuruHalaqah = cache(async (guruId: number) => {
  return prisma.halaqah.findMany({
    where: { guruId },
    select: { 
      id: true, 
      namaHalaqah: true, 
      santri: { select: { santri: { select: { id: true, namaLengkap: true, username: true } } } } 
    }
  });
});

// Mengambil data Prestasi berdasarkan Halaqah dengan Prisma Select
export const getPrestasiByHalaqah = cache(async (halaqahId: number) => {
  return prisma.prestasi.findMany({
    where: { santri: { HalaqahSantri: { some: { halaqahId } } } },
    select: {
      id: true,
      namaPrestasi: true,
      keterangan: true,
      kategori: true,
      tahun: true,
      validated: true,
      santri: {
        select: { id: true, namaLengkap: true, username: true }
      }
    },
    orderBy: { id: 'desc' }
  });
});
