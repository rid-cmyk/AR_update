import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; komponenId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, komponenId: komponenIdStr } = await params
    const templateId = parseInt(id)
    const komponenId = parseInt(komponenIdStr)
    const body = await request.json()
    const { namaKomponen, bobotNilai, nilaiMaksimal, deskripsi, urutan } = body

    // Validasi input
    if (!namaKomponen || bobotNilai === undefined || !nilaiMaksimal) {
      return NextResponse.json(
        { error: 'Nama komponen, bobot nilai, dan nilai maksimal wajib diisi' },
        { status: 400 }
      )
    }

    if (bobotNilai < 0 || bobotNilai > 100) {
      return NextResponse.json(
        { error: 'Bobot nilai harus antara 0-100' },
        { status: 400 }
      )
    }

    // Cek apakah komponen exists dan milik template yang benar
    const existingKomponen = await prisma.komponenPenilaian.findFirst({
      where: {
        id: komponenId,
        templateUjianId: templateId
      }
    })

    if (!existingKomponen) {
      return NextResponse.json(
        { error: 'Komponen tidak ditemukan' },
        { status: 404 }
      )
    }

    const komponen = await prisma.komponenPenilaian.update({
      where: { id: komponenId },
      data: {
        namaKomponen,
        bobotNilai,
        nilaiMaksimal,
        deskripsi,
        urutan: urutan || existingKomponen.urutan
      }
    })

    return NextResponse.json(komponen)
  } catch (error) {
    console.error('Error updating komponen penilaian:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; komponenId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, komponenId: komponenIdStr } = await params
    const templateId = parseInt(id)
    const komponenId = parseInt(komponenIdStr)

    // Cek apakah komponen exists dan milik template yang benar
    const existingKomponen = await prisma.komponenPenilaian.findFirst({
      where: {
        id: komponenId,
        templateUjianId: templateId
      },
      include: {
        _count: {
          select: { nilaiUjian: true }
        }
      }
    })

    if (!existingKomponen) {
      return NextResponse.json(
        { error: 'Komponen tidak ditemukan' },
        { status: 404 }
      )
    }

    // Cek apakah komponen sudah digunakan dalam ujian
    if (existingKomponen._count.nilaiUjian > 0) {
      return NextResponse.json(
        { error: 'Komponen tidak dapat dihapus karena sudah digunakan dalam ujian' },
        { status: 400 }
      )
    }

    await prisma.komponenPenilaian.delete({
      where: { id: komponenId }
    })

    return NextResponse.json({ message: 'Komponen berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting komponen penilaian:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}