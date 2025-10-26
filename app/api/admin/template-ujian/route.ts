import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jenisUjian = searchParams.get('jenisUjian')

    const whereClause: any = {
      status: 'aktif' // Only get active templates
    }

    if (jenisUjian) {
      whereClause.jenisUjian = jenisUjian
    }

    const templates = await prisma.templateUjian.findMany({
      where: whereClause,
      include: {
        komponenPenilaian: {
          orderBy: { urutan: 'asc' }
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
    const body = await request.json()
    const { nama, jenisUjianId, tahunAkademikId, deskripsi, komponenPenilaian } = body

    // Validasi input
    if (!nama || !jenisUjianId || !tahunAkademikId) {
      return NextResponse.json(
        { message: 'Nama template, jenis ujian, dan tahun akademik wajib diisi' },
        { status: 400 }
      )
    }

    // Validasi total bobot
    const totalBobot = komponenPenilaian.reduce((total: number, k: any) => total + (k.bobot || 0), 0)
    if (totalBobot !== 100) {
      return NextResponse.json(
        { message: 'Total bobot komponen penilaian harus 100%' },
        { status: 400 }
      )
    }

    // Cek apakah template dengan nama yang sama sudah ada
    const existingTemplate = await prisma.templateUjian.findFirst({
      where: {
        namaTemplate: nama,
        jenisUjian: jenisUjianId,
        tahunAjaranId: parseInt(tahunAkademikId)
      }
    })

    if (existingTemplate) {
      return NextResponse.json(
        { message: 'Template ujian dengan nama yang sama sudah ada untuk jenis ujian dan tahun akademik ini' },
        { status: 400 }
      )
    }

    // Buat template ujian baru
    const template = await prisma.templateUjian.create({
      data: {
        namaTemplate: nama,
        jenisUjian: jenisUjianId,
        tahunAjaranId: parseInt(tahunAkademikId),
        deskripsi: deskripsi || '',
        komponenPenilaian: {
          create: komponenPenilaian.map((komponen: any, index: number) => ({
            namaKomponen: komponen.nama,
            bobotNilai: komponen.bobot,
            deskripsi: komponen.deskripsi || '',
            urutan: index + 1
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

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating template ujian:', error)
    return NextResponse.json(
      { message: 'Gagal membuat template ujian' },
      { status: 500 }
    )
  }
}