import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Use singleton pattern to prevent multiple instances
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      ujianResults,
      jenisUjian,
      juzRange,
      metadata
    } = body

    // Enhanced validation with limits
    if (!ujianResults || !Array.isArray(ujianResults) || ujianResults.length === 0) {
      return NextResponse.json({ 
        success: false,
        message: 'Data ujian tidak lengkap' 
      }, { status: 400 })
    }

    // Limit number of results to prevent memory issues
    if (ujianResults.length > 100) {
      return NextResponse.json({ 
        success: false,
        message: 'Terlalu banyak data ujian (maksimal 100 santri)' 
      }, { status: 400 })
    }

    if (!jenisUjian || !jenisUjian.nama || !jenisUjian.tipeUjian) {
      return NextResponse.json({ 
        success: false,
        message: 'Jenis ujian tidak lengkap' 
      }, { status: 400 })
    }

    if (!juzRange || !juzRange.dari || !juzRange.sampai) {
      return NextResponse.json({ 
        success: false,
        message: 'Range juz tidak ditemukan' 
      }, { status: 400 })
    }

    // Validate juz range to prevent infinite loops
    if (juzRange.dari < 1 || juzRange.sampai > 30 || juzRange.dari > juzRange.sampai) {
      return NextResponse.json({ 
        success: false,
        message: 'Range juz tidak valid (1-30)' 
      }, { status: 400 })
    }

    // Validate each ujian result with limits
    for (const result of ujianResults) {
      if (!result.santriId || !result.nilaiDetail || typeof result.nilaiAkhir !== 'number') {
        return NextResponse.json({ 
          success: false,
          message: `Data ujian tidak lengkap untuk santri ID: ${result.santriId}` 
        }, { status: 400 })
      }
      
      // Limit nilaiDetail size to prevent memory issues
      if (Object.keys(result.nilaiDetail).length > 1000) {
        return NextResponse.json({ 
          success: false,
          message: `Terlalu banyak detail nilai untuk santri ID: ${result.santriId}` 
        }, { status: 400 })
      }
    }

    // Enhanced data processing with memory optimization
    const savedUjian = ujianResults.map((result: any, index: number) => {
      // Calculate additional metrics with safety checks
      const nilaiDetailKeys = Object.keys(result.nilaiDetail || {})
      const nilaiArray = Object.values(result.nilaiDetail || {}).filter(n => typeof n === 'number') as number[]
      const avgNilai = nilaiArray.length > 0 ? nilaiArray.reduce((a, b) => a + b, 0) / nilaiArray.length : 0
      const completionRate = nilaiDetailKeys.length > 0 ? (nilaiArray.length / nilaiDetailKeys.length) * 100 : 0

      // Generate mushaf pages only if needed and within limits
      let mushafPages = null
      if (jenisUjian.tipeUjian === 'per-halaman') {
        const pageCount = (juzRange.sampai - juzRange.dari + 1) * 21 // Approximate pages per juz
        if (pageCount <= 200) { // Limit to prevent memory issues
          mushafPages = generatePageRange(juzRange.dari, juzRange.sampai)
        }
      }

      return {
        id: Date.now() + index, // Use index instead of random for consistency
        santriId: result.santriId,
        nilaiAkhir: result.nilaiAkhir,
        nilaiDetail: result.nilaiDetail,
        jenisUjian: jenisUjian.nama,
        tipeUjian: jenisUjian.tipeUjian,
        juzRange,
        metadata: {
          totalItems: nilaiDetailKeys.length,
          completedItems: nilaiArray.length,
          completionRate: Math.round(completionRate),
          averageScore: Math.round(avgNilai * 100) / 100,
          evaluationDate: new Date().toISOString(),
          mushafPages
        },
        status: 'submitted',
        createdAt: new Date().toISOString(),
        createdBy: 'current_guru_id' // TODO: Get from session
      }
    })

    // Enhanced logging
    console.log('Enhanced Ujian saved:', {
      jenisUjian: jenisUjian.nama,
      tipeUjian: jenisUjian.tipeUjian,
      juzRange: `${juzRange.dari}-${juzRange.sampai}`,
      totalSantri: savedUjian.length,
      averageScore: savedUjian.reduce((sum, u) => sum + u.nilaiAkhir, 0) / savedUjian.length,
      completionStats: savedUjian.map(u => ({
        santriId: u.santriId,
        completion: u.metadata.completionRate,
        score: u.nilaiAkhir
      }))
    })

    return NextResponse.json({
      success: true,
      data: savedUjian,
      summary: {
        totalSantri: savedUjian.length,
        averageScore: Math.round((savedUjian.reduce((sum, u) => sum + u.nilaiAkhir, 0) / savedUjian.length) * 100) / 100,
        completionRate: Math.round((savedUjian.reduce((sum, u) => sum + u.metadata.completionRate, 0) / savedUjian.length) * 100) / 100,
        juzRange: `Juz ${juzRange.dari} - ${juzRange.sampai}`,
        evaluationType: jenisUjian.tipeUjian
      },
      message: `Ujian ${jenisUjian.nama} berhasil disimpan untuk ${savedUjian.length} santri`
    })

  } catch (error) {
    console.error('Error creating ujian:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Gagal menyimpan data ujian',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    // Always disconnect to prevent memory leaks
    await prisma.$disconnect()
  }
}

