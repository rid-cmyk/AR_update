import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tahunAkademikId = searchParams.get('tahunAkademikId')
    const generateAll = searchParams.get('generateAll') === 'true'
    const halaqahIds = searchParams.getAll('halaqahIds').map(id => parseInt(id))

    if (!tahunAkademikId) {
      return NextResponse.json(
        { error: 'Tahun akademik wajib diisi' },
        { status: 400 }
      )
    }

    // Get tahun akademik
    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id: parseInt(tahunAkademikId) }
    })

    if (!tahunAjaran) {
      return NextResponse.json(
        { error: 'Tahun akademik tidak ditemukan' },
        { status: 404 }
      )
    }

    // Get santri berdasarkan parameter
    const santriQuery: any = {
      tahunAkademik: tahunAjaran.namaLengkap,
      semester: tahunAjaran.semester
    }

    if (!generateAll && halaqahIds.length > 0) {
      santriQuery.halaqahId = { in: halaqahIds }
    }

    const santriList = await prisma.halaqahSantri.findMany({
      where: santriQuery,
      include: {
        santri: true
      }
    })

    // Check existing raport
    const existingRaport = await prisma.raportSantri.count({
      where: {
        tahunAjaranId: parseInt(tahunAkademikId),
        santriId: {
          in: santriList.map(hs => hs.santriId)
        }
      }
    })

    const totalSantri = santriList.length
    const newRaport = totalSantri - existingRaport

    return NextResponse.json({
      totalSantri,
      existingRaport,
      newRaport
    })
  } catch (error) {
    console.error('Error previewing raport generation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}