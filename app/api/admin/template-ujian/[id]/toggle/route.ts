import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from "@/lib/auth"
import { prisma } from '@/lib/database/prisma'
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthUser(request)
    if (!user || error) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const templateId = parseInt(id)
    const body = await request.json()
    const { isActive } = body

    // Cek apakah template exists
    const existingTemplate = await prisma.templateUjian.findUnique({
      where: { id: templateId }
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template tidak ditemukan' },
        { status: 404 }
      )
    }

    const template = await prisma.templateUjian.update({
      where: { id: templateId },
      data: { status: isActive ? 'aktif' : 'nonaktif' },
      include: {
        komponenPenilaian: {
          orderBy: { urutan: 'asc' }
        },
        creator: {
          select: { namaLengkap: true }
        },
        _count: {
          select: { ujianSantri: true }
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