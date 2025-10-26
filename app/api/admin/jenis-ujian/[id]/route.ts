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

    const body = await request.json()
    const { nama, kode, deskripsi, komponenPenilaian } = body
    const { id } = await params
    const jenisUjianId = parseInt(id)

    // Validasi input
    if (!nama || !kode) {
      return NextResponse.json(
        { error: 'Nama dan kode jenis ujian wajib diisi' },
        { status: 400 }
      )
    }

    if (!komponenPenilaian || komponenPenilaian.length === 0) {
      return NextResponse.json(
        { error: 'Minimal harus ada satu komponen penilaian' },
        { status: 400 }
      )
    }

    // Validasi total bobot
    const totalBobot = komponenPenilaian.reduce((total: number, k: any) => total + (k.bobot || 0), 0)
    if (totalBobot !== 100) {
      return NextResponse.json(
        { error: 'Total bobot komponen penilaian harus 100%' },
        { status: 400 }
      )
    }

    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    try {
      // Cek apakah jenis ujian exists
      const existing = await prisma.jenisUjian.findUnique({
        where: { id: jenisUjianId }
      })

      if (!existing) {
        return NextResponse.json(
          { error: 'Jenis ujian tidak ditemukan' },
          { status: 404 }
        )
      }

      // Cek duplikasi kode (kecuali untuk record yang sedang diupdate)
      const duplicateKode = await prisma.jenisUjian.findFirst({
        where: {
          kode,
          id: { not: jenisUjianId }
        }
      })

      if (duplicateKode) {
        return NextResponse.json(
          { error: 'Kode jenis ujian sudah digunakan' },
          { status: 400 }
        )
      }

      // Update jenis ujian dengan komponen penilaian
      const jenisUjian = await prisma.jenisUjian.update({
        where: { id: jenisUjianId },
        data: {
          nama,
          kode,
          deskripsi: deskripsi || '',
          komponenPenilaian: {
            deleteMany: {}, // Hapus semua komponen lama
            create: komponenPenilaian.map((k: any, index: number) => ({
              nama: k.nama,
              bobot: k.bobot,
              deskripsi: k.deskripsi || '',
              urutan: k.urutan || index + 1,
              createdBy: user.id
            }))
          }
        },
        include: {
          komponenPenilaian: {
            orderBy: { urutan: 'asc' }
          }
        }
      })

      console.log('✅ Jenis ujian updated:', jenisUjian.nama)

      return NextResponse.json({
        success: true,
        data: jenisUjian,
        message: 'Jenis ujian berhasil diupdate'
      })
    } finally {
      await prisma.$disconnect()
    }
  } catch (error) {
    console.error('Error updating jenis ujian:', error)
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

    const { id } = await params
    const jenisUjianId = parseInt(id)

    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    try {
      // Cek apakah jenis ujian exists
      const existing = await prisma.jenisUjian.findUnique({
        where: { id: jenisUjianId }
      })

      if (!existing) {
        return NextResponse.json(
          { error: 'Jenis ujian tidak ditemukan' },
          { status: 404 }
        )
      }

      // Cek apakah jenis ujian sedang digunakan dalam template
      // Convert kode to enum value if it matches
      const enumValue = existing.kode.toLowerCase().replace(/\s+/g, '_') as any
      const templateCount = await prisma.templateUjian.count({
        where: { jenisUjian: enumValue }
      })

      if (templateCount > 0) {
        return NextResponse.json(
          { error: 'Jenis ujian tidak dapat dihapus karena sedang digunakan dalam template ujian' },
          { status: 400 }
        )
      }

      // Hapus jenis ujian (komponen penilaian akan terhapus otomatis karena cascade)
      await prisma.jenisUjian.delete({
        where: { id: jenisUjianId }
      })

      console.log('✅ Jenis ujian deleted:', existing.nama)

      return NextResponse.json({
        success: true,
        message: 'Jenis ujian berhasil dihapus'
      })
    } finally {
      await prisma.$disconnect()
    }
  } catch (error) {
    console.error('Error deleting jenis ujian:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}