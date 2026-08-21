import { prisma } from '@/lib/database/prisma';

export interface AuthUser {
  id: number;
  namaLengkap: string;
  role: { name: string };
}

export class DashboardServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'DashboardServiceError';
  }
}

export class DashboardService {
  static async getGuruDashboard(user: AuthUser) {
    if (user.role.name !== 'guru') throw new DashboardServiceError('Access denied', 403);

    const halaqahData = await prisma.halaqah.findMany({
      where: { guruId: user.id },
      include: {
        santri: { include: { santri: { select: { id: true, namaLengkap: true, username: true } } } },
        jadwal: { select: { id: true, hari: true, jamMulai: true, jamSelesai: true } }
      }
    });

    const formattedData = halaqahData.map(halaqah => ({
      id: halaqah.id,
      namaHalaqah: halaqah.namaHalaqah,
      jumlahSantri: halaqah.santri.length,
      santri: halaqah.santri.map(hs => hs.santri),
      jadwal: halaqah.jadwal
    }));

    return {
      halaqah: formattedData,
      totalHalaqah: formattedData.length,
      totalSantri: formattedData.reduce((sum, h) => sum + h.jumlahSantri, 0)
    };
  }

  static async getOrtuDashboard(user: AuthUser) {
    if (user.role.name !== 'ortu') throw new DashboardServiceError('Access denied', 403);

    const anakList = await prisma.orangTuaSantri.findMany({
      where: { orangTuaId: user.id },
      include: {
        santri: {
          include: {
            Hafalan: { orderBy: { tanggal: 'desc' }, take: 10 },
            TargetHafalan: { orderBy: { deadline: 'asc' } },
            Absensi: { include: { jadwal: { include: { halaqah: true } } }, orderBy: { tanggal: 'desc' }, take: 10 },
            Prestasi: { where: { validated: true }, orderBy: { tahun: 'desc' } },
            ujianSantri: { orderBy: { tanggalUjian: 'desc' }, take: 5 }
          }
        }
      }
    });

    const transformedAnakList = anakList.map(item => ({
      id: item.santri.id,
      namaLengkap: item.santri.namaLengkap,
      username: item.santri.username,
      Hafalan: item.santri.Hafalan.map(h => ({ id: h.id, tanggal: h.tanggal.toISOString().split('T')[0], surat: h.surat, ayatMulai: h.ayatMulai, ayatSelesai: h.ayatSelesai, status: h.status })),
      TargetHafalan: item.santri.TargetHafalan.map(t => ({ id: t.id, surat: t.surat, ayatTarget: t.ayatTarget, deadline: t.deadline.toISOString().split('T')[0], status: t.status })),
      Absensi: item.santri.Absensi.map(a => ({ id: a.id, status: a.status, tanggal: a.tanggal.toISOString().split('T')[0], jadwal: { halaqah: { namaHalaqah: a.jadwal.halaqah.namaHalaqah } } })),
      Prestasi: item.santri.Prestasi.map(p => ({ id: p.id, namaPrestasi: p.namaPrestasi, keterangan: p.keterangan || '', tahun: p.tahun, validated: p.validated })),
      Ujian: item.santri.ujianSantri.map(u => ({ id: u.id, jenis: u.jenisUjianLabel || 'Ujian', nilai: u.nilaiAkhir || 0, tanggal: u.tanggalUjian.toISOString().split('T')[0] }))
    }));

    const pengumuman = await prisma.pengumuman.findMany({
      where: { OR: [{ targetAudience: 'semua' }, { targetAudience: 'guru' }, { targetAudience: 'santri' }] },
      include: { dibacaOleh: { where: { userId: user.id } } },
      orderBy: { tanggal: 'desc' },
      take: 10
    });

    const transformedPengumuman = pengumuman.map(p => ({
      id: p.id, judul: p.judul, isi: p.isi, tanggal: p.tanggal.toISOString().split('T')[0], targetAudience: p.targetAudience, dibacaOleh: p.dibacaOleh
    }));

    return { anakList: transformedAnakList, pengumuman: transformedPengumuman };
  }

  static async getSantriDashboard(user: AuthUser) {
    if (user.role.name !== 'santri') throw new DashboardServiceError('Unauthorized', 401);

    const halaqahSantri = await prisma.halaqahSantri.findFirst({
      where: { santriId: user.id },
      include: { halaqah: { include: { guru: { select: { namaLengkap: true } }, jadwal: true } } }
    });

    if (!halaqahSantri) return { hafalanProgress: [], recentHafalan: [], targets: [], halaqahInfo: null };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const hafalanData = await prisma.hafalan.findMany({
      where: { santriId: user.id, tanggal: { gte: sevenDaysAgo } },
      orderBy: { tanggal: 'asc' }
    });

    const hafalanProgress = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = hafalanData.filter(h => h.tanggal.toISOString().split('T')[0] === dateStr);
      const ziyadah = dayData.filter(h => h.status === 'ziyadah').length;
      const murojaah = dayData.filter(h => h.status === 'murojaah').length;
      hafalanProgress.push({ date: dateStr, ziyadah, murojaah, total: ziyadah + murojaah });
    }

    const recentHafalanRaw = await prisma.hafalan.findMany({
      where: { santriId: user.id },
      include: { santri: { select: { namaLengkap: true } } },
      orderBy: { tanggal: 'desc' },
      take: 10
    });

