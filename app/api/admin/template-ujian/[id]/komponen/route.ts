import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(
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

    const komponen = await prisma.komponenPenilaian.create({
      data: {
        namaKomponen,
        bobotNilai,
        nilaiMaksimal,
        deskripsi,
        urutan: urutan || 1,
        templateUjianId: templateId
      }
    })

    return NextResponse.json(komponen, { status: 201 })
  } catch (error) {
    console.error('Error creating komponen penilaian:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}