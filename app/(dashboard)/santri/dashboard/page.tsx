import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/database/prisma';
import SantriDashboardClient from './SantriDashboardClient';
import { redirect } from 'next/navigation';
import dayjs from 'dayjs';

export const dynamic = 'force-dynamic';

export default async function SantriDashboardPage() {
  const { user: authUser, error } = await getAuthUser();
  if (error || !authUser || authUser.role.name !== 'santri') {
    redirect('/login');
  }

  const santriId = authUser.id;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 1. Fetch data in parallel
  const [allHafalanData, targetHafalan, santriHalaqah] = await Promise.all([
    prisma.hafalan.findMany({
      where: { santriId: santriId },
      orderBy: { tanggal: 'asc' }
    }),
    prisma.targetHafalan.findMany({
      where: { santriId: santriId },
      orderBy: { deadline: 'asc' }
    }),
    prisma.halaqahSantri.findFirst({
      where: { santriId: santriId },
      include: {
        halaqah: {
          include: {
            guru: {
              select: { namaLengkap: true }
            },
            jadwal: true
          }
        }
      }
    })
  ]);

  // --- Processing Hafalan ---
  const hafalanData = allHafalanData.filter(h => new Date(h.tanggal) >= thirtyDaysAgo);

  // Process hafalan data for chart (last 7 days)
  const hafalanProgress = [];
  for (let i = 6; i >= 0; i--) {
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - i);
    const dateStr = dateObj.toISOString().split('T')[0];

    const dayHafalan = hafalanData.filter(h => 
      new Date(h.tanggal).toISOString().split('T')[0] === dateStr
    );
    
    let ziyadahAyat = 0;
    let murajaahAyat = 0;
    
    dayHafalan.forEach(h => {
      const ayatCount = h.ayatSelesai - h.ayatMulai + 1;
      if (h.status === 'ziyadah') {
        ziyadahAyat += ayatCount;
      } else if (h.status === 'murojaah' || h.status === 'murajaah') {
        murajaahAyat += ayatCount;
      }
    });

    hafalanProgress.push({
      date: dateStr,
      ziyadah: ziyadahAyat,
      murajaah: murajaahAyat,
      total: ziyadahAyat + murajaahAyat
    });
  }

  // Recent Hafalan (last 5 items)
  const recentHafalan = [...allHafalanData].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).slice(0, 5).map(h => ({
    id: h.id,
    tanggal: new Date(h.tanggal).toISOString(),
    jenis: (h.status === 'ziyadah' ? 'ziyadah' : 'murajaah') as 'ziyadah' | 'murajaah',
    surah: h.surat,
    ayat: `${h.ayatMulai}-${h.ayatSelesai}`,
    guru: 'Unknown'
  }));

  const totalSetoran = allHafalanData.length;

  // --- Processing Targets ---
  const targets = targetHafalan.map(target => {
    // Get total unique ayat hafalan ziyadah for this surat
    const hafalanRecords = allHafalanData.filter(h => 
      h.surat.toLowerCase() === target.surat.toLowerCase() && h.status === 'ziyadah'
    );

    const ayatSet = new Set<number>();
    hafalanRecords.forEach(record => {
      for (let i = record.ayatMulai; i <= record.ayatSelesai; i++) {
        ayatSet.add(i);
      }
    });

    const currentAyat = ayatSet.size;
    const progress = Math.min(Math.round((currentAyat / target.ayatTarget) * 100), 100);
    
    let status = target.status;
    if (progress >= 100 && target.status !== 'selesai') {
      status = 'selesai';
      // Ideally update DB here, but since it's GET, just map the status
    } else if (progress > 0 && target.status === 'belum') {
      status = 'proses';
    }

    return {
      id: target.id,
      judul: `Target ${target.surat}`,
      deskripsi: `Menghafal ${target.surat} sampai ayat ${target.ayatTarget}`,
      targetAyat: target.ayatTarget,
      currentAyat: currentAyat,
      deadline: target.deadline.toISOString(),
      status: (status === 'selesai' ? 'completed' : 
               new Date(target.deadline) < new Date() ? 'overdue' : 'active') as 'active' | 'completed' | 'overdue',
      kategori: 'ziyadah' as const,
      progress
    };
  });

  const activeTargets = targets.filter(t => t.status === 'active' || t.status === 'overdue').length;
  const totalTargetProgress = targets.length > 0
    ? Math.round(targets.reduce((sum, t) => sum + (t.progress || 0), 0) / targets.length)
    : 0;

  // --- Processing Halaqah ---
  let halaqahInfo = null;
  if (santriHalaqah?.halaqah) {
    const hal = santriHalaqah.halaqah;
    halaqahInfo = {
      namaHalaqah: hal.namaHalaqah,
      guru: hal.guru?.namaLengkap || 'Belum ada guru',
      jadwal: hal.jadwal.map(j => ({
        id: j.id,
        hari: j.hari,
        waktuMulai: j.jamMulai ? new Date(j.jamMulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '',
        waktuSelesai: j.jamSelesai ? new Date(j.jamSelesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '',
        materi: ''
      }))
    };
  }

  return (
    <SantriDashboardClient 
      hafalanProgress={hafalanProgress}
      recentHafalan={recentHafalan}
      targets={targets}
      halaqahInfo={halaqahInfo}
      totalSetoran={totalSetoran}
      activeTargets={activeTargets}
      totalTargetProgress={totalTargetProgress}
    />
  );
}