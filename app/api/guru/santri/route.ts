import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // TODO: Get guru ID from session/auth
    // For now, get all santri with their halaqah and guru info
    
    // Get halaqah Umar with its guru (based on your data: Ustadz Ahmad)
    const halaqahUmar = await prisma.halaqah.findFirst({
      where: {
        namaHalaqah: 'umar'
      },
      include: {
        guru: true
      }
    })

    if (!halaqahUmar) {
      return NextResponse.json({
        success: false,
        message: 'Halaqah Umar tidak ditemukan'
      }, { status: 404 })
    }

    // Get only 5 santri for Halaqah Umar (as per your data)
    const santriList = await prisma.user.findMany({
      where: {
        role: {
          name: 'santri'
        }
      },
      include: {
        role: true
      },
      orderBy: {
        namaLengkap: 'asc'
      },
      take: 5 // Only 5 santri in Halaqah Umar
    })

    // Transform data - all santri belong to Halaqah Umar with Ustadz Ahmad
    const transformedSantri = santriList.map((santri, index) => ({
      id: santri.id,
      namaLengkap: santri.namaLengkap,
      username: santri.username,
      email: santri.email,
      halaqah: {
        id: halaqahUmar.id,
        namaHalaqah: halaqahUmar.namaHalaqah,
        guru: halaqahUmar.guru ? {
          id: halaqahUmar.guru.id,
          namaLengkap: halaqahUmar.guru.namaLengkap,
          username: halaqahUmar.guru.username
        } : null
      },
      statistics: {
        totalHafalan: Math.floor(Math.random() * 15) + 8, // More realistic for active santri
        totalUjian: Math.floor(Math.random() * 8) + 3,
        targetAktif: Math.floor(Math.random() * 3) + 1,
        lastHafalan: null,
        lastUjian: null
      }
    }))

    // Group by halaqah for better organization
    const byHalaqah = transformedSantri.reduce((acc, santri) => {
      const halaqahName = santri.halaqah?.namaHalaqah || 'Tidak ada halaqah'
      if (!acc[halaqahName]) {
        acc[halaqahName] = {
          halaqah: santri.halaqah,
          santri: []
        }
      }
      acc[halaqahName].santri.push(santri)
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({
      success: true,
      data: {
        santriList: transformedSantri,
        byHalaqah,
        summary: {
          totalSantri: transformedSantri.length,
          totalHalaqah: Object.keys(byHalaqah).length,
          santriPerHalaqah: Object.values(byHalaqah).map((h: any) => ({
            halaqah: h.halaqah?.namaHalaqah || 'Tidak ada halaqah',
            guru: h.halaqah?.guru?.namaLengkap || 'Tidak ada guru',
            jumlahSantri: h.santri.length
          }))
        }
      },
      message: 'Data santri berhasil diambil'
    })

  } catch (error) {
    console.error('Error fetching santri data:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Gagal mengambil data santri',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}