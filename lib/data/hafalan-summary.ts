import { cache } from 'react';
import { prisma } from '@/lib/database/prisma';

// Menggunakan 'cache' dari react agar query tidak berulang saat request yang sama.
// Jika komponen Server yang berbeda memanggil fungsi ini, query database hanya terjadi sekali.
export const getHafalanSummary = cache(async (guruId: string) => {
  // Prisma secara default mereturn plain JavaScript object (mirip .lean() di Mongoose)
  // Kita optimalkan lebih lanjut dengan 'select' agar hanya mengambil field yang benar-benar dibutuhkan
  return prisma.hafalan.findMany({
    where: { 
      santri: {
        HalaqahSantri: {
          some: {
            halaqah: { guruId: parseInt(guruId) }
          }
        }
      } 
    },
    select: {
      id: true,
      santri: { 
        select: { 
          namaLengkap: true 
        } 
      },
      ayatMulai: true,
      ayatSelesai: true,
      status: true,
    },
    take: 10,
    orderBy: { 
      tanggal: 'desc' 
    }
  });
});
