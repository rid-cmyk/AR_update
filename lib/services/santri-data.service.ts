import { prisma } from '@/lib/database/prisma';

export interface AuthUser {
  id: number;
  namaLengkap: string;
  role: { name: string };
}

export class SantriDataServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'SantriDataServiceError';
  }
}

export class SantriDataService {
  static async getHafalan(user: AuthUser) {
    if (user.role.name !== 'santri') throw new SantriDataServiceError('Unauthorized', 401);

    const santri = await prisma.user.findUnique({ where: { id: user.id } });
    if (!santri) throw new SantriDataServiceError('Santri tidak ditemukan', 404);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [allHafalanData, targetHafalan] = await Promise.all([
      prisma.hafalan.findMany({ where: { santriId: santri.id }, orderBy: { tanggal: 'asc' } }),
      prisma.targetHafalan.findMany({ where: { santriId: santri.id }, orderBy: { deadline: 'asc' } })
    ]);

    const hafalanData = allHafalanData.filter(h => new Date(h.tanggal) >= thirtyDaysAgo);

    const getJuzFromSurah = (surah: string) => {
      const surahLower = surah.toLowerCase();
      if (surahLower.includes('fatihah')) return 1;
      if (surahLower.includes('baqarah')) return 1;
      if (surahLower.includes('imran')) return 3;
      if (surahLower.includes('nisa')) return 4;
      if (surahLower.includes('maidah')) return 6;
      return 30;
    };

    const targetsWithProgress = targetHafalan.map(target => {
      const targetHafalanData = allHafalanData
        .filter(h => h.surat.toLowerCase() === target.surat.toLowerCase() && new Date(h.tanggal) <= new Date(target.deadline))
        .sort((a, b) => b.ayatSelesai - a.ayatSelesai);

      let currentAyat = 0;
      if (targetHafalanData.length > 0) currentAyat = Math.min(targetHafalanData[0].ayatSelesai, target.ayatTarget);

      return {
        id: target.id,
        judul: 'Target ' + target.surat,
        deskripsi: 'Menghafal ' + target.surat + ' sampai ayat ' + target.ayatTarget,
        targetAyat: target.ayatTarget,
        currentAyat: currentAyat,
        deadline: target.deadline.toISOString(),
        status: target.status === 'selesai' ? 'completed' : currentAyat >= target.ayatTarget ? 'completed' : 'active',
        kategori: 'ziyadah',
        createdBy: 'Ustadz Ahmad',
        priority: new Date(target.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'high' : 'medium',
        surah: target.surat,
        juzTarget: getJuzFromSurah(target.surat),
        ayatMulai: 1,
        ayatSelesai: target.ayatTarget
      };
    });

    const progressData: any[] = [];
    const last10Days: string[] = [];
    for (let i = 9; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last10Days.push(date.toISOString().split('T')[0]);
    }

    let totalAyatHafalan = 0;
    allHafalanData.forEach(h => totalAyatHafalan += (h.ayatSelesai - h.ayatMulai + 1));
    const cumulativeAyat = totalAyatHafalan;

    last10Days.forEach(dateStr => {
      const dayHafalan = hafalanData.filter(h => new Date(h.tanggal).toISOString().split('T')[0] === dateStr);
      let ziyadahAyat = 0, murajaahAyat = 0;
      dayHafalan.forEach(h => {
        const ayatCount = h.ayatSelesai - h.ayatMulai + 1;
        if (h.status === 'ziyadah') ziyadahAyat += ayatCount;
        else if (h.status === 'murojaah') murajaahAyat += ayatCount;
      });
      progressData.push({ date: dateStr, ziyadah: ziyadahAyat, murajaah: murajaahAyat, total: ziyadahAyat + murajaahAyat, cumulative: cumulativeAyat });
    });

    const totalAyatZiyadah = allHafalanData.filter(h => h.status === 'ziyadah').reduce((sum, h) => sum + (h.ayatSelesai - h.ayatMulai + 1), 0);
    const totalAyatMurajaah = allHafalanData.filter(h => h.status === 'murojaah').reduce((sum, h) => sum + (h.ayatSelesai - h.ayatMulai + 1), 0);
    const activeTargets = targetsWithProgress.filter(t => t.status === 'active').length;
    const completedTargets = targetsWithProgress.filter(t => t.status === 'completed').length;

    return {
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
        totalJuzCompleted: Math.floor(totalAyatZiyadah / 200)
      }
    };
  }

