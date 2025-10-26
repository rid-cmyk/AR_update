import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const templateId = parseInt(id)
    if (isNaN(templateId)) {
      return NextResponse.json({ error: 'ID template tidak valid' }, { status: 400 })
    }

    // Cek apakah template masih digunakan
    const ujianCount = await prisma.ujianSantri.count({
      where: { templateUjianId: templateId }
    })

    if (ujianCount > 0) {
      return NextResponse.json({ 
        error: 'Template tidak dapat dihapus karena masih digunakan dalam ujian' 
      }, { status: 400 })
    }

    // Hapus komponen penilaian terlebih dahulu
    await prisma.komponenPenilaian.deleteMany({
      where: { templateUjianId: templateId }
    })

    // Hapus template ujian
    await prisma.templateUjian.delete({
      where: { id: templateId }
    })

    return NextResponse.json({ message: 'Template ujian berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting template ujian:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const templateId = parseInt(id)
    if (isNaN(templateId)) {
      return NextResponse.json({ error: 'ID template tidak valid' }, { status: 400 })
    }

    const template = await prisma.templateUjian.findUnique({
      where: { id: templateId },
      include: {
        tahunAjaran: true,
        komponenPenilaian: {
          orderBy: { urutan: 'asc' }
        }
      }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error fetching template ujian:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}