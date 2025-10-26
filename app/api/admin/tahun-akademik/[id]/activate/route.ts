import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, withAuth } from '@/lib/api-helpers'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request)
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized')
    }

    console.log('✅ Activate Tahun Akademik - User authenticated:', user.namaLengkap)

    const { id } = await params
    const tahunId = parseInt(id)

    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    try {
      // Cek apakah tahun akademik exists
      const existingTahun = await prisma.tahunAjaran.findUnique({
        where: { id: tahunId }
      })

      if (!existingTahun) {
        return NextResponse.json(
          { error: 'Tahun akademik tidak ditemukan' },
          { status: 404 }
        )
      }

      if (existingTahun.isActive) {
        return NextResponse.json(
          { error: 'Tahun akademik sudah aktif' },
          { status: 400 }
        )
      }

      // Nonaktifkan semua tahun akademik yang aktif
      await prisma.tahunAjaran.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      })

      // Aktifkan tahun akademik yang dipilih
      const updatedTahunAjaran = await prisma.tahunAjaran.update({
        where: { id: tahunId },
        data: { isActive: true },
        include: {
          creator: {
            select: { namaLengkap: true }
          }
        }
      })

      console.log('✅ Tahun akademik activated:', existingTahun.namaLengkap)
      return NextResponse.json(updatedTahunAjaran)
    } finally {
      await prisma.$disconnect()
    }
  } catch (error) {
    console.error('Error activating tahun akademik:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}