import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['admin', 'super-admin']);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      const { searchParams } = new URL(request.url);
      const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Date filters
    const dateFilter = startDate && endDate ? {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate + 'T23:59:59.999Z')
      }
    } : {};
    
    const hafalanDateFilter = startDate && endDate ? {
      tanggal: {
        gte: new Date(startDate),
        lte: new Date(endDate + 'T23:59:59.999Z')
      }
    } : {};
    
    const absensiDateFilter = startDate && endDate ? {
      tanggal: {
        gte: new Date(startDate),
        lte: new Date(endDate + 'T23:59:59.999Z')
      }
    } : {};
    
    const ujianDateFilter = startDate && endDate ? {
      tanggal: {
        gte: new Date(startDate),
        lte: new Date(endDate + 'T23:59:59.999Z')
      }
    } : {};

    // Get Halaqah Reports
    const halaqahReports = await prisma.halaqah.findMany({
      include: {
        guru: {
          select: {
            namaLengkap: true
          }
        },
        santri: {
          include: {
            santri: {
              include: {
                Hafalan: {
                  where: hafalanDateFilter
                },
                Absensi: {
                  where: absensiDateFilter
                }
              }
            }
          }
        },
        ujian: {
          where: ujianDateFilter,
          include: {
            santri: true
          }
        }
      }
    });

    // Process halaqah data
    const processedHalaqahReports = halaqahReports.map(halaqah => {
      const totalSantri = halaqah.santri.length;
      const totalHafalan = halaqah.santri.reduce((sum, hs) => 
        sum + hs.santri.Hafalan.length, 0
      );
      
      // Calculate attendance rate
      const totalAbsensi = halaqah.santri.reduce((sum, hs) => 
        sum + hs.santri.Absensi.length, 0
      );
      const hadir = halaqah.santri.reduce((sum, hs) => 
        sum + hs.santri.Absensi.filter(a => a.status === 'masuk').length, 0
      );
      const attendanceRate = totalAbsensi > 0 ? Math.round((hadir / totalAbsensi) * 100) : 0;

      // Calculate hafalan rate (average progress)
      const avgHafalanPerSantri = totalSantri > 0 ? totalHafalan / totalSantri : 0;
      const hafalanRate = Math.min(Math.round((avgHafalanPerSantri / 30) * 100), 100); // Assuming 30 juz max

      return {
        id: halaqah.id,
        namaHalaqah: halaqah.namaHalaqah,
        namaGuru: halaqah.guru?.namaLengkap || 'Belum ada guru',
        totalSantri,
        totalHafalan,
        totalUjian: halaqah.ujian.length,
        attendanceRate,
        hafalanRate
      };
    });

    // Get Santri Reports
    const santriReports = await prisma.user.findMany({
      where: {
        role: {
          name: 'santri'
        }
      },
      include: {
        HalaqahSantri: {
          include: {
            halaqah: true
          }
        },
        Hafalan: {
          where: hafalanDateFilter
        },
        Absensi: {
          where: absensiDateFilter
        },
        Ujian: {
          where: ujianDateFilter,
          orderBy: {
            tanggal: 'desc'
          },
          take: 1
        },
        TargetHafalan: {
          where: {
            status: 'proses'
          }
        }
      }
    });

    const processedSantriReports = santriReports.map(santri => {
      const halaqah = santri.HalaqahSantri[0]?.halaqah?.namaHalaqah || 'Belum ada halaqah';
      const totalHafalan = santri.Hafalan.length;
      
      // Calculate attendance rate
      const totalAbsensi = santri.Absensi.length;
      const hadir = santri.Absensi.filter(a => a.status === 'masuk').length;
      const attendanceRate = totalAbsensi > 0 ? Math.round((hadir / totalAbsensi) * 100) : 0;

      // Last activity
      const lastHafalan = santri.Hafalan[0]?.tanggal;
      const lastAbsensi = santri.Absensi[0]?.tanggal;
      const lastUjian = santri.Ujian[0]?.tanggal;
      
      const lastActivity = [lastHafalan, lastAbsensi, lastUjian]
        .filter(Boolean)
        .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())[0];

      return {
        id: santri.id,
        namaLengkap: santri.namaLengkap,
        halaqah,
        totalHafalan,
        totalUjian: santri.Ujian.length,
        targetAktif: santri.TargetHafalan.length,
        attendanceRate,
        lastActivity: lastActivity || null
      };
    });

    // Get Guru Reports
    const guruReports = await prisma.user.findMany({
      where: {
        role: {
          name: 'guru'
        }
      },
      include: {
        guruHalaqah: {
          include: {
            santri: {
              include: {
                santri: {
                  include: {
                    Absensi: {
                      where: absensiDateFilter
                    }
                  }
                }
              }
            }
          }
        },
        guruPermissions: {
          include: {
            halaqah: true
          }
        }
      }
    });

    const processedGuruReports = guruReports.map(guru => {
      const halaqahCount = guru.guruHalaqah.length + guru.guruPermissions.length;
      const totalSantri = guru.guruHalaqah.reduce((sum, h) => sum + h.santri.length, 0);
      
      // Calculate average attendance from all santri under this guru
      let totalAbsensi = 0;
      let totalHadir = 0;
      
      guru.guruHalaqah.forEach(halaqah => {
        halaqah.santri.forEach(hs => {
          totalAbsensi += hs.santri.Absensi.length;
          totalHadir += hs.santri.Absensi.filter(a => a.status === 'masuk').length;
        });
      });

      const averageAttendance = totalAbsensi > 0 ? Math.round((totalHadir / totalAbsensi) * 100) : 0;

      return {
        id: guru.id,
        namaLengkap: guru.namaLengkap,
        halaqahCount,
        totalSantri,
        averageAttendance,
        permissionCount: guru.guruPermissions.length
      };
    });

    // Get Summary Statistics
    const totalHalaqah = await prisma.halaqah.count();
    const totalSantri = await prisma.user.count({
      where: { role: { name: 'santri' } }
    });
    const totalGuru = await prisma.user.count({
      where: { role: { name: 'guru' } }
    });

    // Overall attendance
    const allAbsensi = await prisma.absensi.findMany({
      where: absensiDateFilter
    });
    const overallAttendance = allAbsensi.length > 0 
      ? Math.round((allAbsensi.filter(a => a.status === 'masuk').length / allAbsensi.length) * 100)
      : 0;

    // Overall hafalan progress
    const totalHafalanRecords = await prisma.hafalan.count({
      where: hafalanDateFilter
    });
    const avgHafalanPerSantri = totalSantri > 0 ? totalHafalanRecords / totalSantri : 0;
    const overallHafalanProgress = Math.min(Math.round((avgHafalanPerSantri / 30) * 100), 100);

    // Additional statistics
    const totalUjian = await prisma.ujian.count({
      where: ujianDateFilter
    });
    const totalTarget = await prisma.targetHafalan.count();
    const targetSelesai = await prisma.targetHafalan.count({
      where: { status: 'selesai' }
    });
    const targetProgress = totalTarget > 0 ? Math.round((targetSelesai / totalTarget) * 100) : 0;

    const summary = {
      totalHalaqah,
      totalSantri,
      totalGuru,
      overallAttendance,
      overallHafalanProgress,
      totalHafalanRecords,
      totalUjian,
      totalTarget,
      targetProgress
    };

      return NextResponse.json({
        halaqahReports: processedHalaqahReports,
        santriReports: processedSantriReports,
        guruReports: processedGuruReports,
        summary
      });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Analytics reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}