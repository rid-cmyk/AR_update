import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { withAuth } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin', 'admin', 'yayasan']);
    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: error === 'Insufficient permissions' ? 403 : 401 }
      );
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Default date range if not provided
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const end = endDate ? new Date(endDate) : new Date()

    console.log('Analytics Reports - Date Range:', { start, end })

    // Get all reports in parallel
    const [halaqahReports, santriReports, guruReports, summary] = await Promise.all([
      getHalaqahReports(start, end),
      getSantriReports(start, end),
      getGuruReports(start, end),
      getSummaryStatistics(start, end)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        halaqahReports,
        santriReports,
        guruReports,
        summary
      },
      metadata: {
        dateRange: { start, end },
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error generating analytics reports:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Gagal mengambil data laporan analytics'
      },
      { status: 500 }
    )
  } finally {
  }
}

// Get halaqah performance reports
async function getHalaqahReports(startDate: Date, endDate: Date) {
  try {
    // Agregasi langsung di DB via _count ber-filter (tanpa menarik record penuh / password user)
    const halaqahList = await prisma.halaqah.findMany({
      select: {
        id: true,
        namaHalaqah: true,
        guru: { select: { namaLengkap: true } },
        _count: {
          select: {
            santri: true
          }
        },
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
    })

    return halaqahList.map(halaqah => {
      const totalSantri = halaqah._count.santri
      const totalHafalan = halaqah.santri.reduce((sum, sh) => sum + sh.santri._count.Hafalan, 0)
      const totalUjian = halaqah.santri.reduce((sum, sh) => sum + sh.santri._count.ujianSantri, 0)
      const totalAbsensi = halaqah.santri.reduce((sum, sh) => sum + sh.santri._count.Absensi, 0)
      const presentCount = halaqah.santri.reduce((sum, sh) => sum + sh.santri.Absensi.length, 0)
      const attendanceRate = totalAbsensi > 0 ? Math.round((presentCount / totalAbsensi) * 100) : 0
      const hafalanRate = totalSantri > 0 ? Math.round((totalHafalan / (totalSantri * 10)) * 100) : 0

      return {
        id: halaqah.id,
        namaHalaqah: halaqah.namaHalaqah,
        namaGuru: halaqah.guru?.namaLengkap || 'Tidak ada guru',
        totalSantri,
        totalHafalan,
        totalUjian,
        attendanceRate: Math.min(attendanceRate, 100),
        hafalanRate: Math.min(hafalanRate, 100)
      }
    })
  } catch (error) {
    console.error('Error getting halaqah reports:', error)
    return []
  }
}

// Get santri progress reports
async function getSantriReports(startDate: Date, endDate: Date) {
  try {
    const santriList = await prisma.user.findMany({
      where: {
        role: {
          name: 'santri'
        }
      },
      select: {
        id: true,
        namaLengkap: true,
        HalaqahSantri: {
          select: { halaqah: { select: { namaHalaqah: true } } },
          take: 1
        },
        _count: {
          select: {
            Hafalan: { where: { tanggal: { gte: startDate, lte: endDate } } },
            ujianSantri: { where: { tanggalUjian: { gte: startDate, lte: endDate } } },
            Absensi: { where: { tanggal: { gte: startDate, lte: endDate } } }
          }
        },
        TargetHafalan: {
          where: { deadline: { gte: startDate, lte: endDate }, status: 'proses' },
          select: { id: true }
        },
        Absensi: {
          where: { tanggal: { gte: startDate, lte: endDate }, status: 'masuk' },
          select: { id: true }
        },
        Hafalan: {
          where: { tanggal: { gte: startDate, lte: endDate } },
          select: { tanggal: true },
          orderBy: { tanggal: 'desc' },
          take: 1
        }
      }
    })

    return santriList.map(santri => {
      const totalHafalan = santri._count.Hafalan
      const totalUjian = santri._count.ujianSantri
      const targetAktif = santri.TargetHafalan.length
      const totalAbsensi = santri._count.Absensi
      const presentCount = santri.Absensi.length
      const attendanceRate = totalAbsensi > 0 ? Math.round((presentCount / totalAbsensi) * 100) : 0
      const lastActivity = santri.Hafalan[0]?.tanggal.toISOString() ?? null

      return {
        id: santri.id,
        namaLengkap: santri.namaLengkap,
        halaqah: santri.HalaqahSantri?.[0]?.halaqah?.namaHalaqah || 'Tidak ada halaqah',
        totalHafalan,
        totalUjian,
        targetAktif,
        attendanceRate: Math.min(attendanceRate, 100),
        lastActivity
      }
    })
  } catch (error) {
    console.error('Error getting santri reports:', error)
    return []
  }
}

// Get guru performance reports
async function getGuruReports(startDate: Date, endDate: Date) {
  try {
    const guruList = await prisma.user.findMany({
      where: {
        role: {
          name: 'guru'
        }
      },
      select: {
        id: true,
        namaLengkap: true,
        _count: {
          select: {
            guruHalaqah: true,
            guruPermissions: true
          }
        },
        guruHalaqah: {
          select: {
            santri: {
              select: {
                santri: {
                  select: {
                    _count: {
                      select: {
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
        }
      }
    })

    return guruList.map(guru => {
      const halaqahCount = guru._count.guruHalaqah
      const totalSantri = guru.guruHalaqah.reduce((sum, h) => sum + h.santri.length, 0)
      const permissionCount = guru._count.guruPermissions
      
      // Calculate average attendance across all halaqah
      let totalAbsensi = 0
      let totalPresent = 0
      
      guru.guruHalaqah.forEach(halaqah => {
        halaqah.santri.forEach(santriHalaqah => {
          totalAbsensi += santriHalaqah.santri._count.Absensi
          totalPresent += santriHalaqah.santri.Absensi.length
        })
      })
      
      const averageAttendance = totalAbsensi > 0 ? Math.round((totalPresent / totalAbsensi) * 100) : 0

      return {
        id: guru.id,
        namaLengkap: guru.namaLengkap,
        halaqahCount,
        totalSantri,
        averageAttendance: Math.min(averageAttendance, 100),
        permissionCount
      }
    })
  } catch (error) {
    console.error('Error getting guru reports:', error)
    return []
  }
}

// Calculate summary statistics
async function getSummaryStatistics(startDate: Date, endDate: Date) {
  try {
    const [
      totalHalaqah,
      totalSantri,
      totalGuru,
      totalHafalanRecords,
      totalUjian,
      totalTarget,
      totalAbsensi,
      totalPresent,
      completedTargets
    ] = await Promise.all([
      prisma.halaqah.count(),
      prisma.user.count({ where: { role: { name: 'santri' } } }),
      prisma.user.count({ where: { role: { name: 'guru' } } }),
      prisma.hafalan.count({ where: { tanggal: { gte: startDate, lte: endDate } } }),
      prisma.ujianSantri.count({ where: { tanggalUjian: { gte: startDate, lte: endDate } } }),
      prisma.targetHafalan.count({ where: { deadline: { gte: startDate, lte: endDate } } }),
      prisma.absensi.count({ where: { tanggal: { gte: startDate, lte: endDate } } }),
      prisma.absensi.count({ where: { tanggal: { gte: startDate, lte: endDate }, status: 'masuk' } }),
      prisma.targetHafalan.count({ where: { deadline: { gte: startDate, lte: endDate }, status: 'selesai' } })
    ]);

    const overallAttendance = totalAbsensi > 0 ? Math.round((totalPresent / totalAbsensi) * 100) : 0
    const overallHafalanProgress = totalHafalanRecords > 0 ? Math.round((totalHafalanRecords / (totalSantri * 5)) * 100) : 0
    const targetProgress = totalTarget > 0 ? Math.round((completedTargets / totalTarget) * 100) : 0

    return {
      totalHalaqah,
      totalSantri,
      totalGuru,
      overallAttendance: Math.min(overallAttendance, 100),
      overallHafalanProgress: Math.min(overallHafalanProgress, 100),
      totalHafalanRecords,
      totalUjian,
      totalTarget,
      targetProgress: Math.min(targetProgress, 100)
    }
  } catch (error) {
    console.error('Error calculating summary statistics:', error)
    return {
      totalHalaqah: 0,
      totalSantri: 0,
      totalGuru: 0,
      overallAttendance: 0,
      overallHafalanProgress: 0,
      totalHafalanRecords: 0,
      totalUjian: 0,
      totalTarget: 0,
      targetProgress: 0
    }
  }
}