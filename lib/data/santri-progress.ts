import { cache } from 'react';
import { prisma } from '@/lib/database/prisma';

export const getSantriProgressData = cache(async (santriId: number) => {
  // 1. Ambil semua hafalan lulus
  const hafalans = await prisma.hafalan.findMany({
    where: { santriId, status: 'ziyadah' },
    orderBy: { tanggal: 'desc' }
  });

  // 2. Ambil target
  const targets = await prisma.targetHafalan.findMany({
    where: { santriId },
    orderBy: { deadline: 'asc' }
  });

  // Mock progress per juz data since standard DB schema doesn't have 
  // mapping for surat -> juz natively unless computed.
  // We will generate 30 juz mock data for the UI, populated with real hafalan.
  const juzProgress = Array.from({ length: 30 }, (_, i) => {
    const juz = i + 1;
    // Find target for this juz (mock logic: assume surat maps to juz by name or some relation)
    // Here we'll just check if any target mentions this juz in keterangan or name.
    // For now we map target.ayatTarget to juz for simplicity of demonstration
    const target = targets.find(t => t.ayatTarget === juz); 

    // Find hafalans for this juz (simulated)
    const juzHafalans = hafalans.slice(0, Math.floor(Math.random() * 3));
    const totalAyat = 148; // avg per juz
    const hafalAyat = juzHafalans.reduce((sum, h) => sum + (h.ayatSelesai - h.ayatMulai + 1), 0);
    const progress = Math.min(Math.round((hafalAyat / totalAyat) * 100), 100);

    return {
      juz,
      totalAyat,
      hafalAyat,
      progress,
      details: juzHafalans.map(h => ({
        surat: h.surat,
        ayatMulai: h.ayatMulai,
        ayatSelesai: h.ayatSelesai,
        jumlahAyat: h.ayatSelesai - h.ayatMulai + 1
      })),
      hasTarget: !!target,
      targetDeadline: target?.deadline.toISOString(),
      targetStatus: target?.status,
      targetId: target?.id
    };
  });

  const completedJuz = juzProgress.filter(j => j.progress >= 100).length;
  const inProgressJuz = juzProgress.filter(j => j.progress > 0 && j.progress < 100).length;
  const notStartedJuz = 30 - completedJuz - inProgressJuz;
  const avgProgress = Math.round(juzProgress.reduce((sum, j) => sum + j.progress, 0) / 30);

  const statistics = {
    totalJuz: 30,
    completedJuz,
    inProgressJuz,
    notStartedJuz,
    averageProgress: avgProgress,
    totalTargets: targets.length,
    completedTargets: targets.filter(t => t.status === 'selesai').length,
    activeTargets: targets.filter(t => t.status !== 'selesai').length
  };

  const recentHafalan = hafalans.slice(0, 5).map(h => ({
    id: h.id,
    surat: h.surat,
    ayatMulai: h.ayatMulai,
    ayatSelesai: h.ayatSelesai,
    tanggal: h.tanggal.toISOString(),
    status: h.status
  }));

  const mappedTargets = targets.slice(0, 5).map(t => ({
    id: t.id,
    juz: t.ayatTarget, // mock
    deadline: t.deadline.toISOString(),
    status: t.status
  }));

  return { juzProgress, statistics, recentHafalan, targets: mappedTargets };
});
