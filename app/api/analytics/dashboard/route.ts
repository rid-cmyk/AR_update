import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mysecretkey") as { id: number; role: string };

    // Verify user role is admin or super-admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: { select: { name: true } } }
    });

    if (!user || !['admin', 'super-admin'].includes(user.role.name)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get comprehensive dashboard statistics
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
      totalRoles
    ] = await Promise.all([
      prisma.user.count({ where: { role: { name: 'santri' } } }),
      prisma.user.count({ where: { role: { name: 'guru' } } }),
      prisma.user.count({ where: { role: { name: 'admin' } } }),
      prisma.user.count({ where: { role: { name: 'super-admin' } } }),
      prisma.user.count({ where: { role: { name: 'orang_tua' } } }),
      prisma.user.count({ where: { role: { name: 'yayasan' } } }),
      prisma.halaqah.count(),
      prisma.jadwal.count(),
      prisma.pengumuman.count(),
      prisma.user.count(),
      prisma.role.count()
    ]);

    // Calculate performance metrics
    const totalAbsensi = await prisma.absensi.count();
    const absensiMasuk = await prisma.absensi.count({ where: { status: 'masuk' } });
    const attendanceRate = totalAbsensi > 0 ? Math.round((absensiMasuk / totalAbsensi) * 100) : 0;

    // Calculate hafalan rate (simplified - percentage of santri with recent hafalan)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const santriWithRecentHafalan = await prisma.hafalan.groupBy({
      by: ['santriId'],
      where: {
        tanggal: { gte: thirtyDaysAgo }
      },
      _count: true
    });

    const hafalanRate = totalSantri > 0 ? Math.round((santriWithRecentHafalan.length / totalSantri) * 100) : 0;

    // Get recent activities (last 10)
    const recentHafalan = await prisma.hafalan.findMany({
      take: 10,
      orderBy: { tanggal: 'desc' },
      include: {
        santri: { select: { namaLengkap: true } }
      }
    });

    const recentAbsensi = await prisma.absensi.findMany({
      take: 10,
      orderBy: { tanggal: 'desc' },
      include: {
        santri: { select: { namaLengkap: true } },
        jadwal: {
          include: {
            halaqah: { select: { namaHalaqah: true } }
          }
        }
      }
    });

    // Get halaqah performance
    const halaqahPerformance = await prisma.halaqah.findMany({
      include: {
        santri: {
          include: {
            santri: {
              include: {
                Hafalan: {
                  where: { tanggal: { gte: thirtyDaysAgo } }
                },
                Absensi: {
                  where: { tanggal: { gte: thirtyDaysAgo } }
                }
              }
            }
          }
        }
      }
    });

    const halaqahStats = halaqahPerformance.map(h => {
      const santriCount = h.santri.length;
      const totalHafalan = h.santri.reduce((sum, hs) => sum + hs.santri.Hafalan.length, 0);
      const totalAbsensi = h.santri.reduce((sum, hs) => sum + hs.santri.Absensi.length, 0);
      const absensiMasuk = h.santri.reduce((sum, hs) =>
        sum + hs.santri.Absensi.filter(a => a.status === 'masuk').length, 0);

      return {
        id: h.id,
        namaHalaqah: h.namaHalaqah,
        santriCount,
        hafalanCount: totalHafalan,
        attendanceRate: totalAbsensi > 0 ? Math.round((absensiMasuk / totalAbsensi) * 100) : 0,
        hafalanRate: santriCount > 0 ? Math.round((totalHafalan / santriCount) * 100) : 0
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
      recentActivities: {
        hafalan: recentHafalan.map(h => ({
          id: h.id,
          type: 'hafalan',
          description: `${h.santri.namaLengkap} - ${h.surat} (${h.ayatMulai}-${h.ayatSelesai})`,
          date: h.tanggal.toISOString().split('T')[0]
        })),
        absensi: recentAbsensi.map(a => ({
          id: a.id,
          type: 'absensi',
          description: `${a.santri.namaLengkap} - ${a.jadwal.halaqah.namaHalaqah} (${a.status})`,
          date: a.tanggal.toISOString().split('T')[0]
        }))
      }
    });

  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}