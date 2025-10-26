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
    const raportCount = await prisma.raportSantri.count({
      where: { templateRaportId: templateId }
    })

    if (raportCount > 0) {
      return NextResponse.json({ 
        error: 'Template tidak dapat dihapus karena masih digunakan dalam raport' 
      }, { status: 400 })
    }

    // Hapus template raport
    await prisma.templateRaport.delete({
      where: { id: templateId }
    })

    return NextResponse.json({ message: 'Template raport berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting template raport:', error)
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

    const template = await prisma.templateRaport.findUnique({
      where: { id: templateId },
      include: {
        tahunAjaran: true
      }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error fetching template raport:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}