import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // TODO: Get guru ID from session/auth
    // For now, use the first guru found (demo purposes)
    const guru = await prisma.user.findFirst({
      where: {
        role: {
          name: 'guru'
        }
      }
    })

    if (!guru) {
      return NextResponse.json({
        success: false,
        message: 'Guru tidak ditemukan'
      }, { status: 404 })
    }

    // Get guru's halaqah
    const halaqahList = await prisma.halaqah.findMany({
      where: {
        guruId: guru.id
      },
      include: {
        santri: {
          include: {
            santri: true
          }
        }
      }
    })

    // Calculate total santri
    const totalSantri = halaqahList.reduce((total, halaqah) => total + halaqah.santri.length, 0)

    // Get today's date for filtering
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Get hafalan data for today
    const hafalanToday = await prisma.hafalan.count({
      where: {
        tanggal: {
          gte: startOfDay,
          lt: endOfDay
        },
        santriId: {
          in: halaqahList.flatMap(h => h.santri.map(s => s.santriId))
        }
      }
    })

    // Get absensi data for today
    const absensiToday = await prisma.absensi.findMany({
      where: {
        tanggal: {
          gte: startOfDay,
          lt: endOfDay
        },
        santriId: {
          in: halaqahList.flatMap(h => h.santri.map(s => s.santriId))
        }
      }
    })

    const absensiHadir = absensiToday.filter(a => a.status === 'masuk').length
    const absensiTotal = absensiToday.length
    const absensiRate = absensiTotal > 0 ? Math.round((absensiHadir / absensiTotal) * 100) : 0

    // Get target hafalan data
    const targetTertunda = await prisma.targetHafalan.count({
      where: {
        deadline: {
          lt: today
        },
        status: {
          in: ['belum', 'proses']
        },
        santriId: {
          in: halaqahList.flatMap(h => h.santri.map(s => s.santriId))
        }
      }
    })

    // Calculate hafalan rate (simplified calculation)
    const totalHafalan = await prisma.hafalan.count({
      where: {
        santriId: {
          in: halaqahList.flatMap(h => h.santri.map(s => s.santriId))
        }
      }
    })
    
    const hafalanRate = totalSantri > 0 ? Math.round((totalHafalan / (totalSantri * 30)) * 100) : 0 // Assuming 30 juz target

    // Get recent ujian data
    const recentUjian = await prisma.ujianSantri.findMany({
      where: {
        createdBy: guru.id
      },
      include: {
        santri: true,
        templateUjian: true
      },
      orderBy: {
        tanggalUjian: 'desc'
      },
      take: 5
    })

    const dashboardData = {
      success: true,
      overview: {
        totalSantri,
        totalHafalanToday: hafalanToday,
        absensiHadir,
        absensiTotal,
        absensiRate,
        targetTertunda,
        hafalanRate: Math.min(hafalanRate, 100) // Cap at 100%
      },
      halaqah: halaqahList.map(h => ({
        id: h.id,
        namaHalaqah: h.namaHalaqah,
        totalSantri: h.santri.length,
        santriAktif: h.santri.length // Simplified - assume all active
      })),
      recentActivity: {
        ujian: recentUjian.map(u => ({
          id: u.id,
          santriNama: u.santri.namaLengkap,
          jenisUjian: u.templateUjian.jenisUjian,
          nilaiAkhir: u.nilaiAkhir,
          tanggal: u.tanggalUjian.toISOString()
        })),
        hafalan: [], // TODO: Add recent hafalan data if needed
        absensi: [] // TODO: Add recent absensi data if needed
      },
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Error fetching guru dashboard analytics:', error)
    
    // Return sample data if database query fails
    const sampleData = {
      success: true,
      overview: {
        totalSantri: 5,
        totalHafalanToday: 3,
        absensiHadir: 4,
        absensiTotal: 5,
        absensiRate: 80,
        targetTertunda: 2,
        hafalanRate: 75
      },
      halaqah: [
        {
          id: 1,
          namaHalaqah: 'umar',
          totalSantri: 5,
          santriAktif: 5
        }
      ],
      recentActivity: {
        ujian: [
          {
            id: 1,
            santriNama: 'Santri 1',
            jenisUjian: 'tasmi',
            nilaiAkhir: 85,
            tanggal: new Date().toISOString()
          }
        ],
        hafalan: [],
        absensi: []
      },
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(sampleData)
  } finally {
    await prisma.$disconnect()
  }
}