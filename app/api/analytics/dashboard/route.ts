import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from '@/lib/jwt';
import prisma from '@/lib/database/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken<any>(token);
    const userId = typeof decoded.id === 'string' ? parseInt(decoded.id) : (decoded.id as number);

    // Verify user role is admin or super-admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: { select: { name: true } } }
    });

    if (!user || !user.role || !['admin', 'super_admin'].includes(user.role.name)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

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
      recentAnnouncements
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

    return NextResponse.json({
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
      halaqahStats,
      recentAnnouncements: recentAnnouncements.map(a => ({
        id: a.id,
        title: a.judul,
        date: a.tanggal.toISOString().split('T')[0]
      })),
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
    });

  } catch (error: any) {
    console.error("Error fetching admin dashboard data:", error);
    require('fs').writeFileSync('dashboard_error.txt', error.stack || error.toString());
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}