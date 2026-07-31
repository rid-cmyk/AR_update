import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/database/prisma'
import { getAuthUser } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: authUser } = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    if (authUser.role.name !== 'guru' && authUser.role.name !== 'super-admin' && authUser.role.name !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const ujianId = parseInt(id)

    const existing = await prisma.ujianGuru.findUnique({
      where: { id: ujianId },
      select: { guruId: true }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Ujian tidak ditemukan' }, { status: 404 })
    }

    if (authUser.role.name === 'guru' && existing.guruId !== authUser.id) {
      return NextResponse.json({ error: 'Forbidden - Bukan pemilik record ujian ini' }, { status: 403 })
    }

    const body = await request.json()
    const { tanggal, keterangan, nilai } = body

    // Update ujian with new data
    const ujian = await prisma.ujianGuru.update({
      where: { id: ujianId },
      data: {
        totalNilai: nilai || 0,
        tanggalUjian: tanggal ? new Date(tanggal) : undefined,
        keterangan
      },
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        },
        guru: {
          select: {
            id: true,
            namaLengkap: true
          }
        }
      }
    })

    return NextResponse.json(ujian)
  } catch (error) {
    console.error('Error updating ujian:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: authUser } = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    if (authUser.role.name !== 'guru' && authUser.role.name !== 'super-admin' && authUser.role.name !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const ujianId = parseInt(id)

    const existing = await prisma.ujianGuru.findUnique({
      where: { id: ujianId },
      select: { guruId: true }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Ujian tidak ditemukan' }, { status: 404 })
    }

    if (authUser.role.name === 'guru' && existing.guruId !== authUser.id) {
      return NextResponse.json({ error: 'Forbidden - Bukan pemilik record ujian ini' }, { status: 403 })
    }

    await prisma.ujianGuru.delete({
      where: { id: ujianId }
    })

    return NextResponse.json({ message: 'Ujian berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting ujian:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}