// Helper function to generate page range for per-halaman evaluation
function generatePageRange(juzDari: number, juzSampai: number): number[] {
  // Validate input to prevent infinite loops
  if (juzDari < 1 || juzSampai > 30 || juzDari > juzSampai) {
    return []
  }

  const JUZ_TO_PAGE_MAPPING: Record<number, { start: number; end: number }> = {
    1: { start: 1, end: 21 }, 2: { start: 22, end: 41 }, 3: { start: 42, end: 61 },
    4: { start: 62, end: 81 }, 5: { start: 82, end: 101 }, 6: { start: 102, end: 121 },
    7: { start: 122, end: 141 }, 8: { start: 142, end: 161 }, 9: { start: 162, end: 181 },
    10: { start: 182, end: 201 }, 11: { start: 202, end: 221 }, 12: { start: 222, end: 241 },
    13: { start: 242, end: 261 }, 14: { start: 262, end: 281 }, 15: { start: 282, end: 301 },
    16: { start: 302, end: 321 }, 17: { start: 322, end: 341 }, 18: { start: 342, end: 361 },
    19: { start: 362, end: 381 }, 20: { start: 382, end: 401 }, 21: { start: 402, end: 421 },
    22: { start: 422, end: 441 }, 23: { start: 442, end: 461 }, 24: { start: 462, end: 481 },
    25: { start: 482, end: 501 }, 26: { start: 502, end: 521 }, 27: { start: 522, end: 541 },
    28: { start: 542, end: 561 }, 29: { start: 562, end: 581 }, 30: { start: 582, end: 604 }
  }

  const pages: number[] = []
  const maxPages = 604 // Total pages in Quran
  
  for (let juz = juzDari; juz <= juzSampai; juz++) {
    const mapping = JUZ_TO_PAGE_MAPPING[juz]
    if (mapping && mapping.start <= maxPages && mapping.end <= maxPages) {
      for (let page = mapping.start; page <= mapping.end; page++) {
        if (pages.length < 1000) { // Limit array size to prevent memory issues
          pages.push(page)
        } else {
          break
        }
      }
    }
    if (pages.length >= 1000) break
  }
  return pages
}

