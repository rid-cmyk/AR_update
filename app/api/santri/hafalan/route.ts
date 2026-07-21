import { getAuthUser } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';

export async function GET() {
  try {
    const { user: authUser, error } = await getAuthUser();
    if (error || !authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const santri = await prisma.user.findUnique({
      where: { id: authUser.id }
    });

    if (!santri) {
      return NextResponse.json({
        success: false,
        message: 'Santri tidak ditemukan'
      }, { status: 404 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch all hafalan and target hafalan in parallel
    const [allHafalanData, targetHafalan] = await Promise.all([
      prisma.hafalan.findMany({
        where: { santriId: santri.id },
        orderBy: { tanggal: 'asc' }
      }),
      prisma.targetHafalan.findMany({
        where: { santriId: santri.id },
        orderBy: { deadline: 'asc' }
      })
    ]);

    const hafalanData = allHafalanData.filter(h => new Date(h.tanggal) >= thirtyDaysAgo);

    // Calculate progress for targets in-memory without extra DB queries
    const targetsWithProgress = targetHafalan.map(target => {
      const targetHafalanData = allHafalanData
        .filter(h => h.surat.toLowerCase() === target.surat.toLowerCase() && new Date(h.tanggal) <= new Date(target.deadline))
        .sort((a, b) => b.ayatSelesai - a.ayatSelesai);

      let currentAyat = 0;
      if (targetHafalanData.length > 0) {
        currentAyat = Math.min(targetHafalanData[0].ayatSelesai, target.ayatTarget);
      }

      const getJuzFromSurah = (surah: string) => {
        const surahLower = surah.toLowerCase();
        if (surahLower.includes('fatihah')) return 1;
        if (surahLower.includes('baqarah')) return 1;
        if (surahLower.includes('imran')) return 3;
        if (surahLower.includes('nisa')) return 4;
        if (surahLower.includes('maidah')) return 6;
        return 30;
      };

      return {
        id: target.id,
        judul: `Target ${target.surat}`,
        deskripsi: `Menghafal ${target.surat} sampai ayat ${target.ayatTarget}`,
        targetAyat: target.ayatTarget,
        currentAyat: currentAyat,
        deadline: target.deadline.toISOString(),
        status: target.status === 'selesai' ? 'completed' : 
                currentAyat >= target.ayatTarget ? 'completed' : 'active',
        kategori: 'ziyadah',
        createdBy: 'Ustadz Ahmad',
        priority: new Date(target.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'high' : 'medium',
        surah: target.surat,
        juzTarget: getJuzFromSurah(target.surat),
        ayatMulai: 1,
        ayatSelesai: target.ayatTarget
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

    const cumulativeAyat = totalAyatHafalan;
    last10Days.forEach(dateStr => {
      const dayHafalan = hafalanData.filter(h => 
        new Date(h.tanggal).toISOString().split('T')[0] === dateStr
      );
      
      let ziyadahAyat = 0;
      let murajaahAyat = 0;
      
      dayHafalan.forEach(h => {
        const ayatCount = h.ayatSelesai - h.ayatMulai + 1;
        if (h.status === 'ziyadah') {
          ziyadahAyat += ayatCount;
        } else if (h.status === 'murojaah') {
          murajaahAyat += ayatCount;
        }
      });

      const total = ziyadahAyat + murajaahAyat;

      progressData.push({
        date: dateStr,
        ziyadah: ziyadahAyat,
        murajaah: murajaahAyat,
        total: total,
        cumulative: cumulativeAyat
      });
    });

    // Calculate overview stats
    const totalAyatZiyadah = allHafalanData
      .filter(h => h.status === 'ziyadah')
      .reduce((sum, h) => sum + (h.ayatSelesai - h.ayatMulai + 1), 0);

    const totalAyatMurajaah = allHafalanData
      .filter(h => h.status === 'murojaah')
      .reduce((sum, h) => sum + (h.ayatSelesai - h.ayatMulai + 1), 0);

    const activeTargets = targetsWithProgress.filter(t => t.status === 'active').length;
    const completedTargets = targetsWithProgress.filter(t => t.status === 'completed').length;

    return NextResponse.json({
      success: true,
      data: {
        recentHafalan: hafalanData.slice(0, 10).map(h => ({
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
          totalAyatZiyadah,
          totalAyatMurajaah,
          activeTargets,
          completedTargets,
          totalJuzCompleted: Math.floor(totalAyatZiyadah / 200) // approx 200 ayat per juz
        }
      }
    });

  } catch (error) {
    console.error('Error fetching santri hafalan:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal mengambil data hafalan santri'
    }, { status: 500 });
  }
}