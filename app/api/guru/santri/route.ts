import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/database/prisma'
import { withAuth } from '@/lib/api-helpers'
import { withApiCache, cachedJsonResponse } from '@/lib/api-cache'

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

    const payload = await withApiCache(`guru:santri:${user.id}`, 60_000, async () => {
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
        return null
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
          semester: {
            include: {
              tahunAjaran: true
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
        tahunAjaran: hs.semester?.tahunAjaran ? {
          id: hs.semester.tahunAjaran.id,
          namaLengkap: hs.semester.tahunAjaran.namaLengkap,
          semester: hs.semester.namaSemester
        } : null,
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
      const byHalaqah = transformedSantri.reduce((acc: any, santri) => {
        const halaqahName = santri.halaqah?.namaHalaqah || 'Tidak ada halaqah'
        if (!acc[halaqahName]) {
          acc[halaqahName] = {
            halaqah: santri.halaqah,
            santri: []
          }
        }
        acc[halaqahName].santri.push(santri)
        return acc
      }, {} as any)

      return {
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
      }
    });

    if (!payload) {
      return NextResponse.json({
        success: false,
        message: 'Anda belum mengajar di halaqah manapun'
      }, { status: 404 })
    }

    return cachedJsonResponse(payload, 200, 60, 300);

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