  static async getHalaqahInfo(user: AuthUser) {
    if (user.role.name !== 'santri') throw new SantriDataServiceError('Unauthorized', 401);

    const halaqahSantri = await prisma.halaqahSantri.findFirst({
      where: { santriId: user.id },
      include: {
        semester: { include: { tahunAjaran: true } },
        halaqah: {
          include: {
            guru: { select: { id: true, namaLengkap: true, username: true } },
            jadwal: { orderBy: { hari: 'asc' } }
          }
        }
      }
    });

    if (!halaqahSantri) return null;

    const halaqahObj = (halaqahSantri as any).halaqah;
    const jadwalFormatted = halaqahObj.jadwal.map((j: any) => ({
      id: j.id,
      hari: j.hari,
      waktuMulai: j.jamMulai ? new Date(j.jamMulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '',
      waktuSelesai: j.jamSelesai ? new Date(j.jamSelesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '',
      materi: null
    }));

    return {
      namaHalaqah: halaqahObj.namaHalaqah,
      guru: halaqahObj.guru?.namaLengkap || 'Unknown',
      jadwal: jadwalFormatted,
      tahunAjaran: halaqahSantri.semester?.tahunAjaran ? {
        id: halaqahSantri.semester.tahunAjaran.id,
        namaLengkap: halaqahSantri.semester.tahunAjaran.namaLengkap,
        semester: halaqahSantri.semester.namaSemester
      } : null
    };
  }

  static async getAbsensi(user: AuthUser, filters: { startDate?: string; endDate?: string; limit?: number }) {
    if (user.role.name !== 'santri') throw new SantriDataServiceError('Unauthorized', 401);

    const whereClause: any = { santriId: user.id };
    if (filters.startDate && filters.endDate) {
      whereClause.tanggal = { gte: new Date(filters.startDate + 'T00:00:00.000Z'), lte: new Date(filters.endDate + 'T23:59:59.999Z') };
    } else if (filters.startDate) {
      whereClause.tanggal = { gte: new Date(filters.startDate + 'T00:00:00.000Z') };
    } else if (filters.endDate) {
      whereClause.tanggal = { lte: new Date(filters.endDate + 'T23:59:59.999Z') };
    }

    const absensiData = await prisma.absensi.findMany({
      where: whereClause,
      include: { jadwal: { include: { halaqah: { include: { guru: { select: { id: true, namaLengkap: true } } } } } } },
      orderBy: { tanggal: 'desc' },
      take: filters.limit
    });

    const totalAbsensi = absensiData.length;
    const totalHadir = absensiData.filter(a => a.status === 'masuk').length;
    const totalIzin = absensiData.filter(a => a.status === 'izin').length;
    const totalAlpha = absensiData.filter(a => a.status === 'alpha').length;
    const attendanceRate = totalAbsensi > 0 ? Math.round((totalHadir / totalAbsensi) * 100) : 0;

    let currentStreak = 0;
    const sortedAbsensi = [...absensiData].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
    for (const absensi of sortedAbsensi) {
      if (absensi.status === 'masuk') currentStreak++;
      else break;
    }

    let bestStreak = 0, tempStreak = 0;
    for (const absensi of [...sortedAbsensi].reverse()) {
      if (absensi.status === 'masuk') {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else tempStreak = 0;
    }

    const formattedAbsensi = absensiData.map(absensi => ({
      id: absensi.id,
      tanggal: absensi.tanggal.toISOString().split('T')[0],
      status: absensi.status === 'masuk' ? 'hadir' : absensi.status,
      halaqah: absensi.jadwal.halaqah.namaHalaqah,
      guru: absensi.jadwal.halaqah.guru?.namaLengkap || 'Unknown',
      hari: absensi.jadwal.hari,
      jamMulai: absensi.jadwal.jamMulai.toTimeString().slice(0, 5),
      jamSelesai: absensi.jadwal.jamSelesai.toTimeString().slice(0, 5)
    }));

    return {
      absensi: formattedAbsensi,
      stats: { totalHadir, totalIzin, totalAlpha, attendanceRate, currentStreak, bestStreak, totalAbsensi }
    };
  }
}
