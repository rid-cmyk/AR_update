import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, withAuth } from '@/lib/api-helpers'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request)
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized')
    }

    const { id } = await params
    const ujianId = parseInt(id)
    if (isNaN(ujianId)) {
      return NextResponse.json({ error: 'ID ujian tidak valid' }, { status: 400 })
    }

    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    // Cek apakah ujian ada dan milik guru yang login
    const ujian = await prisma.ujianGuru.findFirst({
      where: {
        id: ujianId,
        guruId: user.id
      }
    })

    if (!ujian) {
      return NextResponse.json({ error: 'Ujian tidak ditemukan' }, { status: 404 })
    }

    // Hapus ujian
    await prisma.ujianGuru.delete({
      where: { id: ujianId }
    })

    return NextResponse.json({ message: 'Ujian berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting ujian:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request)
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized')
    }

    const { id } = await params
    const ujianId = parseInt(id)
    if (isNaN(ujianId)) {
      return NextResponse.json({ error: 'ID ujian tidak valid' }, { status: 400 })
    }

    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    const ujian = await prisma.ujianGuru.findFirst({
      where: {
        id: ujianId,
        guruId: user.id
      },
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true,
            HalaqahSantri: {
              include: {
                halaqah: {
                  select: {
                    namaHalaqah: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!ujian) {
      return NextResponse.json({ error: 'Ujian tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json(ujian)
  } catch (error) {
    console.error('Error fetching ujian:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}