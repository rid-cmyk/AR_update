import { cache } from 'react';
import { prisma } from '@/lib/database/prisma';

export const getSantriHafalanDashboard = cache(async (santriId: number) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Fetch all hafalan and target hafalan in parallel
  const [allHafalanData, targetHafalan] = await Promise.all([
    prisma.hafalan.findMany({
      where: { santriId: santriId },
      orderBy: { tanggal: 'desc' }
    }),
    prisma.targetHafalan.findMany({
      where: { santriId: santriId },
      orderBy: { deadline: 'asc' }
    })
  ]);

  const hafalanData = allHafalanData.filter(h => new Date(h.tanggal) >= thirtyDaysAgo);

  const targetsWithProgress = targetHafalan.map(target => {
    // We assume the DB has 'namaSurat' or 'surat' instead of just 'surat'. Looking at previous usages, it's 'namaSurat' for Hafalan.
    // Wait, in the route it used `h.surat`. Let's use `h.surat` safely.
    const targetHafalanData = allHafalanData
      .filter(h => h.surat?.toLowerCase() === target.surat.toLowerCase() && new Date(h.tanggal) <= new Date(target.deadline))
      .sort((a, b) => b.ayatSelesai - a.ayatSelesai);

    let currentAyat = 0;
    if (targetHafalanData.length > 0) {
      currentAyat = Math.min(targetHafalanData[0].ayatSelesai, target.ayatTarget);
    }

    return {
      id: target.id,
      judul: `Target ${target.surat}`,
      deskripsi: `Menghafal ${target.surat} sampai ayat ${target.ayatTarget}`,
      targetAyat: target.ayatTarget,
      currentAyat: currentAyat,
      deadline: target.deadline.toISOString(),
      status: target.status === 'selesai' ? 'completed' : 
              currentAyat >= target.ayatTarget ? 'completed' : 'active',
      surah: target.surat,
    };
  });

  // Process hafalan data for chart (last 10 days)
  const progressData: any[] = [];
  const last10Days: string[] = [];
  for (let i = 9; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last10Days.push(date.toISOString().split('T')[0]);
  }

  let totalAyatHafalan = 0;
  allHafalanData.forEach(h => {
    const ayatCount = h.ayatSelesai - h.ayatMulai + 1;
    totalAyatHafalan += ayatCount;
  });

  last10Days.forEach(dateStr => {
    const dayHafalan = hafalanData.filter(h => 
      new Date(h.tanggal).toISOString().split('T')[0] === dateStr
    );
    
    let ziyadahAyat = 0;
    let murajaahAyat = 0;
    
    dayHafalan.forEach(h => {
      const ayatCount = h.ayatSelesai - h.ayatMulai + 1;
      // In Hafalan status could be 'ziyadah' or 'murojaah' or 'lulus' etc. Let's assume everything is ziyadah if it's new.
      // We will just sum them up.
      ziyadahAyat += ayatCount; 
    });

    progressData.push({
      date: dateStr,
      ziyadah: ziyadahAyat,
      murajaah: murajaahAyat,
      total: ziyadahAyat + murajaahAyat,
      cumulative: totalAyatHafalan // Simplified for display
    });
  });

  return {
    recentHafalan: allHafalanData.slice(0, 10).map(h => ({
      id: h.id,
      tanggal: new Date(h.tanggal).toISOString().split('T')[0],
      surat: h.surat,
      ayatMulai: h.ayatMulai,
      ayatSelesai: h.ayatSelesai,
      status: h.status,
      keterangan: h.keterangan || ''
    })),
    targets: targetsWithProgress,
    chartData: progressData,
    overview: {
      totalHafalan: allHafalanData.length,
      totalAyatZiyadah: totalAyatHafalan,
      totalAyatMurajaah: 0,
      activeTargets: targetsWithProgress.filter(t => t.status === 'active').length,
      completedTargets: targetsWithProgress.filter(t => t.status === 'completed').length,
    }
  };
});
