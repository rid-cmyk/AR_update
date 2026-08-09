import { cache } from 'react';
import { prisma } from '@/lib/database/prisma';

export const getGuruTarget = cache(async (guruId: number, params: {
  santriName?: string;
  status?: string;
} = {}) => {
  // Get santri in guru's halaqah
  const halaqahSantri = await prisma.halaqahSantri.findMany({
    where: {
      halaqah: { guruId }
    },
    select: { santriId: true, santri: { select: { namaLengkap: true } } }
  });

  let santriIds = halaqahSantri.map(hs => hs.santriId);

  if (params.santriName) {
    const filteredSantri = halaqahSantri.filter(hs => 
      hs.santri.namaLengkap.toLowerCase().includes(params.santriName!.toLowerCase())
    );
    santriIds = filteredSantri.map(hs => hs.santriId);
  }

  const whereClause: any = {
    santriId: { in: santriIds }
  };

  if (params.status && ['belum', 'proses', 'selesai'].includes(params.status)) {
    whereClause.status = params.status;
  }

  const targets = await prisma.targetHafalan.findMany({
    where: whereClause,
    select: {
      id: true,
      santriId: true,
      surat: true,
      ayatTarget: true,
      deadline: true,
      status: true,
      santri: {
        select: { 
          id: true, 
          namaLengkap: true, 
          username: true,
          Hafalan: {
            where: { status: 'ziyadah' },
            select: { surat: true, tanggal: true, ayatMulai: true, ayatSelesai: true }
          }
        }
      }
    },
    orderBy: { deadline: 'asc' }
  });

  // To avoid hitting DB in a loop, let's get all hafalan for these santris that match the surat
  // Actually, calculating progress involves checking how many ayats are memorized for that surat.
  return targets.map(target => {
    const relatedHafalans = target.santri.Hafalan.filter(h => h.surat === target.surat && h.tanggal <= target.deadline);
    const completedAyat = relatedHafalans.reduce((sum, h) => sum + (h.ayatSelesai - h.ayatMulai + 1), 0);
    const progress = target.ayatTarget > 0 ? Math.min(Math.round((completedAyat / target.ayatTarget) * 100), 100) : 0;
    
    return {
      ...target,
      progress: target.status === 'selesai' ? 100 : progress
    };
  });
});

export const getSantriOptionsForGuru = cache(async (guruId: number) => {
  const halaqahSantri = await prisma.halaqahSantri.findMany({
    where: { halaqah: { guruId } },
    select: { santri: { select: { id: true, namaLengkap: true } } }
  });
  return halaqahSantri.map(hs => hs.santri);
});
