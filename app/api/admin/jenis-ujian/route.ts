import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, withAuth } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request)
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized')
    }

    console.log('✅ Jenis Ujian - User authenticated:', user.namaLengkap)
    
    // Import prisma untuk ambil dari database
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    try {
      // Get all jenis ujian with their komponen penilaian
      const jenisUjianList = await prisma.jenisUjian.findMany({
        include: {
          komponenPenilaian: {
            orderBy: { urutan: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      
      console.log('📋 Jenis ujian found:', jenisUjianList.length)
      
      return NextResponse.json({
        success: true,
        data: jenisUjianList,
        message: `${jenisUjianList.length} jenis ujian ditemukan`
      })
    } finally {
      await prisma.$disconnect()
    }
  } catch (error) {
    console.error('Error fetching jenis ujian:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request)
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized')
    }

    const body = await request.json()
    const { nama, kode, deskripsi, komponenPenilaian } = body

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
      // Cek duplikasi kode
      const existing = await prisma.jenisUjian.findUnique({
        where: { kode }
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Kode jenis ujian sudah digunakan' },
          { status: 400 }
        )
      }

      // Buat jenis ujian dengan komponen penilaian
      const jenisUjian = await prisma.jenisUjian.create({
        data: {
          nama,
          kode,
          deskripsi: deskripsi || '',
          createdBy: user.id,
          komponenPenilaian: {
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

      console.log('✅ Jenis ujian created:', jenisUjian.nama)

      return NextResponse.json({
        success: true,
        data: jenisUjian,
        message: 'Jenis ujian berhasil dibuat'
      }, { status: 201 })
    } finally {
      await prisma.$disconnect()
    }
  } catch (error) {
    console.error('Error creating jenis ujian:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}