import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Default date range if not provided
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const end = endDate ? new Date(endDate) : new Date()

    console.log('Analytics Reports - Date Range:', { start, end })

    // Get halaqah reports
    const halaqahReports = await getHalaqahReports(start, end)
    
    // Get santri reports  
    const santriReports = await getSantriReports(start, end)
    
    // Get guru reports
    const guruReports = await getGuruReports(start, end)
    
    // Calculate summary statistics
    const summary = await getSummaryStatistics(start, end)

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
        message: 'Gagal mengambil data laporan analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Get halaqah performance reports
async function getHalaqahReports(startDate: Date, endDate: Date) {
  try {
    // Get all halaqah with their guru
    const halaqahList = await prisma.halaqah.findMany({
      include: {
        guru: true,
        santri: {
          include: {
            santri: {
              include: {
                Hafalan: {
                  where: {
                    tanggal: {
                      gte: startDate,
                      lte: endDate
                    }
                  }
                },
                ujianSantri: {
                  where: {
                    tanggalUjian: {
                      gte: startDate,
                      lte: endDate
                    }
                  }
                },
                Absensi: {
                  where: {
                    tanggal: {
                      gte: startDate,
                      lte: endDate
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    return halaqahList.map(halaqah => {
      const totalSantri = halaqah.santri.length
      const totalHafalan = halaqah.santri.reduce((sum, santriHalaqah) => sum + santriHalaqah.santri.Hafalan.length, 0)
      const totalUjian = halaqah.santri.reduce((sum, santriHalaqah) => sum + santriHalaqah.santri.ujianSantri.length, 0)
      
      // Calculate attendance rate
      const totalAbsensi = halaqah.santri.reduce((sum, santriHalaqah) => sum + santriHalaqah.santri.Absensi.length, 0)
      const presentCount = halaqah.santri.reduce((sum, santriHalaqah) => 
        sum + santriHalaqah.santri.Absensi.filter(abs => abs.status === 'masuk').length, 0
      )
      const attendanceRate = totalAbsensi > 0 ? Math.round((presentCount / totalAbsensi) * 100) : 0
      
      // Calculate hafalan rate (simplified)
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
      include: {
        HalaqahSantri: {
          include: {
            halaqah: true
          }
        },
        Hafalan: {
          where: {
            tanggal: {
              gte: startDate,
              lte: endDate
            }
          }
        },
        ujianSantri: {
          where: {
            tanggalUjian: {
              gte: startDate,
              lte: endDate
            }
          }
        },
        TargetHafalan: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        },
        Absensi: {
          where: {
            tanggal: {
              gte: startDate,
              lte: endDate
            }
          }
        }
      }
    })

    return santriList.map(santri => {
      const totalHafalan = santri.Hafalan.length
      const totalUjian = santri.ujianSantri.length
      const targetAktif = santri.TargetHafalan.filter(t => t.status === 'proses').length
      
      // Calculate attendance rate
      const totalAbsensi = santri.Absensi.length
      const presentCount = santri.Absensi.filter(abs => abs.status === 'masuk').length
      const attendanceRate = totalAbsensi > 0 ? Math.round((presentCount / totalAbsensi) * 100) : 0
      
      // Get last activity
      const lastHafalan = santri.Hafalan.sort((a, b) => 
        new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
      )[0]
      const lastActivity = lastHafalan ? lastHafalan.tanggal.toISOString() : null

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
      include: {
        guruHalaqah: {
          include: {
            santri: {
              include: {
                santri: {
                  include: {
                    Absensi: {
                      where: {
                        tanggal: {
                          gte: startDate,
                          lte: endDate
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        guruPermissions: true
      }
    })

    return guruList.map(guru => {
      const halaqahCount = guru.guruHalaqah.length
      const totalSantri = guru.guruHalaqah.reduce((sum, h) => sum + h.santri.length, 0)
      const permissionCount = guru.guruPermissions.length
      
      // Calculate average attendance across all halaqah
      let totalAbsensi = 0
      let totalPresent = 0
      
      guru.guruHalaqah.forEach(halaqah => {
        halaqah.santri.forEach(santriHalaqah => {
          totalAbsensi += santriHalaqah.santri.Absensi.length
          totalPresent += santriHalaqah.santri.Absensi.filter(abs => abs.status === 'masuk').length
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
    // Count totals
    const totalHalaqah = await prisma.halaqah.count()
    const totalSantri = await prisma.user.count({
      where: { role: { name: 'santri' } }
    })
    const totalGuru = await prisma.user.count({
      where: { role: { name: 'guru' } }
    })

    // Count records in date range
    const totalHafalanRecords = await prisma.hafalan.count({
      where: {
        tanggal: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    const totalUjian = await prisma.ujianSantri.count({
      where: {
        tanggalUjian: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    const totalTarget = await prisma.targetHafalan.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    // Calculate attendance rate
    const totalAbsensi = await prisma.absensi.count({
      where: {
        tanggal: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    const totalPresent = await prisma.absensi.count({
      where: {
        tanggal: {
          gte: startDate,
          lte: endDate
        },
        status: 'masuk'
      }
    })

    const overallAttendance = totalAbsensi > 0 ? Math.round((totalPresent / totalAbsensi) * 100) : 0

    // Calculate hafalan progress (simplified)
    const completedTargets = await prisma.targetHafalan.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'selesai'
      }
    })

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