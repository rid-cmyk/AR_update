import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const santriId = searchParams.get('santriId');

    if (!santriId) {
      return NextResponse.json({ error: 'Santri ID is required' }, { status: 400 });
    }

    // Get santri basic info
    const santri = await prisma.user.findUnique({
      where: { id: Number(santriId) },
      include: {
        role: true,
        HalaqahSantri: {
          include: {
            halaqah: {
              include: {
                guru: true,
                jadwal: true
              }
            }
          }
        }
      }
    });

    if (!santri) {
      return NextResponse.json({ error: 'Santri not found' }, { status: 404 });
    }

    // Get hafalan statistics
    const hafalanStats = await prisma.hafalan.groupBy({
      by: ['status'],
      where: { santriId: Number(santriId) },
      _count: { status: true },
      _sum: {
        ayatMulai: true,
        ayatSelesai: true
      }
    });

    const totalAyatHafal = hafalanStats.reduce((sum, stat) => {
      return sum + (stat._sum.ayatSelesai || 0) - (stat._sum.ayatMulai || 0) + stat._count.status;
    }, 0);

    // Get recent hafalan
    const recentHafalan = await prisma.hafalan.findMany({
      where: { santriId: Number(santriId) },
      orderBy: { tanggal: 'desc' },
      take: 10
    });

    // Get attendance statistics
    const attendanceStats = await prisma.absensi.groupBy({
      by: ['status'],
      where: { santriId: Number(santriId) },
      _count: { status: true }
    });

    const totalAbsensi = attendanceStats.reduce((sum, stat) => sum + stat._count.status, 0);
    const presentCount = attendanceStats.find(stat => stat.status === 'masuk')?._count.status || 0;
    const attendanceRate = totalAbsensi > 0 ? (presentCount / totalAbsensi) * 100 : 0;

    // Get target progress
    const targets = await prisma.targetHafalan.findMany({
      where: { santriId: Number(santriId) },
      orderBy: { deadline: 'desc' }
    });

    // Get achievements
    const achievements = await prisma.prestasi.findMany({
      where: { santriId: Number(santriId) },
      orderBy: { tahun: 'desc' }
    });

    // Get monthly progress
    const monthlyProgress = await prisma.$queryRaw`
      SELECT
        DATE_TRUNC('month', "tanggal") as month,
        COUNT(*) as hafalan_count,
        SUM("ayatSelesai" - "ayatMulai" + 1) as ayat_count
      FROM "Hafalan"
      WHERE "santriId" = ${Number(santriId)}
        AND "tanggal" >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')
      GROUP BY DATE_TRUNC('month', "tanggal")
      ORDER BY month DESC
    `;

    return NextResponse.json({
      santri: {
        id: santri.id,
        namaLengkap: santri.namaLengkap,
        username: santri.username,
        role: santri.role.name,
        halaqah: santri.HalaqahSantri.map(hs => ({
          id: hs.halaqah.id,
          namaHalaqah: hs.halaqah.namaHalaqah,
          guru: hs.halaqah.guru.namaLengkap,
          jadwal: hs.halaqah.jadwal
        }))
      },
      statistics: {
        totalAyatHafal,
        hafalanByType: hafalanStats,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        attendanceStats,
        totalTargets: targets.length,
        completedTargets: targets.filter(t => t.status === 'selesai').length,
        totalAchievements: achievements.length
      },
      recentHafalan,
      targets,
      achievements,
      monthlyProgress
    });

  } catch (error) {
    console.error('Santri detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch santri details' }, { status: 500 });
  }
}