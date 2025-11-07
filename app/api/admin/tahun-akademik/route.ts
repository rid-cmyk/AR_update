import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, withAuth } from '@/lib/api-helpers'
import { prisma } from '@/lib/database/prisma'
import { getCurrentTahunAkademik } from '@/lib/tahun-akademik-utils'
import { getActiveTahunAkademik } from '@/lib/tahun-akademik-middleware'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request)
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized')
    }

    console.log('✅ Tahun Akademik GET - User authenticated:', user.namaLengkap)
    
    try {
      // Get all tahun ajaran with counts
      const tahunAjaran = await prisma.tahunAjaran.findMany({
        include: {
          creator: {
            select: {
              id: true,
              namaLengkap: true,
              username: true
            }
          },
          _count: {
            select: {
              templateUjian: true,
              templateRaport: true,
              ujianSantri: true,
              raportSantri: true
            }
          }
        },
        orderBy: [
          { tahunMulai: 'desc' },
          { semester: 'asc' }
        ]
      })

      // Get current academic year info
      const currentTahunAkademik = getCurrentTahunAkademik()
      const activeTahunAkademik = await getActiveTahunAkademik()

      return NextResponse.json({
        success: true,
        data: tahunAjaran,
        meta: {
          total: tahunAjaran.length,
          active: tahunAjaran.find(ta => ta.isActive),
          current: currentTahunAkademik,
          activeContext: activeTahunAkademik
        }
      })
    } catch (error) {
      console.error('Error fetching tahun ajaran:', error)
      return NextResponse.json({ 
        success: false,
        error: 'Gagal mengambil data tahun akademik',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in tahun akademik GET:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['admin', 'super_admin'])
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized')
    }

    console.log('✅ Tahun Akademik POST - User authenticated:', user.namaLengkap)

    const body = await request.json()
    const { tahunMulai, tahunSelesai, semester, tanggalMulai, tanggalSelesai, namaLengkap, isActive } = body

    // Validasi input
    if (!tahunMulai || !tahunSelesai || !semester || !tanggalMulai || !tanggalSelesai) {
      return NextResponse.json({ 
        success: false,
        error: 'Semua field harus diisi' 
      }, { status: 400 })
    }

    if (tahunSelesai <= tahunMulai) {
      return NextResponse.json({ 
        success: false,
        error: 'Tahun selesai harus lebih besar dari tahun mulai' 
      }, { status: 400 })
    }

    if (!['S1', 'S2'].includes(semester)) {
      return NextResponse.json({ 
        success: false,
        error: 'Semester harus S1 atau S2' 
      }, { status: 400 })
    }
    
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
        return NextResponse.json({ 
          success: false,
          error: 'Tahun akademik dengan periode dan semester yang sama sudah ada' 
        }, { status: 400 })
      }

      // Jika akan diset aktif, nonaktifkan yang lain
      if (isActive) {
        await prisma.tahunAjaran.updateMany({
          where: { isActive: true },
          data: { isActive: false }
        })
      }

      // Generate nama lengkap jika tidak ada
      const finalNamaLengkap = namaLengkap || `${tahunMulai}/${tahunSelesai} Semester ${semester === 'S1' ? '1' : '2'}`

      // Buat tahun akademik baru
      const newTahunAjaran = await prisma.tahunAjaran.create({
        data: {
          tahunMulai,
          tahunSelesai,
          semester,
          namaLengkap: finalNamaLengkap,
          tanggalMulai: new Date(tanggalMulai),
          tanggalSelesai: new Date(tanggalSelesai),
          isActive: isActive || false,
          createdBy: user.id
        },
        include: {
          creator: {
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
        message: `Tahun akademik ${finalNamaLengkap} berhasil dibuat`,
        data: newTahunAjaran
      })

    } catch (error) {
      console.error('Error creating tahun ajaran:', error)
      return NextResponse.json({ 
        success: false,
        error: 'Gagal membuat tahun akademik',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in tahun akademik POST:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error' 
    }, { status: 500 })
  }
}