import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/database/prisma'
import { withAuth } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { user, error } = await withAuth(request)
    if (error || !user) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized - Silakan login terlebih dahulu'
      }, { status: 401 })
    }

    // Verify user is a guru
    if (user.role.name !== 'guru') {
      return NextResponse.json({
        success: false,
        message: 'Access denied - Hanya guru yang dapat mengakses endpoint ini'
      }, { status: 403 })
    }

    // Get halaqah yang diajar oleh guru ini
    const halaqahList = await prisma.halaqah.findMany({
      where: {
        guruId: user.id
      },
      include: {
        guru: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        }
      }
    })

    if (halaqahList.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Anda belum mengajar di halaqah manapun'
      }, { status: 404 })
    }

    // Get IDs dari halaqah yang diajar
    const halaqahIds = halaqahList.map(h => h.id)

    // Get santri yang terdaftar di halaqah-halaqah tersebut
    const halaqahSantriList = await prisma.halaqahSantri.findMany({
      where: {
        halaqahId: {
          in: halaqahIds
        }
      },
      include: {
        santri: {
          include: {
            role: true
          }
        },
        halaqah: {
          include: {
            guru: {
              select: {
                id: true,
                namaLengkap: true,
                username: true
              }
            }
          }
        }
      },
      orderBy: {
        santri: {
          namaLengkap: 'asc'
        }
      }
    })

    // Transform data
    const transformedSantri = halaqahSantriList.map((hs) => ({
      id: hs.santri.id,
      namaLengkap: hs.santri.namaLengkap,
      username: hs.santri.username,
      email: hs.santri.email,
      tahunAkademik: hs.tahunAkademik,
      semester: hs.semester,
      halaqah: {
        id: hs.halaqah.id,
        namaHalaqah: hs.halaqah.namaHalaqah,
        guru: hs.halaqah.guru ? {
          id: hs.halaqah.guru.id,
          namaLengkap: hs.halaqah.guru.namaLengkap,
          username: hs.halaqah.guru.username
        } : null
      }
    }))

    // Group by halaqah
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
        halaqahList: halaqahList.map(h => ({
          id: h.id,
          namaHalaqah: h.namaHalaqah,
          guru: h.guru
        })),
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
      message: `Data santri dari ${halaqahList.length} halaqah berhasil diambil`
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
  }
}
