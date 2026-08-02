import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { getAuthUser, getGuruSantriIds } from '@/lib/auth'
import { notifyHafalan } from '@/lib/services/whatsapp-notifier'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const santriName = searchParams.get('santriName')
    const surat = searchParams.get('surat')
    const status = searchParams.get('status')

    // Get guru ID from session/auth
    const { user: authUser, error } = await getAuthUser()
    if (error || !authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Gunakan helper service untuk efisiensi Prisma (Hanya fetch ID)
    const santriIds = await getGuruSantriIds(authUser.id)

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
    const { user: authUser, error } = await getAuthUser()
    if (error || !authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

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

    notifyHafalan(
      hafalan.santriId,
      hafalan.status as 'ziyadah' | 'murojaah',
      {
        namaSurat: hafalan.surat,
        ayatAwal: hafalan.ayatMulai,
        ayatAkhir: hafalan.ayatSelesai,
        namaGuru: authUser.namaLengkap,
      }
    ).catch(console.error)

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