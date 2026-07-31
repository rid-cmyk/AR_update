import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/database/prisma';
import GuruDashboardClient from './GuruDashboardClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic'; // Ensure this runs dynamically per request since it's a dashboard

export default async function GuruDashboardPage() {
  const { user: authUser, error } = await getAuthUser();
  if (error || !authUser) {
    redirect('/login');
  }

  const guru = await prisma.user.findUnique({
    where: { id: authUser.id }
  });

  if (!guru) {
    redirect('/login');
  }

  // Fetch halaqah data
  const halaqahDataList = await prisma.halaqah.findMany({
    where: { guruId: guru.id },
    include: {
      santri: {
        include: {
          santri: {
            select: {
              id: true,
              namaLengkap: true,
              username: true
            }
          }
        }
      },
      jadwal: {
        select: {
          id: true,
          hari: true,
          jamMulai: true,
          jamSelesai: true
        }
      }
    }
  });

  const santriIds = halaqahDataList.flatMap(h => h.santri.map(s => s.santriId));

  // Fetch target hafalan for all santri in guru's halaqah
  const allTargets = await prisma.targetHafalan.findMany({
    where: { santriId: { in: santriIds } },
    select: {
      id: true,
      surat: true,
      ayatTarget: true,
      deadline: true,
      status: true,
      santriId: true
    },
    orderBy: { deadline: 'asc' }
  });

  // Group targets by santriId
  const targetsBySantri: Record<number, typeof allTargets> = {};
  allTargets.forEach((target) => {
    if (!targetsBySantri[target.santriId]) {
      targetsBySantri[target.santriId] = [];
    }
    targetsBySantri[target.santriId].push(target);
  });

  const formattedHalaqahData = halaqahDataList.map((halaqah) => ({
    id: halaqah.id,
    namaHalaqah: halaqah.namaHalaqah,
    jumlahSantri: halaqah.santri.length,
    santri: halaqah.santri.map((hs) => ({
      ...hs.santri,
      targets: (targetsBySantri[hs.santriId] || []).map(t => ({
        ...t,
        deadline: t.deadline instanceof Date ? t.deadline.toISOString() : String(t.deadline),
        status: String(t.status)
      }))
    })),
    jadwal: halaqah.jadwal.map((j) => ({
      id: j.id,
      hari: j.hari,
      waktuMulai: j.jamMulai ? new Date(j.jamMulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '',
      waktuSelesai: j.jamSelesai ? new Date(j.jamSelesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '',
      materi: ''
    }))
  }));

  const halaqahData = {
    halaqah: formattedHalaqahData,
    totalHalaqah: formattedHalaqahData.length,
    totalSantri: formattedHalaqahData.reduce((sum, h) => sum + h.jumlahSantri, 0)
  };

  // Fetch analytics data
  const totalSantri = santriIds.length;
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [hafalanToday, absensiHadir, absensiTotal, targetTertunda, totalHafalan, hafalan7Days, absensiTidakHadir] = await Promise.all([
    prisma.hafalan.count({
      where: { tanggal: { gte: startOfDay, lt: endOfDay }, santriId: { in: santriIds } }
    }),
    prisma.absensi.count({
      where: { tanggal: { gte: startOfDay, lt: endOfDay }, santriId: { in: santriIds }, status: 'masuk' }
    }),
    prisma.absensi.count({
      where: { tanggal: { gte: startOfDay, lt: endOfDay }, santriId: { in: santriIds } }
    }),
    prisma.targetHafalan.count({
      where: { deadline: { lt: today }, status: { in: ['belum', 'proses'] }, santriId: { in: santriIds } }
    }),
    prisma.hafalan.count({
      where: { santriId: { in: santriIds } }
    }),
    prisma.hafalan.findMany({
      where: { santriId: { in: santriIds }, tanggal: { gte: sevenDaysAgo } },
      select: { tanggal: true, status: true, ayatMulai: true, ayatSelesai: true },
      orderBy: { tanggal: 'asc' }
    }),
    prisma.absensi.count({
      where: { tanggal: { gte: startOfDay, lt: endOfDay }, santriId: { in: santriIds }, status: { not: 'masuk' } }
    })
  ]);

  // Process 7-day hafalan chart data
  const hafalanProgress: { date: string; ziyadah: number; murajaah: number; total: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - i);
    const dateStr = dateObj.toISOString().split('T')[0];

    const dayRecords = hafalan7Days.filter(h =>
      new Date(h.tanggal).toISOString().split('T')[0] === dateStr
    );

    let ziyadah = 0;
    let murajaah = 0;
    dayRecords.forEach(h => {
      const ayatCount = h.ayatSelesai - h.ayatMulai + 1;
      if (h.status === 'ziyadah') ziyadah += ayatCount;
      else murajaah += ayatCount;
    });

    hafalanProgress.push({ date: dateStr, ziyadah, murajaah, total: ziyadah + murajaah });
  }

  const absensiRate = absensiTotal > 0 ? Math.round((absensiHadir / absensiTotal) * 100) : 0;
  const hafalanRate = totalSantri > 0 ? Math.round((totalHafalan / (totalSantri * 30)) * 100) : 0;

  const dashboardStats = {
    overview: {
      totalSantri,
      totalHafalanToday: hafalanToday,
      absensiHadir,
      absensiTotal,
      absensiTidakHadir,
      absensiRate,
      targetTertunda,
      hafalanRate: Math.min(hafalanRate, 100)
    },
    hafalanProgress
  };

  return (
    <GuruDashboardClient 
      dashboardStats={dashboardStats} 
      halaqahData={halaqahData} 
    />
  );
}