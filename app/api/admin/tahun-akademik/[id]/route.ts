import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, withAuth } from '@/lib/api-helpers'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request)
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized')
    }

    console.log('✅ Update Tahun Akademik - User authenticated:', user.namaLengkap)

    const body = await request.json()
    const { tahunMulai, tahunSelesai, semester, tanggalMulai, tanggalSelesai } = body

    // Validasi input
    if (!tahunMulai || !tahunSelesai || !semester || !tanggalMulai || !tanggalSelesai) {
      return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 })
    }

    if (tahunSelesai <= tahunMulai) {
      return NextResponse.json({ error: 'Tahun selesai harus lebih besar dari tahun mulai' }, { status: 400 })
    }

    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    try {
      const { id } = await params
      
      // Cek duplikasi (kecuali record yang sedang diedit)
      const existing = await prisma.tahunAjaran.findFirst({
        where: {
          tahunMulai,
          tahunSelesai,
          semester,
          NOT: {
            id: parseInt(id)
          }
        }
      })

      if (existing) {
        return NextResponse.json({ error: 'Tahun akademik dan semester ini sudah ada' }, { status: 400 })
      }

      // Buat nama lengkap
      const namaLengkap = `${tahunMulai}/${tahunSelesai} Semester ${semester === 'S1' ? '1' : '2'}`

      const tahunAjaran = await prisma.tahunAjaran.update({
        where: { id: parseInt(id) },
        data: {
          tahunMulai,
          tahunSelesai,
          semester,
          namaLengkap,
          tanggalMulai: new Date(tanggalMulai),
          tanggalSelesai: new Date(tanggalSelesai)
        }
      })

      console.log('✅ Tahun akademik updated:', namaLengkap)
      return NextResponse.json(tahunAjaran)
    } finally {
      await prisma.$disconnect()
    }
  } catch (error) {
    console.error('Error updating tahun ajaran:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request)
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized')
    }

    console.log('✅ Delete Tahun Akademik - User authenticated:', user.namaLengkap)

    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    try {
      const { id } = await params
      
      // Cek apakah tahun ajaran sedang digunakan
      const templateCount = await prisma.templateUjian.count({
        where: { tahunAjaranId: parseInt(id) }
      })

      if (templateCount > 0) {
        return NextResponse.json(
          { error: 'Tahun akademik tidak dapat dihapus karena sedang digunakan dalam template ujian' },
          { status: 400 }
        )
      }

      const tahunAjaran = await prisma.tahunAjaran.findUnique({
        where: { id: parseInt(id) }
      })

      await prisma.tahunAjaran.delete({
        where: { id: parseInt(id) }
      })

      console.log('✅ Tahun akademik deleted:', tahunAjaran?.namaLengkap)
      return NextResponse.json({ message: 'Tahun akademik berhasil dihapus' })
    } finally {
      await prisma.$disconnect()
    }
  } catch (error) {
    console.error('Error deleting tahun ajaran:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}