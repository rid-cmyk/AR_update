import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function PATCH(
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
    const body = await request.json()
    const { isActive } = body

    // Cek apakah template exists
    const existingTemplate = await prisma.templateRaport.findUnique({
      where: { id: templateId }
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template tidak ditemukan' },
        { status: 404 }
      )
    }

    const template = await prisma.templateRaport.update({
      where: { id: templateId },
      data: { status: isActive ? 'aktif' : 'nonaktif' },
      include: {
        creator: {
          select: { namaLengkap: true }
        },
        _count: {
          select: { raportSantri: true }
        }
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error toggling template status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}