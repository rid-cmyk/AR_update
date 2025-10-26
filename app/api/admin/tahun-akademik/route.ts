import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, withAuth } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request)
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized')
    }

    console.log('✅ Tahun Akademik GET - User authenticated:', user.namaLengkap)
    
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      const tahunAjaran = await prisma.tahunAjaran.findMany({
        orderBy: [
          { tahunMulai: 'desc' },
          { semester: 'asc' }
        ]
      })

      // Transform data untuk kompatibilitas dengan FormTemplateUjian
      const transformedData = tahunAjaran.map(ta => ({
        id: ta.id.toString(),
        nama: ta.namaLengkap,
        tahunMulai: ta.tahunMulai,
        tahunSelesai: ta.tahunSelesai,
        semester: ta.semester,
        isActive: ta.isActive || false
      }))

      return NextResponse.json(transformedData)
    } finally {
      await prisma.$disconnect()
    }
  } catch (error) {
    console.error('Error fetching tahun ajaran:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request)
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized')
    }

    console.log('✅ Tahun Akademik POST - User authenticated:', user.namaLengkap)

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
      // Cek duplikasi
      const existing = await prisma.tahunAjaran.findFirst({
      where: {
        tahunMulai,
        tahunSelesai,
        semester
      }
    })

      if (existing) {
        return NextResponse.json({ error: 'Tahun akademik dan semester ini sudah ada' }, { status: 400 })
      }

      // Buat nama lengkap
      const namaLengkap = `${tahunMulai}/${tahunSelesai} Semester ${semester === 'S1' ? '1' : '2'}`

      const tahunAjaran = await prisma.tahunAjaran.create({
        data: {
          tahunMulai,
          tahunSelesai,
          semester,
          namaLengkap,
          tanggalMulai: new Date(tanggalMulai),
          tanggalSelesai: new Date(tanggalSelesai),
          createdBy: user.id
        }
      })

      console.log('✅ Tahun akademik created:', namaLengkap)
      return NextResponse.json(tahunAjaran, { status: 201 })
    } finally {
      await prisma.$disconnect()
    }
  } catch (error) {
    console.error('Error creating tahun ajaran:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}