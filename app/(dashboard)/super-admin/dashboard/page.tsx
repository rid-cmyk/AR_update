import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import prisma from "@/lib/database/prisma";
import SuperAdminDashboardClient from "./SuperAdminDashboardClient";

export const dynamic = 'force-dynamic';

export default async function SuperAdminDashboardPage() {
  const { user, error } = await getAuthUser();

  if (error || !user || !['admin', 'super_admin'].includes(user.role.name)) {
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
  totalAdmin,
  totalSuperAdmin,
  totalOrtu,
  totalYayasan,
  totalHalaqah,
  totalJadwal,
  totalPengumuman,
  totalUsers,
  totalRoles,
  totalAbsensi,
  absensiMasuk,
  santriWithRecentHafalan,
  recentHafalan,
  recentAbsensi,
  halaqahPerformance,
  recentAnnouncements,
  monthlyHafalan,
  monthlyAbsensi
] = await Promise.all([
  prisma.user.count({ where: { role: { name: 'santri' } } }),
  prisma.user.count({ where: { role: { name: 'guru' } } }),
  prisma.user.count({ where: { role: { name: 'admin' } } }),
  prisma.user.count({ where: { role: { name: 'super_admin' } } }),
  prisma.user.count({ where: { role: { name: 'ortu' } } }),
  prisma.user.count({ where: { role: { name: 'yayasan' } } }),
  prisma.halaqah.count(),
  prisma.jadwal.count(),
  prisma.pengumuman.count(),
  prisma.user.count(),
  prisma.role.count(),
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
  prisma.hafalan.findMany({
    where: { tanggal: { gte: twelveMonthsAgo } },
    select: { tanggal: true }
  }),
  prisma.absensi.findMany({
    where: { tanggal: { gte: twelveMonthsAgo } },
    select: { tanggal: true }
  })
]);

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

  // Process monthly trend data
  const monthlyTrend: { month: string; hafalan: number; absensi: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const month = d.getMonth();
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    const monthLabel = d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });

    const hafalanCount = monthlyHafalan.filter(h => {
      const t = new Date(h.tanggal);
      return t.getFullYear() === year && t.getMonth() === month;
    }).length;

    const absensiCount = monthlyAbsensi.filter(a => {
      const t = new Date(a.tanggal);
      return t.getFullYear() === year && t.getMonth() === month;
    }).length;

    monthlyTrend.push({ month: monthLabel, hafalan: hafalanCount, absensi: absensiCount });
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

  return <SuperAdminDashboardClient data={data} />;
}