    const recentHafalan = recentHafalanRaw.map(h => ({
      id: h.id, tanggal: h.tanggal.toISOString().split('T')[0], jenis: h.status, surah: h.surat, ayat: h.ayatMulai + '-' + h.ayatSelesai, guru: halaqahSantri.halaqah.guru?.namaLengkap || 'Tidak ada guru'
    }));

    const targetData = await prisma.targetHafalan.findMany({
      where: { santriId: user.id },
      orderBy: { deadline: 'asc' }
    });

    const targets = targetData.map(t => ({
      id: t.id, judul: 'Target ' + t.surat, deskripsi: 'Target hafalan ' + t.surat + ' sampai ayat ' + t.ayatTarget,
      targetAyat: t.ayatTarget, currentAyat: 0, deadline: t.deadline.toISOString().split('T')[0],
      status: t.status === 'selesai' ? 'completed' : t.status === 'proses' ? 'active' : 'active', kategori: 'ziyadah'
    }));

    targets.forEach(target => {
      const targetHafalan = hafalanData.filter(h => h.surat === target.judul.replace('Target ', ''));
      target.currentAyat = targetHafalan.reduce((sum, h) => sum + (h.ayatSelesai - h.ayatMulai + 1), 0);
    });

    return {
      hafalanProgress, recentHafalan, targets,
      halaqahInfo: {
        namaHalaqah: halaqahSantri.halaqah.namaHalaqah, guru: halaqahSantri.halaqah.guru?.namaLengkap || 'Tidak ada guru',
        jadwal: halaqahSantri.halaqah.jadwal.map(j => ({
          id: j.id, hari: j.hari,
          waktuMulai: j.jamMulai ? new Date(j.jamMulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '',
          waktuSelesai: j.jamSelesai ? new Date(j.jamSelesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '',
          materi: null
        }))
      }
    };
  }

  static async getAdminDashboardStats(user: AuthUser) {
    if (!['super_admin'].includes(user.role.name)) throw new DashboardServiceError('Unauthorized', 401);

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(now.getDate() - now.getDay() - 7);
    lastWeekStart.setHours(0, 0, 0, 0);
    const lastWeekEnd = new Date(now);
    lastWeekEnd.setDate(now.getDate() - now.getDay());
    lastWeekEnd.setHours(23, 59, 59, 999);

    const [
      totalTemplateUjian,
      totalTemplateRaport,
      templateBulanIni,
      templateBulanLalu,
      totalUjianAktif,
      ujianMingguIni,
      ujianMingguLalu,
      totalLaporan,
      laporanBulanIni,
      laporanBulanLalu,
      totalPengguna,
      penggunaBaru,
      penggunaBulanLalu,
      halaqahList
    ] = await Promise.all([
      prisma.templateUjian.count(),
      prisma.templateRaport.count(),
      prisma.templateUjian.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.templateUjian.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
      prisma.ujianSantri.count({ where: { statusUjian: { not: "draft" } } }),
      prisma.ujianSantri.count({ where: { statusUjian: { not: "draft" }, createdAt: { gte: startOfWeek } } }),
      prisma.ujianSantri.count({ where: { statusUjian: { not: "draft" }, createdAt: { gte: lastWeekStart, lte: lastWeekEnd } } }),
      prisma.raportSantri.count(),
      prisma.raportSantri.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.raportSantri.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
      prisma.halaqah.findMany({
        include: {
          _count: { select: { santri: true } },
          santri: {
            include: {
              santri: {
                select: {
                  id: true,
                  namaLengkap: true,
                  Hafalan: { where: { tanggal: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } }, orderBy: { tanggal: "desc" }, take: 1 },
                },
              },
            },
          },
        },
        take: 4,
      })
    ]);

    const calcTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const halaqahPerformance = halaqahList.map((h) => {
      const santriCount = h._count.santri;
      const santriWithHafalan = h.santri.filter((hs) => hs.santri.Hafalan.length > 0);
      const hafalanRate = santriCount > 0 ? Math.round((santriWithHafalan.length / santriCount) * 100) : 0;

      return {
        nama: h.namaHalaqah,
        santri: santriCount,
        nilai: hafalanRate,
        trend: '+' + (Math.random() * 3 + 0.5).toFixed(1),
      };
    });

    return {
      stats: {
        totalTemplate: { value: totalTemplateUjian + totalTemplateRaport, tag: '+' + templateBulanIni + ' bulan ini', tagColor: "blue" },
        ujianAktif: { value: totalUjianAktif, tag: '+' + ujianMingguIni + ' minggu ini', tagColor: "green" },
        dataLaporan: { value: totalLaporan, tag: totalLaporan + ' tersedia', tagColor: "purple" },
        totalPengguna: { value: totalPengguna, tag: '+' + penggunaBaru + ' baru', tagColor: "orange" },
      },
      tren: {
        ujianMingguIni: { value: ujianMingguIni, trend: calcTrend(ujianMingguIni, ujianMingguLalu) },
        raportBulanIni: { value: laporanBulanIni, trend: calcTrend(laporanBulanIni, laporanBulanLalu) },
        templateBaru: { value: templateBulanIni, trend: calcTrend(templateBulanIni, templateBulanLalu) },
        penggunaBaru: { value: penggunaBaru, trend: calcTrend(penggunaBaru, penggunaBulanLalu) },
      },
      halaqahPerformance,
      lastUpdated: now.toISOString(),
    };
  }
}
