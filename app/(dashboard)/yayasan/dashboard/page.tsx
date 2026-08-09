import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import prisma from "@/lib/database/prisma";
import { Prisma } from "@prisma/client";
import YayasanDashboardClient from "./YayasanDashboardClient";

export const dynamic = 'force-dynamic';

export default async function YayasanDashboardPage() {
  const { user, error } = await getAuthUser();

  if (error || !user || !['admin', 'super_admin', 'yayasan'].includes(user.role.name)) {
    redirect("/login");
  }

const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const twelveMonthsAgo = new Date();
twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

// Get comprehensive dashboard statistics in parallel
const [
  totalSantri,
  totalGuru,
  totalHalaqah,
  totalJadwal,
  totalPengumuman,
  totalAbsensi,
  absensiMasuk,
  santriWithRecentHafalan,
  recentAnnouncements,
  // Optimized: DB-side aggregation instead of fetching all rows to JS
  hafalanByMonth,
  absensiByMonth,
  ujianData,
  raportData
] = await Promise.all([
  prisma.user.count({ where: { role: { name: 'santri' } } }),
  prisma.user.count({ where: { role: { name: 'guru' } } }),
  prisma.halaqah.count(),
  prisma.jadwal.count(),
  prisma.pengumuman.count(),
  prisma.absensi.count(),
  prisma.absensi.count({ where: { status: 'masuk' } }),
  prisma.hafalan.groupBy({
    by: ['santriId'],
    where: { tanggal: { gte: thirtyDaysAgo } },
    _count: true
  }),
  prisma.pengumuman.findMany({
    take: 5,
    orderBy: { tanggal: 'desc' },
    select: { id: true, judul: true, tanggal: true }
  }),
  // Optimized: push aggregation to PostgreSQL — O(12) result set instead of O(N) rows
  prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
    SELECT TO_CHAR(DATE_TRUNC('month', "tanggal"), 'YYYY-MM') AS month, COUNT(*) AS count
    FROM "Hafalan"
    WHERE "tanggal" >= ${twelveMonthsAgo}
    GROUP BY DATE_TRUNC('month', "tanggal")
    ORDER BY month ASC
  `,
  prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
    SELECT TO_CHAR(DATE_TRUNC('month', "tanggal"), 'YYYY-MM') AS month, COUNT(*) AS count
    FROM "Absensi"
    WHERE "tanggal" >= ${twelveMonthsAgo}
    GROUP BY DATE_TRUNC('month', "tanggal")
    ORDER BY month ASC
  `,
  // Optimized: add take limit (unbounded in production would grow indefinitely)
  prisma.ujianSantri.findMany({
    take: 20,
    select: {
      id: true,
      nilaiAkhir: true,
      statusUjian: true,
      tanggalUjian: true,
      santri: { select: { namaLengkap: true } },
      templateUjian: { select: { namaTemplate: true } }
    },
    orderBy: { tanggalUjian: 'desc' }
  }),
  prisma.raportSantri.findMany({
    take: 10,
    orderBy: { nilaiRataRata: 'desc' },
    select: {
      id: true,
      nilaiRataRata: true,
      totalNilaiAkhir: true,
      ranking: true,
      statusKelulusan: true,
      santri: { select: { namaLengkap: true } }
    }
  })
]);

  const attendanceRate = totalAbsensi > 0 ? Math.round((absensiMasuk / totalAbsensi) * 100) : 0;
  const hafalanRate = totalSantri > 0 ? Math.round((santriWithRecentHafalan.length / totalSantri) * 100) : 0;

  // Process grade distribution for rapot chart
  const gradeDistribution = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  ujianData.forEach(ujian => {
    const nilai = ujian.nilaiAkhir;
    if (nilai == null) return;
    if (nilai >= 90) gradeDistribution.A++;
    else if (nilai >= 80) gradeDistribution.B++;
    else if (nilai >= 70) gradeDistribution.C++;
    else if (nilai >= 60) gradeDistribution.D++;
    else gradeDistribution.E++;
  });

  const rapotBarData = Object.entries(gradeDistribution).map(([grade, count]) => ({
    grade,
    jumlah: count,
    fill: grade === 'A' ? '#219ebc' : grade === 'B' ? '#219ebc' : grade === 'C' ? '#ffb703' : grade === 'D' ? '#ffb703' : '#fb8500'
  }));

  const totalUjian = ujianData.length;
  const avgNilai = totalUjian > 0
    ? Math.round(ujianData.reduce((sum, u) => sum + (u.nilaiAkhir || 0), 0) / totalUjian)
    : 0;
  const selesaiCount = ujianData.filter(u => u.statusUjian === 'selesai').length;

  const rapotStats = {
    totalUjian,
    avgNilai,
    selesaiCount,
    rapotBarData,
    raportData: raportData.slice(0, 10).map(r => ({
      nama: r.santri?.namaLengkap || '-',
      nilaiRataRata: r.nilaiRataRata,
      ranking: r.ranking
    }))
  };

  // Process monthly trend data — build lookup maps from DB-aggregated results
  const hafalanMap = new Map(hafalanByMonth.map(r => [r.month, Number(r.count)]));
  const absensiMap = new Map(absensiByMonth.map(r => [r.month, Number(r.count)]));

  const monthlyTrend: { month: string; hafalan: number; absensi: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    monthlyTrend.push({
      month: monthLabel,
      hafalan: hafalanMap.get(monthKey) ?? 0,
      absensi: absensiMap.get(monthKey) ?? 0
    });
  }

  const data = {
    overview: {
      totalSantri,
      totalGuru,
      totalHalaqah,
      totalPengumuman,
      overallAttendance: attendanceRate,
      overallHafalanProgress: hafalanRate
    },
    performance: {
      attendanceRate,
      hafalanRate
    },
    rapotStats,
    monthlyTrend,
    halaqahStats: [],
    recentAnnouncements: recentAnnouncements.map(a => ({
      id: a.id,
      title: a.judul,
      date: a.tanggal.toISOString().split('T')[0]
    })),
    recentActivities: {
      announcements: recentAnnouncements.map(a => ({
        id: a.id,
        title: a.judul,
        date: a.tanggal.toISOString().split('T')[0]
      })),
      halaqah: []
    }
  };

  return <YayasanDashboardClient data={data} />;
}