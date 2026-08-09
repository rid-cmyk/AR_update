import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type'); // hafalan, absensi, prestasi, halaqah

    switch (reportType) {
      case 'hafalan':
        return await getHafalanReport();
      case 'absensi':
        return await getAbsensiReport();
      case 'prestasi':
        return await getPrestasiReport();
      case 'halaqah':
        return await getHalaqahReport();
      default:
        return await getOverviewReport();
    }
  } catch (error) {
    console.error('Global reports error:', error);
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
  }
}

async function getOverviewReport() {
  const [totalUsers, totalSantri, totalGuru, totalHalaqah, totalHafalan, totalAbsensi] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: { name: 'santri' } } }),
    prisma.user.count({ where: { role: { name: 'guru' } } }),
    prisma.halaqah.count(),
    prisma.hafalan.count(),
    prisma.absensi.count(),
  ]);

  return NextResponse.json({
    totalUsers,
    totalSantri,
    totalGuru,
    totalHalaqah,
    totalHafalan,
    totalAbsensi,
  });
}

async function getHafalanReport() {
  // Get overall hafalan statistics
  const totalHafalan = await prisma.hafalan.count();

  // Get hafalan by status
  const hafalanByStatus = await prisma.hafalan.groupBy({
    by: ['status'],
    _count: { status: true },
  });

  // Get top performing santri
  const topSantri = await prisma.user.findMany({
    where: { role: { name: 'santri' } },
    select: {
      id: true,
      namaLengkap: true,
      _count: {
        select: { Hafalan: true }
      }
    },
    orderBy: {
      Hafalan: { _count: 'desc' }
    },
    take: 10
  });

  // Get monthly hafalan progress
  const monthlyProgress = await prisma.$queryRaw`
    SELECT
      DATE_TRUNC('month', "tanggal") as month,
      COUNT(*) as total_hafalan,
      SUM("ayatSelesai" - "ayatMulai" + 1) as total_ayat
    FROM "Hafalan"
    WHERE "tanggal" >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
    GROUP BY DATE_TRUNC('month', "tanggal")
    ORDER BY month DESC
  `;

  // Get attendance by status to show in hafalan report too
  const absensiByStatus = await prisma.absensi.groupBy({
    by: ['status'],
    _count: { status: true },
  });

  return NextResponse.json({
    totalHafalan,
    hafalanByStatus,
    topSantri,
    monthlyProgress,
    absensiByStatus
  });
}

async function getAbsensiReport() {
  // Get overall attendance statistics
  const totalAbsensi = await prisma.absensi.count();

  // Get attendance by status
  const absensiByStatus = await prisma.absensi.groupBy({
    by: ['status'],
    _count: { status: true },
  });

  // Get attendance rate per halaqah
  const halaqahAttendance = await prisma.halaqah.findMany({
    select: {
      id: true,
      namaHalaqah: true,
      santri: {
        select: {
          santri: {
            select: {
              Absensi: {
                select: { status: true }
              }
            }
          }
        }
      }
    }
  });

  const attendanceByHalaqah = halaqahAttendance.map(halaqah => {
    const totalSantri = halaqah.santri.length;
    const totalAbsensi = halaqah.santri.reduce((sum, hs) => sum + hs.santri.Absensi.length, 0);
    const presentCount = halaqah.santri.reduce((sum, hs) =>
      sum + hs.santri.Absensi.filter(a => a.status === 'masuk').length, 0
    );

    return {
      halaqahId: halaqah.id,
      namaHalaqah: halaqah.namaHalaqah,
      totalSantri,
      attendanceRate: totalAbsensi > 0 ? (presentCount / totalAbsensi) * 100 : 0
    };
  });

  return NextResponse.json({
    totalAbsensi,
    absensiByStatus,
    attendanceByHalaqah
  });
}

async function getPrestasiReport() {
  // Get total achievements
  const totalPrestasi = await prisma.prestasi.count();

  // Get achievements by category
  const prestasiByCategory = await prisma.prestasi.groupBy({
    by: ['kategori'],
    _count: { kategori: true },
  });

  // Get achievements by year
  const prestasiByYear = await prisma.prestasi.groupBy({
    by: ['tahun'],
    _count: { tahun: true },
  });

  // Get top achievers
  const topAchievers = await prisma.user.findMany({
    where: { role: { name: 'santri' } },
    select: {
      id: true,
      namaLengkap: true,
      _count: {
        select: { Prestasi: true }
      }
    },
    orderBy: {
      Prestasi: { _count: 'desc' }
    },
    take: 10
  });

  return NextResponse.json({
    totalPrestasi,
    prestasiByCategory,
    prestasiByYear,
    topAchievers
  });
}

async function getHalaqahReport() {
  // Get halaqah performance metrics with minimal column selection
  const halaqahStats = await prisma.halaqah.findMany({
    select: {
      id: true,
      namaHalaqah: true,
      guru: {
        select: { namaLengkap: true }
      },
      santri: {
        select: {
          santri: {
            select: {
              _count: {
                select: {
                  Hafalan: true,
                  Prestasi: true,
                }
              },
              Absensi: {
                select: { status: true }
              }
            }
          }
        }
      },
      _count: {
        select: { jadwal: true }
      }
    }
  });

  const detailedStats = halaqahStats.map(halaqah => {
    const santriCount = halaqah.santri.length;
    const totalHafalan = halaqah.santri.reduce((sum, hs) => sum + hs.santri._count.Hafalan, 0);
    const totalAbsensi = halaqah.santri.reduce((sum, hs) => sum + hs.santri.Absensi.length, 0);
    const presentCount = halaqah.santri.reduce((sum, hs) =>
      sum + hs.santri.Absensi.filter(a => a.status === 'masuk').length, 0
    );
    const totalPrestasi = halaqah.santri.reduce((sum, hs) => sum + hs.santri._count.Prestasi, 0);

    return {
      halaqahId: halaqah.id,
      namaHalaqah: halaqah.namaHalaqah,
      guru: halaqah.guru?.namaLengkap || 'Tidak ada guru',
      santriCount,
      jadwalCount: halaqah._count.jadwal,
      averageHafalanPerSantri: santriCount > 0 ? totalHafalan / santriCount : 0,
      attendanceRate: totalAbsensi > 0 ? (presentCount / totalAbsensi) * 100 : 0,
      totalPrestasi
    };
  });

  return NextResponse.json({
    halaqahStats: detailedStats
  });
}