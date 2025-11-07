import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { santriId, surat, ayatMulai, ayatSelesai, status, tanggal, keterangan } = body

    // Validation
    if (!santriId || !surat || !ayatMulai || !ayatSelesai || !status) {
      return NextResponse.json({
        success: false,
        error: 'Data tidak lengkap'
      }, { status: 400 })
    }

    // Update hafalan record
    const hafalan = await prisma.hafalan.update({
      where: {
        id: parseInt(id)
      },
      data: {
        santriId: parseInt(santriId),
        surat,
        ayatMulai: parseInt(ayatMulai),
        ayatSelesai: parseInt(ayatSelesai),
        status,
        tanggal: new Date(tanggal),
        keterangan
      },
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: hafalan,
      message: 'Hafalan berhasil diperbarui'
    })

  } catch (error) {
    console.error('Error updating hafalan:', error)
    return NextResponse.json({
      success: false,
      error: 'Gagal memperbarui hafalan'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Delete hafalan record
    await prisma.hafalan.delete({
      where: {
        id: parseInt(id)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Hafalan berhasil dihapus'
    })

  } catch (error) {
    console.error('Error deleting hafalan:', error)
    return NextResponse.json({
      success: false,
      error: 'Gagal menghapus hafalan'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}