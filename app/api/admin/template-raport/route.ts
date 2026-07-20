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
    const tahunAjaranId = searchParams.get('tahunAjaranId')

    const whereClause: Record<string, unknown> = {}

    if (tahunAjaranId) {
      whereClause.tahunAjaranId = parseInt(tahunAjaranId)
    }

    const templates = await prisma.templateRaport.findMany({
      where: whereClause,
      include: {
        tahunAjaran: true,
        creator: {
          select: {
            id: true,
            namaLengkap: true
          }
        },
        _count: {
          select: {
            raportSantri: true
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
    console.error('Error fetching template raport:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data template raport' },
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
    const {
      nama,
      tahunAjaranId,
      namaLembaga,
      alamatLembaga,
      headerKop,
      footerKop,
      tandaTanganKepala,
      namaKepala,
      jabatanKepala,
      tampilanGrafik,
      tampilanRanking,
      catatanTemplate
    } = body

    if (!nama || !tahunAjaranId || !namaLembaga) {
      return NextResponse.json(
        { error: 'Nama template, tahun akademik, dan nama lembaga wajib diisi' },
        { status: 400 }
      )
    }

    const template = await prisma.templateRaport.create({
      data: {
        namaTemplate: nama,
        tahunAjaranId: parseInt(tahunAjaranId),
        namaLembaga,
        alamatLembaga: alamatLembaga || null,
        headerKop: headerKop || null,
        footerKop: footerKop || null,
        tandaTanganKepala: tandaTanganKepala || null,
        namaKepala: namaKepala || null,
        jabatanKepala: jabatanKepala || null,
        tampilanGrafik: tampilanGrafik ?? true,
        tampilanRanking: tampilanRanking ?? true,
        catatanTemplate: catatanTemplate || null,
        createdBy: user.id
      },
      include: {
        tahunAjaran: true,
        creator: {
          select: {
            id: true,
            namaLengkap: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: template,
      message: 'Template raport berhasil dibuat'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating template raport:', error)
    return NextResponse.json(
      { error: 'Gagal membuat template raport' },
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

    await prisma.templateRaport.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({
      success: true,
      message: 'Template raport berhasil dihapus'
    })
  } catch (error) {
    console.error('Error deleting template raport:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus template raport' },
      { status: 500 }
    )
  }
}
