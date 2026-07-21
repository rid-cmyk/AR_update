import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api-helpers'
import { prisma } from '@/lib/database/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request)
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const templateId = parseInt(id)
    const body = await request.json()
    const { isActive } = body

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

    return NextResponse.json({
      success: true,
      data: template
    })
  } catch (error) {
    console.error('Error toggling template status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
