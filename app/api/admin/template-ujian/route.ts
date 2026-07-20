import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api-helpers'
import { prisma } from '@/lib/database/prisma'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request)
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const jenisUjian = searchParams.get('jenisUjian')
    const tahunAjaranId = searchParams.get('tahunAjaranId')

    const whereClause: Record<string, unknown> = {}

    if (jenisUjian) {
      whereClause.jenisUjian = jenisUjian
    }
    if (tahunAjaranId) {
      whereClause.tahunAjaranId = parseInt(tahunAjaranId)
    }

    const templates = await prisma.templateUjian.findMany({
      where: whereClause,
      include: {
        komponenPenilaian: {
          orderBy: { urutan: 'asc' }
        },
        tahunAjaran: true,
        creator: {
          select: {
            id: true,
            namaLengkap: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: templates
    })
  } catch (error) {
    console.error('Error fetching template ujian:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data template ujian' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request)
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { nama, jenisUjian, tahunAjaranId, deskripsi, komponenPenilaian } = body

    if (!nama || !jenisUjian || !tahunAjaranId) {
      return NextResponse.json(
        { error: 'Nama template, jenis ujian, dan tahun akademik wajib diisi' },
        { status: 400 }
      )
    }

    if (komponenPenilaian && komponenPenilaian.length > 0) {
      const totalBobot = komponenPenilaian.reduce((total: number, k: Record<string, unknown>) => total + ((k.bobot as number) || 0), 0)
      if (Math.abs(totalBobot - 100) > 0.01) {
        return NextResponse.json(
          { error: 'Total bobot komponen penilaian harus 100%' },
          { status: 400 }
        )
      }
    }

    const template = await prisma.templateUjian.create({
      data: {
        namaTemplate: nama,
        jenisUjian: jenisUjian,
        tahunAjaranId: parseInt(tahunAjaranId),
        deskripsi: deskripsi || '',
        createdBy: user.id,
        komponenPenilaian: {
          create: (komponenPenilaian || []).map((komponen: Record<string, unknown>, index: number) => ({
            namaKomponen: komponen.nama as string,
            bobotNilai: komponen.bobot as number,
            deskripsi: (komponen.deskripsi as string) || '',
            urutan: (komponen.urutan as number) || index + 1
          }))
        }
      },
      include: {
        tahunAjaran: true,
        komponenPenilaian: {
          orderBy: { urutan: 'asc' }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: template,
      message: 'Template ujian berhasil dibuat'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating template ujian:', error)
    return NextResponse.json(
      { error: 'Gagal membuat template ujian' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request)
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID template wajib diisi' },
        { status: 400 }
      )
    }

    await prisma.templateUjian.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({
      success: true,
      message: 'Template ujian berhasil dihapus'
    })
  } catch (error) {
    console.error('Error deleting template ujian:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus template ujian' },
      { status: 500 }
    )
  }
}