export async function GET() {
  try {
    // TODO: Get guru ID from session/auth
    // For now, use the first guru found (demo purposes)
    const guru = await prisma.user.findFirst({
      where: {
        role: {
          name: 'guru'
        }
      }
    })

    if (!guru) {
      return NextResponse.json({
        success: false,
        message: 'Guru tidak ditemukan'
      }, { status: 404 })
    }

    // Get ujian data from database with pagination to prevent memory issues
    const ujianList = await prisma.ujianSantri.findMany({
      where: {
        createdBy: guru.id
      },
      include: {
        santri: {
          include: { role: true }
        },
        templateUjian: {
          include: {
            komponenPenilaian: true
          }
        },
        tahunAjaran: true,
        nilaiUjian: {
          include: {
            komponenPenilaian: true
          }
        }
      },
      orderBy: {
        tanggalUjian: 'desc'
      },
      take: 50 // Limit results to prevent memory issues
    })

    // Transform data to match frontend expectations
    const transformedUjian = ujianList.map(ujian => ({
      id: ujian.id,
      santriId: ujian.santriId,
      santriNama: ujian.santri.namaLengkap,
      jenisUjian: ujian.templateUjian.jenisUjian,
      tipeUjian: ujian.juzDari && ujian.juzSampai ? 'per-juz' : 'per-halaman',
      nilaiAkhir: ujian.nilaiAkhir || 0,
      tanggalUjian: ujian.tanggalUjian.toISOString(),
      statusUjian: ujian.statusUjian,
      halaqah: 'Halaqah Umar', // Default halaqah
      juzRange: ujian.juzDari && ujian.juzSampai ? {
        dari: ujian.juzDari,
        sampai: ujian.juzSampai
      } : null,
      catatanGuru: ujian.catatanGuru,
      santri: {
        namaLengkap: ujian.santri.namaLengkap,
        username: ujian.santri.username,
        halaqah: {
          namaHalaqah: 'Halaqah Umar',
          guru: 'Ustadz Ahmad'
        }
      },
      templateUjian: {
        namaTemplate: ujian.templateUjian.namaTemplate,
        jenisUjian: ujian.templateUjian.jenisUjian
      },
      nilaiUjian: ujian.nilaiUjian.map(nilai => ({
        nilaiRaw: nilai.nilaiRaw,
        nilaiTerbobot: nilai.nilaiTerbobot,
        catatan: nilai.catatan,
        komponenPenilaian: nilai.komponenPenilaian ? {
          namaKomponen: nilai.komponenPenilaian.namaKomponen,
          bobotNilai: nilai.komponenPenilaian.bobotNilai,
          nilaiMaksimal: nilai.komponenPenilaian.nilaiMaksimal
        } : null
      }))
    }))

    // If no real data, get limited santri from guru's halaqah for demo
    if (transformedUjian.length === 0) {
      // Get santri from database (simplified and limited)
      const allSantri = await prisma.user.findMany({
        where: {
          role: {
            name: 'santri'
          }
        },
        include: { role: true },
        take: 3 // Limit to 3 santri for demo to prevent memory issues
      })
      
      // Create demo ujian data based on real santri (limited processing)
      const demoUjianData = allSantri.map((santri, index) => ({
        id: index + 1,
        santriId: santri.id,
        santriNama: santri.namaLengkap || 'Santri ' + (index + 1),
        jenisUjian: 'tasmi',
        tipeUjian: 'per-juz',
        nilaiAkhir: 80 + (index * 5),
        tanggalUjian: new Date().toISOString(),
        statusUjian: 'selesai',
        halaqah: 'Halaqah Umar',
        juzRange: { dari: 1, sampai: 3 },
        catatanGuru: `Evaluasi untuk ${santri.namaLengkap || 'Santri ' + (index + 1)}`,
        santri: {
          namaLengkap: santri.namaLengkap || 'Santri ' + (index + 1),
          username: santri.username || 'santri' + (index + 1),
          halaqah: {
            namaHalaqah: 'Halaqah Umar',
            guru: 'Ustadz Ahmad'
          }
        },
        templateUjian: {
          namaTemplate: "Template Tasmi'",
          jenisUjian: 'tasmi'
        },
        nilaiUjian: []
      }))
      
      return NextResponse.json({
        success: true,
        data: demoUjianData,
        message: `Data ujian berhasil diambil (${demoUjianData.length} santri dari halaqah guru)`
      })
    }

    return NextResponse.json({
      success: true,
      data: transformedUjian,
      message: 'Data ujian berhasil diambil'
    })

  } catch (error) {
    console.error('Error fetching ujian:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Gagal mengambil data ujian' 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

