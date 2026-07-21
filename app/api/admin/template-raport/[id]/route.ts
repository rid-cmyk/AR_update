import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api-helpers'
import { prisma } from '@/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request)
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const template = await prisma.templateRaport.findUnique({
      where: { id: parseInt(id) },
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
      }
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template raport tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: template
    })
  } catch (error) {
    console.error('Error fetching template raport:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data template raport' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request)
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
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
      catatanTemplate,
      status
    } = body

    const existing = await prisma.templateRaport.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Template raport tidak ditemukan' },
        { status: 404 }
      )
    }

    if (!nama || !namaLembaga) {
      return NextResponse.json(
        { error: 'Nama template dan nama lembaga wajib diisi' },
        { status: 400 }
      )
    }

    const template = await prisma.templateRaport.update({
      where: { id: parseInt(id) },
      data: {
        namaTemplate: nama,
        tahunAjaranId: tahunAjaranId ? parseInt(tahunAjaranId) : existing.tahunAjaranId,
        namaLembaga,
        alamatLembaga: alamatLembaga ?? existing.alamatLembaga,
        headerKop: headerKop ?? existing.headerKop,
        footerKop: footerKop ?? existing.footerKop,
        tandaTanganKepala: tandaTanganKepala ?? existing.tandaTanganKepala,
        namaKepala: namaKepala ?? existing.namaKepala,
        jabatanKepala: jabatanKepala ?? existing.jabatanKepala,
        tampilanGrafik: tampilanGrafik ?? existing.tampilanGrafik,
        tampilanRanking: tampilanRanking ?? existing.tampilanRanking,
        catatanTemplate: catatanTemplate ?? existing.catatanTemplate,
        status: status ?? existing.status
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
      message: 'Template raport berhasil diupdate'
    })
  } catch (error) {
    console.error('Error updating template raport:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate template raport' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request)
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.templateRaport.findUnique({
      where: { id: parseInt(id) },
      include: { _count: { select: { raportSantri: true } } }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Template raport tidak ditemukan' },
        { status: 404 }
      )
    }

    if (existing._count.raportSantri > 0) {
      return NextResponse.json(
        { error: 'Template tidak bisa dihapus karena masih digunakan oleh raport santri' },
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
