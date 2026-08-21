import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import prisma from "@/lib/database/prisma";
import { Prisma } from "@prisma/client";
import { getSuperAdminDashboardData } from "@/lib/services/superAdminDashboardStats";
import SuperAdminDashboardClient from "./SuperAdminDashboardClient";

export const dynamic = 'force-dynamic';

export default async function SuperAdminDashboardPage() {
  const { user, error } = await getAuthUser();

  if (error || !user || user.role.name !== 'super_admin') {
    redirect("/login");
  }

const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const twelveMonthsAgo = new Date();
twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

// Get comprehensive dashboard statistics in parallel
const [
  rolesWithCount,
  totalHalaqah,
  totalJadwal,
  totalPengumuman,
  totalAbsensi,
  absensiMasuk,
  santriWithRecentHafalan,
  recentHafalan,
  recentAbsensi,
  halaqahPerformance,
  recentAnnouncements,
  // Optimized: DB-side aggregation instead of fetching all rows to JS
  hafalanByMonth,
  absensiByMonth,
  adminDashboardData
] = await Promise.all([
  prisma.role.findMany({
    select: {
      name: true,
      _count: {
        select: { users: true }
      }
    }
  }),
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
  prisma.hafalan.findMany({
    take: 10,
    orderBy: { tanggal: 'desc' },
    include: { santri: { select: { namaLengkap: true } } }
  }),
  prisma.absensi.findMany({
    take: 10,
    orderBy: { tanggal: 'desc' },
    include: {
      santri: { select: { namaLengkap: true } },
      jadwal: { include: { halaqah: { select: { namaHalaqah: true } } } }
    }
  }),
  prisma.halaqah.findMany({
    include: { _count: { select: { santri: true } } }
  }),
  prisma.pengumuman.findMany({
    take: 5,
    orderBy: { tanggal: 'desc' },
    select: { id: true, judul: true, tanggal: true }
  }),
  // Optimized: push aggregation to PostgreSQL — O(1) result set instead of O(N) rows
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
  getSuperAdminDashboardData()
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

  const attendanceRate = totalAbsensi > 0 ? Math.round((absensiMasuk / totalAbsensi) * 100) : 0;
  const hafalanRate = totalSantri > 0 ? Math.round((santriWithRecentHafalan.length / totalSantri) * 100) : 0;

  const halaqahStats = halaqahPerformance.map(h => {
    return {
      id: h.id,
      namaHalaqah: h.namaHalaqah,
      santriCount: h._count.santri,
      hafalanCount: 0,
      attendanceRate: 0,
      hafalanRate: 0
    };
  });

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
      totalAdmin,
      totalSuperAdmin,
      totalOrtu,
      totalYayasan,
      totalHalaqah,
      totalJadwal,
      totalPengumuman,
      totalUsers,
      totalRoles
    },
    performance: {
      attendanceRate,
      hafalanRate
    },
    userDistribution: {
      santri: totalSantri,
      guru: totalGuru,
      admin: totalAdmin,
      superAdmin: totalSuperAdmin,
      ortu: totalOrtu,
      yayasan: totalYayasan
    },
    monthlyTrend,
    halaqahStats,
    recentActivities: {
      hafalan: recentHafalan.map(h => ({
        id: h.id,
        type: 'hafalan',
        description: `${h.santri?.namaLengkap || 'Unknown'} - ${h.surat} (${h.ayatMulai}-${h.ayatSelesai})`,
        date: h.tanggal.toISOString().split('T')[0]
      })),
      absensi: recentAbsensi.map(a => ({
        id: a.id,
        type: 'absensi',
        description: `${a.santri?.namaLengkap || 'Unknown'} - ${a.jadwal?.halaqah?.namaHalaqah || 'Unknown'} (${a.status})`,
        date: a.tanggal.toISOString().split('T')[0]
      }))
    }
  };

  return <SuperAdminDashboardClient data={data} adminData={adminDashboardData} />;
}