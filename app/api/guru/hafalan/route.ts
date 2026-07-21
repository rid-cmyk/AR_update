import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { getAuthUser } from '@/lib/auth'



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const santriName = searchParams.get('santriName')
    const surat = searchParams.get('surat')
    const status = searchParams.get('status')

    // TODO: Get guru ID from session/auth
    // For now, get the first guru found (demo purposes)
    const { user: authUser, error } = await getAuthUser()
    if (error || !authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    const guru = await prisma.user.findUnique({
      where: { id: authUser.id }
    })

    if (!guru) {
      return NextResponse.json({
        success: false,
        message: 'Guru tidak ditemukan'
      }, { status: 404 })
    }

    // Get santri from guru's halaqah using direct relation
    const halaqahList = await prisma.halaqah.findMany({
      where: {
        guruId: guru.id
      },
      include: {
        santri: {
          include: {
            santri: {
              select: {
                id: true,
                namaLengkap: true,
                username: true
              }
            }
          }
        }
      }
    })

    // Extract santri IDs from guru's halaqah
    const santriIds: number[] = []
    halaqahList.forEach(halaqah => {
      halaqah.santri.forEach(hs => {
        santriIds.push(hs.santri.id)
      })
    })

    if (santriIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Tidak ada santri di halaqah Anda'
      })
    }

    // Build where clause for filtering
    const whereClause: Record<string, unknown> = {
      santriId: {
        in: santriIds
      }
    }

    if (santriName) {
      whereClause.santri = {
        OR: [
          { namaLengkap: { contains: santriName, mode: 'insensitive' } },
          { username: { contains: santriName, mode: 'insensitive' } }
        ]
      }
    }

    if (surat) {
      whereClause.surat = {
        contains: surat,
        mode: 'insensitive'
      }
    }

    if (status) {
      whereClause.status = status
    }

    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    // Get hafalan data with santri information
    const hafalanData = await prisma.hafalan.findMany({
      where: whereClause,
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        }
      },
      orderBy: {
        tanggal: 'desc'
      },
      take: limit,
      skip: skip
    })

    const filteredData = hafalanData

    return NextResponse.json({
      success: true,
      data: filteredData,
      message: `Ditemukan ${filteredData.length} data hafalan`
    })

  } catch (error) {
    console.error('Error fetching hafalan:', error)
    return NextResponse.json({
      success: false,
      message: 'Gagal mengambil data hafalan'
    }, { status: 500 })
  } finally {
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { santriId, surat, ayatMulai, ayatSelesai, status, tanggal, keterangan } = body

    // Validation
    if (!santriId || !surat || !ayatMulai || !ayatSelesai || !status) {
      return NextResponse.json({
        success: false,
        error: 'Data tidak lengkap'
      }, { status: 400 })
    }

    // Create hafalan record
    const hafalan = await prisma.hafalan.create({
      data: {
        santriId: parseInt(santriId),
        surat,
        ayatMulai: parseInt(ayatMulai),
        ayatSelesai: parseInt(ayatSelesai),
        status,
        tanggal: new Date(tanggal),
        keterangan
      },
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: hafalan,
      message: 'Hafalan berhasil ditambahkan'
    })

  } catch (error) {
    console.error('Error creating hafalan:', error)
    return NextResponse.json({
      success: false,
      error: 'Gagal menambahkan hafalan'
    }, { status: 500 })
  } finally {
  }
}