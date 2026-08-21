import { prisma } from '@/lib/database/prisma';
import { type AuthUser } from '@/lib/auth';
import { withApiCache } from '@/lib/api-cache';
import {
  calculatePerJuzKKMStatus,
  calculateHafalanVelocity,
  predictCompletionAndRisk,
} from '@/lib/services/predictiveAnalytics';

export class AnalyticsService {
  static async getDashboard() {
    return withApiCache('analytics:dashboard', 60_000, async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [rolesWithCount, totalHalaqah, totalJadwal, totalPengumuman, totalAbsensi, absensiMasuk, santriWithRecentHafalan, recentHafalan, recentAbsensi, halaqahPerformance, recentAnnouncements] = await Promise.all([
        prisma.role.findMany({
          select: {
            name: true,
            _count: { select: { users: true } }
          }
        }),
        prisma.halaqah.count(),
        prisma.jadwal.count(),
        prisma.pengumuman.count(),
        prisma.absensi.count(),
        prisma.absensi.count({ where: { status: 'masuk' } }),
        prisma.hafalan.groupBy({ by: ['santriId'], where: { tanggal: { gte: thirtyDaysAgo } }, _count: true }),
        prisma.hafalan.findMany({ take: 10, orderBy: { tanggal: 'desc' }, include: { santri: { select: { namaLengkap: true } } } }),
        prisma.absensi.findMany({ take: 10, orderBy: { tanggal: 'desc' }, include: { santri: { select: { namaLengkap: true } }, jadwal: { include: { halaqah: { select: { namaHalaqah: true } } } } } }),
        prisma.halaqah.findMany({ include: { _count: { select: { santri: true } } } }),
        prisma.pengumuman.findMany({ take: 5, orderBy: { tanggal: 'desc' }, select: { id: true, judul: true, tanggal: true } })
      ]);

      const roleCountMap = new Map(
        rolesWithCount.map(r => [r.name.toLowerCase().replace(/-/g, '_'), r._count.users])
      );

      const totalSantri = roleCountMap.get('santri') ?? 0;
      const totalGuru = roleCountMap.get('guru') ?? 0;
      const totalSuperAdmin = roleCountMap.get('super_admin') ?? 0;
      const totalAdmin = roleCountMap.get('admin') ?? totalSuperAdmin;
      const totalOrtu = roleCountMap.get('ortu') ?? 0;
      const totalYayasan = roleCountMap.get('yayasan') ?? 0;
      const totalUsers = rolesWithCount.reduce((sum, r) => sum + r._count.users, 0);
      const totalRoles = rolesWithCount.length;

      return {
        overview: { totalSantri, totalGuru, totalAdmin, totalSuperAdmin, totalOrtu, totalYayasan, totalHalaqah, totalJadwal, totalPengumuman, totalUsers, totalRoles },
        performance: { attendanceRate: totalAbsensi > 0 ? Math.round((absensiMasuk / totalAbsensi) * 100) : 0, hafalanRate: totalSantri > 0 ? Math.round((santriWithRecentHafalan.length / totalSantri) * 100) : 0 },
        halaqahStats: halaqahPerformance.map(h => ({ id: h.id, namaHalaqah: h.namaHalaqah, santriCount: h._count.santri, hafalanCount: 0, attendanceRate: 0, hafalanRate: 0 })),
        recentAnnouncements: recentAnnouncements.map(a => ({ id: a.id, title: a.judul, date: a.tanggal.toISOString().split('T')[0] })),
        recentActivities: {
          hafalan: recentHafalan.map(h => ({ id: h.id, type: 'hafalan' as const, description: `${h.santri?.namaLengkap || 'Unknown'} - ${h.surat} (${h.ayatMulai}-${h.ayatSelesai})`, date: h.tanggal.toISOString().split('T')[0] })),
          absensi: recentAbsensi.map(a => ({ id: a.id, type: 'absensi' as const, description: `${a.santri?.namaLengkap || 'Unknown'} - ${a.jadwal?.halaqah?.namaHalaqah || 'Unknown'} (${a.status})`, date: a.tanggal.toISOString().split('T')[0] }))
        }
      };
    });
  }

  static async getGuruDashboard(user: AuthUser) {
    return withApiCache(`analytics:guru-dashboard:${user.id}`, 30_000, async () => {
      const guru = await prisma.user.findUnique({ where: { id: user.id }, select: { id: true, namaLengkap: true } });
      if (!guru) throw new AnalyticsServiceError('Guru tidak ditemukan', 404);

      const halaqahList = await prisma.halaqah.findMany({ where: { guruId: guru.id }, include: { santri: { select: { santriId: true } } } });
      const totalSantri = halaqahList.reduce((total, h) => total + h.santri.length, 0);
      const santriIds = halaqahList.flatMap(h => h.santri.map(s => s.santriId));

      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const [hafalanToday, absensiHadir, absensiTotal, targetTertunda, totalHafalan, recentUjian] = await Promise.all([
        prisma.hafalan.count({ where: { tanggal: { gte: startOfDay, lt: endOfDay }, santriId: { in: santriIds } } }),
        prisma.absensi.count({ where: { tanggal: { gte: startOfDay, lt: endOfDay }, santriId: { in: santriIds }, status: 'masuk' } }),
        prisma.absensi.count({ where: { tanggal: { gte: startOfDay, lt: endOfDay }, santriId: { in: santriIds } } }),
        prisma.targetHafalan.count({ where: { deadline: { lt: today }, status: { in: ['belum', 'proses'] }, santriId: { in: santriIds } } }),
        prisma.hafalan.count({ where: { santriId: { in: santriIds } } }),
        prisma.ujianSantri.findMany({ where: { createdBy: guru.id }, select: { id: true, santri: { select: { namaLengkap: true } }, templateUjian: { select: { jenisUjian: true } }, nilaiAkhir: true, tanggalUjian: true }, orderBy: { tanggalUjian: 'desc' }, take: 5 })
      ]);

      return {
        overview: { totalSantri, totalHafalanToday: hafalanToday, absensiHadir, absensiTotal, absensiRate: absensiTotal > 0 ? Math.round((absensiHadir / absensiTotal) * 100) : 0, targetTertunda, hafalanRate: Math.min(totalSantri > 0 ? Math.round((totalHafalan / (totalSantri * 30)) * 100) : 0, 100) },
        halaqah: halaqahList.map(h => ({ id: h.id, namaHalaqah: h.namaHalaqah, totalSantri: h.santri.length, santriAktif: h.santri.length })),
        recentActivity: { ujian: recentUjian.map(u => ({ id: u.id, santriNama: u.santri.namaLengkap, jenisUjian: u.templateUjian.jenisUjian, nilaiAkhir: u.nilaiAkhir, tanggal: u.tanggalUjian.toISOString() })), hafalan: [], absensi: [] },
        lastUpdated: new Date().toISOString()
      };
    });
  }

  static async getReports(startDate?: string | null, endDate?: string | null) {
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();
    const [halaqahReports, santriReports, guruReports, summary] = await Promise.all([
      AnalyticsService.getHalaqahReports(start, end),
      AnalyticsService.getSantriReports(start, end),
      AnalyticsService.getGuruReports(start, end),
      AnalyticsService.getSummaryStatistics(start, end)
    ]);
    return { halaqahReports, santriReports, guruReports, summary, metadata: { dateRange: { start, end }, generatedAt: new Date().toISOString() } };
  }

  static async getGlobalReports(reportType?: string | null) {
    switch (reportType) {
      case 'hafalan': return AnalyticsService.getGlobalHafalanReport();
      case 'absensi': return AnalyticsService.getGlobalAbsensiReport();
      case 'prestasi': return AnalyticsService.getGlobalPrestasiReport();
      case 'halaqah': return AnalyticsService.getGlobalHalaqahReport();
      default: return AnalyticsService.getOverviewReport();
    }
  }

  static async getTahfidzReports(semester: string, tahunAjaran: string) {
    const currentYear = new Date().getFullYear();
    const startDate = semester === 'S1' ? new Date(currentYear, 6, 1) : new Date(currentYear + 1, 0, 1);
    const endDate = semester === 'S1' ? new Date(currentYear, 11, 31) : new Date(currentYear + 1, 5, 30);

    const santriList = await prisma.user.findMany({
      where: { role: { name: 'santri' } },
      select: {
        id: true, namaLengkap: true,
        HalaqahSantri: { select: { halaqah: { select: { namaHalaqah: true, guru: { select: { namaLengkap: true } } } } }, take: 1 },
        _count: { select: { Absensi: { where: { tanggal: { gte: startDate, lte: endDate } } }, TargetHafalan: { where: { deadline: { gte: startDate, lte: endDate } } }, Prestasi: true } },
        Hafalan: { where: { tanggal: { gte: startDate, lte: endDate } }, select: { status: true, ayatMulai: true, ayatSelesai: true } },
        Absensi: { where: { tanggal: { gte: startDate, lte: endDate }, status: 'masuk' }, select: { id: true } },
        TargetHafalan: { where: { deadline: { gte: startDate, lte: endDate }, status: 'selesai' }, select: { id: true } }
      }
    });

    const reports = santriList.map(santri => {
      const totalHafalan = santri.Hafalan.length;
      const totalAyat = santri.Hafalan.reduce((sum, h) => sum + (h.ayatSelesai - h.ayatMulai + 1), 0);
      const totalAbsensi = santri._count.Absensi;
      const presentCount = santri.Absensi.length;
      const absensiRate = totalAbsensi > 0 ? (presentCount / totalAbsensi) * 100 : 0;
      const totalTarget = santri._count.TargetHafalan;
      const completedTarget = santri.TargetHafalan.length;
      const targetRate = totalTarget > 0 ? (completedTarget / totalTarget) * 100 : 0;
      const totalPrestasi = santri._count.Prestasi;
      const hafalanScore = Math.min((totalAyat / 100) * 30, 30);
      const absensiScore = (absensiRate / 100) * 25;
      const targetScore = (targetRate / 100) * 25;
      const prestasiScore = Math.min(totalPrestasi * 5, 20);
      const nilaiAkhir = Math.round(hafalanScore + absensiScore + targetScore + prestasiScore);
      let statusAkhir = 'Merah';
      if (nilaiAkhir >= 80 && absensiRate >= 80) statusAkhir = 'Hijau';
      else if (nilaiAkhir >= 60 && absensiRate >= 60) statusAkhir = 'Kuning';
      return {
        santriId: santri.id, namaSantri: santri.namaLengkap,
        halaqah: santri.HalaqahSantri[0]?.halaqah.namaHalaqah || 'Tidak ada halaqah',
        guru: santri.HalaqahSantri[0]?.halaqah.guru?.namaLengkap || 'Tidak ada guru',
        hafalan: { total: totalHafalan, ziyadah: santri.Hafalan.filter(h => h.status === 'ziyadah').length, murojaah: santri.Hafalan.filter(h => h.status === 'murojaah').length, totalAyat },
        absensi: { total: totalAbsensi, present: presentCount, rate: Math.round(absensiRate * 100) / 100 },
        target: { total: totalTarget, completed: completedTarget, rate: Math.round(targetRate * 100) / 100 },
        prestasi: totalPrestasi, nilaiAkhir, statusAkhir,
        catatan: AnalyticsService.generateCatatan({ absensiRate, totalAyat, targetRate, totalPrestasi })
      };
    });

    return {
      reports, summary: {
        totalSantri: reports.length,
        averageNilai: reports.length > 0 ? Math.round(reports.reduce((sum, r) => sum + r.nilaiAkhir, 0) / reports.length * 100) / 100 : 0,
        averageKehadiran: reports.length > 0 ? Math.round(reports.reduce((sum, r) => sum + r.absensi.rate, 0) / reports.length * 100) / 100 : 0,
        averageTargetCompletion: reports.length > 0 ? Math.round(reports.reduce((sum, r) => sum + r.target.rate, 0) / reports.length * 100) / 100 : 0,
        totalHafalan: reports.reduce((sum, r) => sum + r.hafalan.total, 0),
        totalPrestasi: reports.reduce((sum, r) => sum + r.prestasi, 0)
      },
      metadata: { semester, tahunAjaran, generatedAt: new Date().toISOString() }
    };
  }

  static async getUjianReports(startDate?: string | null, endDate?: string | null) {
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();
    const [ujianReports, targetReports] = await Promise.all([
      AnalyticsService.getUjianListReports(start, end),
      AnalyticsService.getTargetListReports(start, end)
    ]);
    return { ujianReports, targetReports, metadata: { dateRange: { start, end }, totalUjian: ujianReports.length, totalTarget: targetReports.length, generatedAt: new Date().toISOString() } };
  }

  static async getUjianAnalytics(filters: { startDate?: string | null; endDate?: string | null; halaqahId?: string | null; jenisUjian?: string | null; guruId?: string | null }) {
    const dateFilter: Record<string, unknown> = filters.startDate && filters.endDate ? { tanggalUjian: { gte: new Date(filters.startDate), lte: new Date(filters.endDate) } } : {};
    const additionalFilters: Record<string, unknown> = {};
    if (filters.halaqahId) additionalFilters.santri = { halaqahSantri: { some: { halaqahId: parseInt(filters.halaqahId) } } };
    if (filters.jenisUjian) additionalFilters.templateUjian = { jenisUjian: filters.jenisUjian };
    if (filters.guruId) additionalFilters.createdBy = filters.guruId;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [ujianData, trendingData] = await Promise.all([
      prisma.ujianSantri.findMany({
        where: { ...dateFilter, ...additionalFilters },
        select: { id: true, santriId: true, tanggalUjian: true, nilaiAkhir: true, statusUjian: true, santri: { select: { namaLengkap: true, HalaqahSantri: { select: { halaqah: { select: { namaHalaqah: true, guru: { select: { id: true, namaLengkap: true } } } } }, take: 1 } } }, templateUjian: { select: { jenisUjian: true } } },
        orderBy: { tanggalUjian: 'desc' }
      }),
      prisma.ujianSantri.findMany({ where: { tanggalUjian: { gte: thirtyDaysAgo }, ...additionalFilters }, select: { tanggalUjian: true, nilaiAkhir: true } })
    ]);

    return { ...AnalyticsService.calculateUjianAnalytics(ujianData), trending: AnalyticsService.calculateTrendingAnalytics(trendingData), rawData: ujianData.map((u: any) => ({ id: u.id, santri: u.santri?.namaLengkap || 'Unknown', jenisUjian: u.templateUjian?.jenisUjian || 'Unknown', nilaiAkhir: u.nilaiAkhir, tanggal: u.tanggalUjian, status: u.statusUjian, halaqah: u.santri?.HalaqahSantri?.[0]?.halaqah?.namaHalaqah || 'Unknown', guru: u.santri?.HalaqahSantri?.[0]?.halaqah?.guru?.namaLengkap || 'Unknown' })) };
  }

  static async getSantriDetail(santriId: string) {
    if (!santriId) throw new AnalyticsServiceError('Santri ID is required', 400);
    const santri = await prisma.user.findUnique({ where: { id: Number(santriId) }, include: { role: true, HalaqahSantri: { include: { halaqah: { include: { guru: { select: { id: true, namaLengkap: true, username: true } }, jadwal: true } } } } } });
    if (!santri) throw new AnalyticsServiceError('Santri not found', 404);

    const [hafalanStats, allHafalan, attendanceStats, targets, absensi, ujianList, rapot, achievements, rankingResult, monthlyProgressResult] = await Promise.all([
      prisma.hafalan.groupBy({ by: ['status'], where: { santriId: Number(santriId) }, _count: { status: true }, _sum: { ayatMulai: true, ayatSelesai: true } }),
      prisma.hafalan.findMany({ where: { santriId: Number(santriId) }, orderBy: { tanggal: 'desc' }, select: { id: true, tanggal: true, status: true, surat: true, ayatMulai: true, ayatSelesai: true, keterangan: true, santri: { select: { HalaqahSantri: { select: { halaqah: { select: { guru: { select: { namaLengkap: true } } } } }, take: 1 } } } } }),
      prisma.absensi.groupBy({ by: ['status'], where: { santriId: Number(santriId) }, _count: { status: true } }),
      prisma.targetHafalan.findMany({ where: { santriId: Number(santriId) }, orderBy: { deadline: 'desc' }, select: { id: true, surat: true, ayatTarget: true, deadline: true, status: true } }),
      prisma.absensi.findMany({ where: { santriId: Number(santriId) }, orderBy: { tanggal: 'desc' }, select: { id: true, tanggal: true, status: true } }),
      prisma.ujianSantri.findMany({ where: { santriId: Number(santriId) }, orderBy: { tanggalUjian: 'desc' }, include: { guru: { select: { namaLengkap: true } }, templateUjian: { select: { namaTemplate: true } } } }),
      prisma.raportSantri.findMany({ where: { santriId: Number(santriId) }, include: { semester: { include: { tahunAjaran: true } } }, orderBy: { createdAt: 'desc' } }),
      prisma.prestasi.findMany({ where: { santriId: Number(santriId) }, orderBy: { tahun: 'desc' } }),
      prisma.$queryRaw<Array<{ id: number; totalAyat: number }>>`SELECT u.id, COALESCE(SUM(h."ayatSelesai" - h."ayatMulai" + 1), 0)::int AS "totalAyat" FROM "User" u INNER JOIN "Role" r ON u."roleId" = r.id LEFT JOIN "Hafalan" h ON h."santriId" = u.id WHERE r.name = 'santri' GROUP BY u.id ORDER BY "totalAyat" DESC`.catch(() => [] as Array<{ id: number; totalAyat: number }>),
      prisma.$queryRaw`SELECT DATE_TRUNC('month', "tanggal") as month, COUNT(*) as hafalan_count, SUM("ayatSelesai" - "ayatMulai" + 1) as ayat_count FROM "Hafalan" WHERE "santriId" = ${Number(santriId)} AND "tanggal" >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months') GROUP BY DATE_TRUNC('month', "tanggal") ORDER BY month DESC`.catch(() => [] as Record<string, unknown>[])
    ]);

    const totalAyatHafal = hafalanStats.reduce((sum, stat) => sum + (stat._sum.ayatSelesai || 0) - (stat._sum.ayatMulai || 0) + stat._count.status, 0);
    const totalAbsensi = attendanceStats.reduce((sum, stat) => sum + stat._count.status, 0);
    const presentCount = attendanceStats.find(stat => stat.status === 'masuk')?._count.status || 0;
    const attendanceRate = totalAbsensi > 0 ? (presentCount / totalAbsensi) * 100 : 0;

    const rankings = rankingResult;
    const totalSantri = rankings.length;
    const rankIdx = rankings.findIndex(r => r.id === Number(santriId));
    const rankingHafalan = rankIdx >= 0 ? rankIdx + 1 : totalSantri + 1;

    return {
      id: santri.id, namaLengkap: santri.namaLengkap, namaPanggilan: santri.username, username: santri.username, role: santri.role.name, foto: santri.foto,
      halaqah: santri.HalaqahSantri.map(hs => ({ id: hs.halaqah.id, namaHalaqah: hs.halaqah.namaHalaqah, guru: { namaLengkap: hs.halaqah.guru?.namaLengkap || 'Tidak ada guru', username: hs.halaqah.guru?.username || '' }, jadwal: hs.halaqah.jadwal.map(j => ({ hari: j.hari, jamMulai: j.jamMulai, jamSelesai: j.jamSelesai })) })),
      statistics: { totalAyatHafal, hafalanByType: hafalanStats, attendanceRate: Math.round(attendanceRate * 100) / 100, attendanceStats, totalTargets: targets.length, completedTargets: targets.filter(t => t.status === 'selesai').length, totalAchievements: achievements.length, rankingHafalan, totalSantri },
      recentHafalan: allHafalan.slice(0, 10).map(h => ({ id: h.id, tanggal: h.tanggal.toISOString(), jenis: h.status, surah: h.surat, ayat: `${h.ayatMulai}-${h.ayatSelesai}`, guru: h.santri.HalaqahSantri[0]?.halaqah.guru?.namaLengkap || 'N/A', status: h.status, catatan: h.keterangan })),
      allHafalan: allHafalan.map(h => ({ id: h.id, tanggal: h.tanggal.toISOString(), jenis: h.status, surah: h.surat, ayatMulai: h.ayatMulai, ayatSelesai: h.ayatSelesai, status: h.status, catatan: h.keterangan, guru: { namaLengkap: h.santri.HalaqahSantri[0]?.halaqah.guru?.namaLengkap || 'N/A' } })),
      targets: targets.map(t => ({ id: t.id, surah: t.surat, ayatMulai: 1, ayatSelesai: t.ayatTarget, targetSelesai: t.deadline.toISOString(), status: t.status, progress: t.status === 'selesai' ? 100 : 50 })),
      absensi: absensi.map(a => ({ id: a.id, tanggal: a.tanggal.toISOString(), status: a.status, keterangan: null, halaqah: { namaHalaqah: santri.HalaqahSantri[0]?.halaqah.namaHalaqah || 'N/A' } })),
      ujian: ujianList.map(u => ({ id: u.id, tanggal: u.tanggalUjian.toISOString(), jenis: u.jenisUjianLabel || u.templateUjian?.namaTemplate || 'Ujian', surah: u.juzDari && u.juzSampai ? `Juz ${u.juzDari}-${u.juzSampai}` : 'N/A', ayatMulai: u.juzDari || 1, ayatSelesai: u.juzSampai || 1, nilai: u.nilaiAkhir || 0, catatan: u.catatanGuru, penguji: { namaLengkap: u.guru?.namaLengkap || 'N/A' } })),
      rapot: rapot.map(r => ({ id: r.id, periode: r.semester?.namaSemester || 'N/A', semester: r.semester?.namaSemester || 'N/A', tahunAjaran: r.semester?.tahunAjaran?.namaLengkap || 'N/A', totalHafalan: 0, nilaiRataRata: r.nilaiRataRata || 0, kehadiran: 0, catatan: r.catatanGuru || '' })),
      achievements,
      monthlyProgress: Array.isArray(monthlyProgressResult) ? monthlyProgressResult : []
    };
  }

  static async getMushafUjianReports() {
    return { data: [], message: 'Mushaf ujian reports endpoint' };
  }

  static async getPredictiveAnalytics(user: AuthUser, santriIdParam?: string | null, daysWindowParam?: string | null, kkmThresholdParam?: string | null) {
    const daysWindow = Math.max(1, parseInt(daysWindowParam || '30', 10) || 30);
    const kkmThreshold = parseFloat(kkmThresholdParam || '80') || 80;
    let targetSantriId: number | null = null;
    if (santriIdParam) { const parsed = parseInt(santriIdParam, 10); if (!isNaN(parsed) && parsed > 0) targetSantriId = parsed; }
    if (user.role.name === 'santri') { if (targetSantriId !== null && targetSantriId !== user.id) throw new AnalyticsServiceError('Santri hanya dapat mengakses data analitik milik sendiri', 403); targetSantriId = user.id; }
    if (!targetSantriId) throw new AnalyticsServiceError('Parameter santriId wajib diisi', 400);

    const whereClause: any = { id: targetSantriId, role: { name: 'santri' } };
    if (user.role.name === 'ortu') whereClause.anak = { some: { orangTuaId: user.id } };
    else if (user.role.name === 'guru') whereClause.OR = [{ HalaqahSantri: { some: { halaqah: { guruId: user.id } } } }, { HalaqahSantri: { some: { halaqah: { permissions: { some: { guruId: user.id, canHafalan: true, isActive: true } } } } } }];

    const startDate = new Date(Date.now() - daysWindow * 86400000);
    const santri = await prisma.user.findFirst({
      where: whereClause,
      select: {
        id: true, namaLengkap: true, username: true, foto: true,
        HalaqahSantri: { select: { halaqah: { select: { id: true, namaHalaqah: true, guru: { select: { id: true, namaLengkap: true } } } } } },
        Hafalan: { where: { tanggal: { gte: startDate } }, select: { id: true, tanggal: true, surat: true, ayatMulai: true, ayatSelesai: true, status: true }, orderBy: { tanggal: 'desc' } },
        TargetHafalan: { where: { status: { in: ['proses', 'belum'] } }, select: { id: true, surat: true, ayatTarget: true, deadline: true, status: true }, orderBy: { deadline: 'asc' } },
        ujianSantri: { where: { statusUjian: 'diverifikasi' }, select: { id: true, tanggalUjian: true, nilaiAkhir: true, nilaiDetail: true, juzDari: true, juzSampai: true, jenisUjianLabel: true }, orderBy: { tanggalUjian: 'desc' } }
      }
    });
    if (!santri) throw new AnalyticsServiceError('Santri tidak ditemukan atau Anda tidak memiliki hak akses', 404);

    const scoresPerJuz: Record<number, number> = {};
    for (const exam of santri.ujianSantri) {
      if (exam.nilaiDetail && typeof exam.nilaiDetail === 'object') {
        const detail = exam.nilaiDetail as Record<string, any>;
        for (let juz = 1; juz <= 30; juz++) {
          if (scoresPerJuz[juz] !== undefined) continue;
          const directKey = String(juz);
          let juzScore: number | null = null;
          if (typeof detail[directKey] === 'number') juzScore = detail[directKey];
          else if (typeof detail[directKey] === 'string' && !isNaN(parseFloat(detail[directKey]))) juzScore = parseFloat(detail[directKey]);
          else if (typeof detail[directKey] === 'object' && detail[directKey] !== null) { const obj = detail[directKey]; if (typeof obj.score === 'number') juzScore = obj.score; else if (typeof obj.nilai === 'number') juzScore = obj.nilai; }
          if (juzScore === null) { const subValues: number[] = []; for (const [k, v] of Object.entries(detail)) { if (new RegExp(`^juz[-_\\s]?${juz}([-_\\s]|$)`, 'i').test(k)) { if (typeof v === 'number') subValues.push(v); else if (typeof v === 'string' && !isNaN(parseFloat(v))) subValues.push(parseFloat(v)); } } if (subValues.length > 0) juzScore = Math.round(subValues.reduce((a, b) => a + b, 0) / subValues.length); }
          if (juzScore !== null && !isNaN(juzScore)) scoresPerJuz[juz] = juzScore;
        }
      }
      if (typeof exam.nilaiAkhir === 'number' && exam.juzDari && exam.juzSampai) { for (let juz = exam.juzDari; juz <= exam.juzSampai; juz++) { if (scoresPerJuz[juz] === undefined) scoresPerJuz[juz] = exam.nilaiAkhir; } }
    }

    const setoranList = santri.Hafalan.map(h => ({ tanggal: h.tanggal, jumlahAyat: Math.max(0, h.ayatSelesai - h.ayatMulai + 1), status: h.status }));
    const velocity = calculateHafalanVelocity(setoranList, daysWindow);
    const activeTarget = santri.TargetHafalan[0] || null;
    const currentProgressAyat = setoranList.filter(s => !s.status || String(s.status).toLowerCase() === 'ziyadah').reduce((sum, s) => sum + s.jumlahAyat, 0);
    const prediction = predictCompletionAndRisk(currentProgressAyat, activeTarget?.ayatTarget || 0, velocity.dailyVelocityAyat, activeTarget?.deadline || null);

    return {
      santri: { id: santri.id, namaLengkap: santri.namaLengkap, username: santri.username, foto: santri.foto, halaqah: santri.HalaqahSantri.map(hs => ({ id: hs.halaqah.id, namaHalaqah: hs.halaqah.namaHalaqah, guruNama: hs.halaqah.guru?.namaLengkap || 'Belum Ditentukan' })) },
      activeTarget: activeTarget ? { id: activeTarget.id, surat: activeTarget.surat, ayatTarget: activeTarget.ayatTarget, deadline: activeTarget.deadline.toISOString(), status: activeTarget.status } : null,
      perJuzKKM: calculatePerJuzKKMStatus(scoresPerJuz, kkmThreshold),
      velocity,
      prediction: { ...prediction, estimatedCompletionDate: prediction.estimatedCompletionDate ? prediction.estimatedCompletionDate.toISOString() : null }
    };
  }

  private static async getHalaqahReports(startDate: Date, endDate: Date) {
    try {
      const halaqahList = await prisma.halaqah.findMany({
        select: {
          id: true,
          namaHalaqah: true,
          guru: { select: { namaLengkap: true } },
          _count: { select: { santri: true } },
          santri: {
            select: {
              santri: {
                select: {
                  _count: {
                    select: {
                      Hafalan: { where: { tanggal: { gte: startDate, lte: endDate } } },
                      ujianSantri: { where: { tanggalUjian: { gte: startDate, lte: endDate } } },
                      Absensi: { where: { tanggal: { gte: startDate, lte: endDate } } }
                    }
                  },
                  Absensi: {
                    where: { tanggal: { gte: startDate, lte: endDate }, status: 'masuk' },
                    select: { id: true }
                  }
                }
              }
            }
          }
        }
      });
      return halaqahList.map(h => {
        const totalSantri = h._count.santri;
        const totalHafalan = h.santri.reduce((sum, sh) => sum + sh.santri._count.Hafalan, 0);
        const totalUjian = h.santri.reduce((sum, sh) => sum + sh.santri._count.ujianSantri, 0);
        const totalAbsensi = h.santri.reduce((sum, sh) => sum + sh.santri._count.Absensi, 0);
        const presentCount = h.santri.reduce((sum, sh) => sum + sh.santri.Absensi.length, 0);
        return { id: h.id, namaHalaqah: h.namaHalaqah, namaGuru: h.guru?.namaLengkap || 'Tidak ada guru', totalSantri, totalHafalan, totalUjian, attendanceRate: Math.min(totalAbsensi > 0 ? Math.round((presentCount / totalAbsensi) * 100) : 0, 100), hafalanRate: Math.min(totalSantri > 0 ? Math.round((totalHafalan / (totalSantri * 10)) * 100) : 0, 100) };
      });
    } catch { return []; }
  }

  private static async getSantriReports(startDate: Date, endDate: Date) {
    try {
      const santriList = await prisma.user.findMany({
        where: { role: { name: 'santri' } },
        select: { id: true, namaLengkap: true, HalaqahSantri: { select: { halaqah: { select: { namaHalaqah: true } } }, take: 1 }, _count: { select: { Hafalan: { where: { tanggal: { gte: startDate, lte: endDate } } }, ujianSantri: { where: { tanggalUjian: { gte: startDate, lte: endDate } } }, Absensi: { where: { tanggal: { gte: startDate, lte: endDate } } } } }, TargetHafalan: { where: { deadline: { gte: startDate, lte: endDate }, status: 'proses' }, select: { id: true } }, Absensi: { where: { tanggal: { gte: startDate, lte: endDate }, status: 'masuk' }, select: { id: true } }, Hafalan: { where: { tanggal: { gte: startDate, lte: endDate } }, select: { tanggal: true }, orderBy: { tanggal: 'desc' }, take: 1 } }
      });
      return santriList.map(s => {
        const totalAbsensi = s._count.Absensi;
        const presentCount = s.Absensi.length;
        return { id: s.id, namaLengkap: s.namaLengkap, halaqah: s.HalaqahSantri?.[0]?.halaqah?.namaHalaqah || 'Tidak ada halaqah', totalHafalan: s._count.Hafalan, totalUjian: s._count.ujianSantri, targetAktif: s.TargetHafalan.length, attendanceRate: Math.min(totalAbsensi > 0 ? Math.round((presentCount / totalAbsensi) * 100) : 0, 100), lastActivity: s.Hafalan[0]?.tanggal.toISOString() ?? null };
      });
    } catch { return []; }
  }

  private static async getGuruReports(startDate: Date, endDate: Date) {
    try {
      const guruList = await prisma.user.findMany({
        where: { role: { name: 'guru' } },
        select: { id: true, namaLengkap: true, _count: { select: { guruHalaqah: true, guruPermissions: true } }, guruHalaqah: { select: { santri: { select: { santri: { select: { _count: { select: { Absensi: { where: { tanggal: { gte: startDate, lte: endDate } } } } }, Absensi: { where: { tanggal: { gte: startDate, lte: endDate }, status: 'masuk' }, select: { id: true } } } } } } } } }
      });
      return guruList.map(g => {
        const totalSantri = g.guruHalaqah.reduce((sum, h) => sum + h.santri.length, 0);
        let totalAbsensi = 0, totalPresent = 0;
        g.guruHalaqah.forEach(h => h.santri.forEach(sh => { totalAbsensi += sh.santri._count.Absensi; totalPresent += sh.santri.Absensi.length; }));
        return { id: g.id, namaLengkap: g.namaLengkap, halaqahCount: g._count.guruHalaqah, totalSantri, averageAttendance: Math.min(totalAbsensi > 0 ? Math.round((totalPresent / totalAbsensi) * 100) : 0, 100), permissionCount: g._count.guruPermissions };
      });
    } catch { return []; }
  }

  private static async getSummaryStatistics(startDate: Date, endDate: Date) {
    try {
      const [totalHalaqah, totalSantri, totalGuru, totalHafalanRecords, totalUjian, totalTarget, totalAbsensi, totalPresent, completedTargets] = await Promise.all([
        prisma.halaqah.count(), prisma.user.count({ where: { role: { name: 'santri' } } }), prisma.user.count({ where: { role: { name: 'guru' } } }),
        prisma.hafalan.count({ where: { tanggal: { gte: startDate, lte: endDate } } }), prisma.ujianSantri.count({ where: { tanggalUjian: { gte: startDate, lte: endDate } } }),
        prisma.targetHafalan.count({ where: { deadline: { gte: startDate, lte: endDate } } }),
        prisma.absensi.count({ where: { tanggal: { gte: startDate, lte: endDate } } }), prisma.absensi.count({ where: { tanggal: { gte: startDate, lte: endDate }, status: 'masuk' } }),
        prisma.targetHafalan.count({ where: { deadline: { gte: startDate, lte: endDate }, status: 'selesai' } })
      ]);
      return { totalHalaqah, totalSantri, totalGuru, overallAttendance: Math.min(totalAbsensi > 0 ? Math.round((totalPresent / totalAbsensi) * 100) : 0, 100), overallHafalanProgress: Math.min(totalHafalanRecords > 0 ? Math.round((totalHafalanRecords / (totalSantri * 5)) * 100) : 0, 100), totalHafalanRecords, totalUjian, totalTarget, targetProgress: Math.min(totalTarget > 0 ? Math.round((completedTargets / totalTarget) * 100) : 0, 100) };
    } catch { return { totalHalaqah: 0, totalSantri: 0, totalGuru: 0, overallAttendance: 0, overallHafalanProgress: 0, totalHafalanRecords: 0, totalUjian: 0, totalTarget: 0, targetProgress: 0 }; }
  }

  private static async getOverviewReport() {
    const [totalUsers, totalSantri, totalGuru, totalHalaqah, totalHafalan, totalAbsensi] = await Promise.all([prisma.user.count(), prisma.user.count({ where: { role: { name: 'santri' } } }), prisma.user.count({ where: { role: { name: 'guru' } } }), prisma.halaqah.count(), prisma.hafalan.count(), prisma.absensi.count()]);
    return { totalUsers, totalSantri, totalGuru, totalHalaqah, totalHafalan, totalAbsensi };
  }

  private static async getGlobalHafalanReport() {
    const [totalHafalan, hafalanByStatus, topSantri, absensiByStatus] = await Promise.all([
      prisma.hafalan.count(), prisma.hafalan.groupBy({ by: ['status'], _count: { status: true } }),
      prisma.user.findMany({ where: { role: { name: 'santri' } }, select: { id: true, namaLengkap: true, _count: { select: { Hafalan: true } } }, orderBy: { Hafalan: { _count: 'desc' } }, take: 10 }),
      prisma.absensi.groupBy({ by: ['status'], _count: { status: true } })
    ]);
    const monthlyProgress = await prisma.$queryRaw`SELECT DATE_TRUNC('month', "tanggal") as month, COUNT(*) as total_hafalan, SUM("ayatSelesai" - "ayatMulai" + 1) as total_ayat FROM "Hafalan" WHERE "tanggal" >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months') GROUP BY DATE_TRUNC('month', "tanggal") ORDER BY month DESC`;
    return { totalHafalan, hafalanByStatus, topSantri, monthlyProgress, absensiByStatus };
  }

  private static async getGlobalAbsensiReport() {
    const [totalAbsensi, absensiByStatus] = await Promise.all([prisma.absensi.count(), prisma.absensi.groupBy({ by: ['status'], _count: { status: true } })]);
    const halaqahAttendance = await prisma.halaqah.findMany({ select: { id: true, namaHalaqah: true, santri: { select: { santri: { select: { _count: { select: { Absensi: true } }, Absensi: { where: { status: 'masuk' }, select: { id: true } } } } } } } });
    const attendanceByHalaqah = halaqahAttendance.map(h => { const totalAbs = h.santri.reduce((sum, hs) => sum + hs.santri._count.Absensi, 0); const presentCount = h.santri.reduce((sum, hs) => sum + hs.santri.Absensi.length, 0); return { halaqahId: h.id, namaHalaqah: h.namaHalaqah, totalSantri: h.santri.length, attendanceRate: totalAbs > 0 ? (presentCount / totalAbs) * 100 : 0 }; });
    return { totalAbsensi, absensiByStatus, attendanceByHalaqah };
  }

  private static async getGlobalPrestasiReport() {
    const [totalPrestasi, prestasiByCategory, prestasiByYear, topAchievers] = await Promise.all([
      prisma.prestasi.count(), prisma.prestasi.groupBy({ by: ['kategori'], _count: { kategori: true } }), prisma.prestasi.groupBy({ by: ['tahun'], _count: { tahun: true } }),
      prisma.user.findMany({ where: { role: { name: 'santri' } }, select: { id: true, namaLengkap: true, _count: { select: { Prestasi: true } } }, orderBy: { Prestasi: { _count: 'desc' } }, take: 10 })
    ]);
    return { totalPrestasi, prestasiByCategory, prestasiByYear, topAchievers };
  }

  private static async getGlobalHalaqahReport() {
    const halaqahStats = await prisma.halaqah.findMany({ select: { id: true, namaHalaqah: true, guru: { select: { namaLengkap: true } }, santri: { select: { santri: { select: { _count: { select: { Hafalan: true, Prestasi: true, Absensi: true } }, Absensi: { where: { status: 'masuk' }, select: { id: true } } } } } }, _count: { select: { jadwal: true } } } });
    return { halaqahStats: halaqahStats.map(h => { const santriCount = h.santri.length; const totalHafalan = h.santri.reduce((sum, hs) => sum + hs.santri._count.Hafalan, 0); const totalAbsensi = h.santri.reduce((sum, hs) => sum + hs.santri._count.Absensi, 0); const presentCount = h.santri.reduce((sum, hs) => sum + hs.santri.Absensi.length, 0); return { halaqahId: h.id, namaHalaqah: h.namaHalaqah, guru: h.guru?.namaLengkap || 'Tidak ada guru', santriCount, jadwalCount: h._count.jadwal, averageHafalanPerSantri: santriCount > 0 ? totalHafalan / santriCount : 0, attendanceRate: totalAbsensi > 0 ? (presentCount / totalAbsensi) * 100 : 0, totalPrestasi: h.santri.reduce((sum, hs) => sum + hs.santri._count.Prestasi, 0) }; }) };
  }

  private static async getUjianListReports(startDate: Date, endDate: Date) {
    try {
      const ujianList = await prisma.ujianSantri.findMany({ where: { tanggalUjian: { gte: startDate, lte: endDate } }, select: { id: true, santri: { select: { namaLengkap: true, HalaqahSantri: { select: { halaqah: { select: { namaHalaqah: true } } }, take: 1 } } }, templateUjian: { select: { jenisUjian: true, namaTemplate: true } }, verifikator: { select: { namaLengkap: true } }, nilaiAkhir: true, statusUjian: true, tanggalUjian: true, catatanGuru: true }, orderBy: { tanggalUjian: 'desc' } });
      return ujianList.map((u: any) => ({ id: u.id, santri: u.santri?.namaLengkap || 'Unknown', halaqah: u.santri?.HalaqahSantri?.[0]?.halaqah?.namaHalaqah || 'Tidak ada halaqah', jenisUjian: u.templateUjian?.jenisUjian || 'Unknown', templateUjian: u.templateUjian?.namaTemplate || 'Unknown', nilaiAkhir: u.nilaiAkhir || 0, status: u.statusUjian, tanggal: u.tanggalUjian.toISOString(), verifier: u.verifikator?.namaLengkap || 'Belum diverifikasi', keterangan: u.catatanGuru }));
    } catch { return []; }
  }

  private static async getTargetListReports(startDate: Date, endDate: Date) {
    try {
      const targetList = await prisma.targetHafalan.findMany({ where: { deadline: { gte: startDate, lte: endDate } }, select: { id: true, santri: { select: { namaLengkap: true, HalaqahSantri: { select: { halaqah: { select: { namaHalaqah: true } } }, take: 1 } } }, surat: true, ayatTarget: true, deadline: true, status: true }, orderBy: { deadline: 'asc' } });
      return targetList.map((t: any) => ({ id: t.id, santri: t.santri?.namaLengkap || 'Unknown', halaqah: t.santri?.HalaqahSantri?.[0]?.halaqah?.namaHalaqah || 'Tidak ada halaqah', surat: t.surat, ayatTarget: t.ayatTarget, deadline: t.deadline.toISOString(), status: t.status, progress: t.status === 'selesai' ? 100 : t.status === 'proses' ? 50 : 0 }));
    } catch { return []; }
  }

  private static calculateUjianAnalytics(ujianData: any[]) {
    const totalUjian = ujianData.length;
    const totalSantri = new Set(ujianData.map(u => u.santriId)).size;
    const averageScore = totalUjian > 0 ? ujianData.reduce((sum, u) => sum + ((u.nilaiAkhir as number) || 0), 0) / totalUjian : 0;

    const byJenisUjian: Record<string, { count: number; totalScore: number; averageScore: number; santriCount: number }> = {};
    ujianData.forEach(u => { const jenis = (u.templateUjian as any)?.jenisUjian || 'Unknown'; if (!byJenisUjian[jenis]) byJenisUjian[jenis] = { count: 0, totalScore: 0, averageScore: 0, santriCount: 0 }; byJenisUjian[jenis].count++; byJenisUjian[jenis].totalScore += ((u.nilaiAkhir as number) || 0); });
    Object.keys(byJenisUjian).forEach(j => { byJenisUjian[j].averageScore = byJenisUjian[j].totalScore / byJenisUjian[j].count; byJenisUjian[j].santriCount = new Set(ujianData.filter(u => (u.templateUjian as any)?.jenisUjian === j).map(u => u.santriId)).size; });

    const byHalaqah: Record<string, { count: number; totalScore: number; averageScore: number; santriCount: number; guru: string }> = {};
    ujianData.forEach(u => { const h = u.santri?.HalaqahSantri?.[0]?.halaqah?.namaHalaqah || 'Unknown'; const g = u.santri?.HalaqahSantri?.[0]?.halaqah?.guru?.namaLengkap || 'Unknown'; if (!byHalaqah[h]) byHalaqah[h] = { count: 0, totalScore: 0, averageScore: 0, santriCount: 0, guru: g }; byHalaqah[h].count++; byHalaqah[h].totalScore += ((u.nilaiAkhir as number) || 0); });
    Object.keys(byHalaqah).forEach(h => { byHalaqah[h].averageScore = byHalaqah[h].totalScore / byHalaqah[h].count; byHalaqah[h].santriCount = new Set(ujianData.filter(u => u.santri?.HalaqahSantri?.[0]?.halaqah?.namaHalaqah === h).map(u => u.santriId)).size; });

    const byGuru: Record<string, { namaGuru: string; totalUjian: number; avgNilai: number }> = {};
    ujianData.forEach(u => { const g = u.santri?.HalaqahSantri?.[0]?.halaqah?.guru; if (!g) return; if (!byGuru[g.id]) byGuru[g.id] = { namaGuru: g.namaLengkap, totalUjian: 0, avgNilai: 0 }; byGuru[g.id].totalUjian++; byGuru[g.id].avgNilai = (byGuru[g.id].avgNilai + (u.nilaiAkhir || 0)) / 2; });

    const performanceDistribution = { excellent: ujianData.filter(u => ((u.nilaiAkhir as number) || 0) >= 90).length, good: ujianData.filter(u => ((u.nilaiAkhir as number) || 0) >= 80 && ((u.nilaiAkhir as number) || 0) < 90).length, average: ujianData.filter(u => ((u.nilaiAkhir as number) || 0) >= 70 && ((u.nilaiAkhir as number) || 0) < 80).length, needsImprovement: ujianData.filter(u => ((u.nilaiAkhir as number) || 0) < 70).length };
    const monthlyTrend = AnalyticsService.generateMonthlyTrend(ujianData);

    const santriScores: Record<string, { santri: string; halaqah: string; scores: number[]; totalUjian: number }> = {};
    ujianData.forEach(u => { const id = u.santriId as string; if (!santriScores[id]) santriScores[id] = { santri: u.santri?.namaLengkap || 'Unknown', halaqah: u.santri?.HalaqahSantri?.[0]?.halaqah?.namaHalaqah || 'Unknown', scores: [], totalUjian: 0 }; santriScores[id].scores.push((u.nilaiAkhir as number) || 0); santriScores[id].totalUjian++; });
    const scoresArr = Object.values(santriScores).map(s => ({ ...s, averageScore: s.scores.reduce((a, b) => a + b, 0) / s.scores.length }));
    const topPerformers = scoresArr.sort((a, b) => b.averageScore - a.averageScore).slice(0, 10);
    const needsAttention = scoresArr.filter(s => s.averageScore < 70).sort((a, b) => a.averageScore - b.averageScore).slice(0, 10);

    return {
      summary: { totalUjian, totalSantri, averageScore: Math.round(averageScore * 100) / 100, passRate: totalUjian > 0 ? Math.round((ujianData.filter(u => ((u.nilaiAkhir as number) || 0) >= 70).length / totalUjian) * 100) : 0, excellenceRate: totalUjian > 0 ? Math.round((ujianData.filter(u => ((u.nilaiAkhir as number) || 0) >= 90).length / totalUjian) * 100) : 0 },
      byJenisUjian, byHalaqah, byGuru, performanceDistribution, monthlyTrend, topPerformers, needsAttention
    };
  }

  private static generateMonthlyTrend(ujianData: Record<string, unknown>[]) {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      const monthData = ujianData.filter(u => { const d = new Date(u.tanggalUjian as string | number); return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear(); });
      months.push({ month: monthName, count: monthData.length, averageScore: monthData.length > 0 ? Math.round((monthData.reduce((sum, u) => sum + ((u.nilaiAkhir as number) || 0), 0) / monthData.length) * 100) / 100 : 0 });
    }
    return months;
  }

  private static calculateTrendingAnalytics(trendingData: any[]) {
    const last7Days = trendingData.filter(u => { const d = new Date(u.tanggalUjian as string | number); const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7); return d >= sevenDaysAgo; });
    const avg7 = last7Days.reduce((s, u) => s + (u.nilaiAkhir || 0), 0) / (last7Days.length || 1);
    const avg30 = trendingData.reduce((s, u) => s + (u.nilaiAkhir || 0), 0) / (trendingData.length || 1);
    return {
      last7Days: { count: last7Days.length, averageScore: last7Days.length > 0 ? Math.round((last7Days.reduce((s, u) => s + ((u.nilaiAkhir as number) || 0), 0) / last7Days.length) * 100) / 100 : 0 },
      last30Days: { count: trendingData.length, averageScore: trendingData.length > 0 ? Math.round((trendingData.reduce((s, u) => s + ((u.nilaiAkhir as number) || 0), 0) / trendingData.length) * 100) / 100 : 0 },
      growth: { ujianCount: last7Days.length > 0 && trendingData.length > 0 ? Math.round(((last7Days.length * 4.3) / trendingData.length - 1) * 100) : 0, scoreImprovement: avg30 > 0 ? Math.round(((avg7 - avg30) / avg30) * 100) : 0 }
    };
  }

  private static generateCatatan(stats: { absensiRate: number; totalAyat: number; targetRate: number; totalPrestasi: number }) {
    const notes: string[] = [];
    if (stats.absensiRate >= 90) notes.push('Kehadiran sangat baik'); else if (stats.absensiRate < 60) notes.push('Perlu meningkatkan kehadiran');
    if (stats.totalAyat >= 200) notes.push('Hafalan sangat produktif'); else if (stats.totalAyat < 50) notes.push('Perlu meningkatkan hafalan');
    if (stats.targetRate >= 80) notes.push('Target tercapai dengan baik'); else if (stats.targetRate < 50) notes.push('Perlu fokus pada target');
    if (stats.totalPrestasi > 0) notes.push(`Meraih ${stats.totalPrestasi} prestasi`);
    if (notes.length === 0) notes.push('Performa standar, perlu peningkatan');
    return notes.join('. ') + '.';
  }
}

export class AnalyticsServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'AnalyticsServiceError';
  }
}
