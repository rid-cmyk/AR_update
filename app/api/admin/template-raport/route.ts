import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const templates = await prisma.templateRaport.findMany({
      include: {
        tahunAjaran: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching template raport:', error)
    return NextResponse.json(
      { message: 'Gagal mengambil data template raport' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const nama = formData.get('nama') as string
    const tahunAjaranId = formData.get('tahunAjaranId') as string
    const namaLembaga = formData.get('namaLembaga') as string
    const alamatLembaga = formData.get('alamatLembaga') as string
    const headerKop = formData.get('headerKop') as string
    const footerKop = formData.get('footerKop') as string
    const namaKepala = formData.get('namaKepala') as string
    const jabatanKepala = formData.get('jabatanKepala') as string
    const tampilanGrafik = formData.get('tampilanGrafik') === 'true'
    const tampilanRanking = formData.get('tampilanRanking') === 'true'
    const deskripsi = formData.get('deskripsi') as string

    // Handle file uploads (logo dan tanda tangan)
    const logoFile = formData.get('logoLembaga') as File
    const ttdFile = formData.get('tandaTanganKepala') as File

    // Validasi input
    if (!nama || !tahunAjaranId || !namaLembaga) {
      return NextResponse.json(
        { message: 'Nama template, tahun akademik, dan nama lembaga wajib diisi' },
        { status: 400 }
      )
    }

    // Cek apakah template dengan nama yang sama sudah ada
    const existingTemplate = await prisma.templateRaport.findFirst({
      where: {
        namaTemplate: nama,
        tahunAjaranId: parseInt(tahunAjaranId)
      }
    })

    if (existingTemplate) {
      return NextResponse.json(
        { message: 'Template raport dengan nama yang sama sudah ada untuk tahun akademik ini' },
        { status: 400 }
      )
    }

    // TODO: Implement file upload logic for logo and signature
    // For now, we'll store the file names or paths as strings
    let logoPath = null
    let ttdPath = null

    if (logoFile && logoFile.size > 0) {
      // logoPath = await uploadFile(logoFile, 'logos')
      logoPath = `logos/${Date.now()}_${logoFile.name}`
    }

    if (ttdFile && ttdFile.size > 0) {
      // ttdPath = await uploadFile(ttdFile, 'signatures')
      ttdPath = `signatures/${Date.now()}_${ttdFile.name}`
    }

    // Buat template raport baru
    const template = await prisma.templateRaport.create({
      data: {
        namaTemplate: nama,
        tahunAjaranId: parseInt(tahunAjaranId),
        namaLembaga,
        alamatLembaga: alamatLembaga || '',
        headerKop: headerKop || '',
        footerKop: footerKop || '',
        namaKepala: namaKepala || '',
        jabatanKepala: jabatanKepala || 'Kepala Pondok',
        tampilanGrafik,
        tampilanRanking,

        logoLembaga: logoPath,
        tandaTanganKepala: ttdPath
      },
      include: {
        tahunAjaran: true
      }
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating template raport:', error)
    return NextResponse.json(
      { message: 'Gagal membuat template raport' },
      { status: 500 }
    )
  }
}