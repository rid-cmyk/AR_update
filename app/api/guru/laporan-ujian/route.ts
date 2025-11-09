import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const periode = searchParams.get('periode') // 'bulan-ini', 'semester-ini', 'tahun-ini'
    const jenisUjian = searchParams.get('jenisUjian') // 'tasmi', 'tahfidz', 'mhq'
    const halaqah = searchParams.get('halaqah')
    const format = searchParams.get('format') // 'summary', 'detail', 'export'

    // Calculate date range based on periode
    const now = new Date()
    let startDate: Date
    let endDate = now

    switch (periode) {
      case 'bulan-ini':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'semester-ini':
        // Assume semester starts in July or January
        const currentMonth = now.getMonth()
        const semesterStart = currentMonth >= 6 ? 6 : 0 // July or January
        startDate = new Date(now.getFullYear(), semesterStart, 1)
        break
      case 'tahun-ini':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        // Default to current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    // Build query filters
    const whereClause: any = {
      tanggalUjian: {
        gte: startDate,
        lte: endDate
      }
    }

    if (jenisUjian) {
      whereClause.templateUjian = {
        jenisUjian: jenisUjian
      }
    }

    // Note: halaqah filter disabled for now due to schema limitations
    // if (halaqah) {
    //   whereClause.santri = {
    //     halaqah: {
    //       namaHalaqah: halaqah
    //     }
    //   }
    // }

    // Get ujian data
    const ujianData = await prisma.ujianSantri.findMany({
      where: whereClause,
      include: {
        santri: {
          include: { role: true,
            halaqah: {
              include: {
                guru: true
              }
            }
          }
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
      }
    })

    // Process data based on format
    if (format === 'summary') {
      return generateSummaryReport(ujianData, periode, jenisUjian, halaqah)
    } else if (format === 'detail') {
      return generateDetailReport(ujianData, periode, jenisUjian, halaqah)
    } else if (format === 'export') {
      return generateExportData(ujianData, periode, jenisUjian, halaqah)
    }

    // Default: return processed data
    const processedData = ujianData.map(ujian => ({
      id: ujian.id,
      santriId: ujian.santriId,
      santriNama: ujian.santri.namaLengkap,
      halaqah: ujian.santri.halaqah?.namaHalaqah || 'Tidak ada halaqah',
      jenisUjian: ujian.templateUjian.jenisUjian,
      nilaiAkhir: ujian.nilaiAkhir || 0,
      tanggalUjian: ujian.tanggalUjian.toISOString(),
      statusUjian: ujian.statusUjian,
      juzRange: ujian.juzDari && ujian.juzSampai ? {
        dari: ujian.juzDari,
        sampai: ujian.juzSampai
      } : null,
      catatanGuru: ujian.catatanGuru,
      komponenNilai: ujian.nilaiUjian.map(nilai => ({
        komponen: nilai.komponenPenilaian?.namaKomponen || 'Unknown',
        nilai: nilai.nilaiRaw,
        bobot: nilai.komponenPenilaian?.bobotNilai || 0,
        catatan: nilai.catatan
      }))
    }))

    return NextResponse.json({
      success: true,
      data: processedData,
      metadata: {
        periode,
        jenisUjian,
        halaqah,
        totalUjian: processedData.length,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      },
      message: 'Laporan ujian berhasil diambil'
    })

  } catch (error) {
    console.error('Error generating laporan ujian:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Gagal mengambil laporan ujian',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Generate summary report
async function generateSummaryReport(ujianData: any[], periode: string | null, jenisUjian: string | null, halaqah: string | null) {
  const totalUjian = ujianData.length
  const nilaiRataRata = ujianData.length > 0 
    ? ujianData.reduce((sum, ujian) => sum + (ujian.nilaiAkhir || 0), 0) / ujianData.length 
    : 0

  // Group by jenis ujian
  const byJenisUjian = ujianData.reduce((acc, ujian) => {
    const jenis = ujian.templateUjian.jenisUjian
    if (!acc[jenis]) {
      acc[jenis] = { count: 0, totalNilai: 0, rataRata: 0 }
    }
    acc[jenis].count++
    acc[jenis].totalNilai += ujian.nilaiAkhir || 0
    acc[jenis].rataRata = acc[jenis].totalNilai / acc[jenis].count
    return acc
  }, {} as Record<string, any>)

  // Group by halaqah
  const byHalaqah = ujianData.reduce((acc, ujian) => {
    const halaqahName = ujian.santri.halaqah?.namaHalaqah || 'Tidak ada halaqah'
    if (!acc[halaqahName]) {
      acc[halaqahName] = { count: 0, totalNilai: 0, rataRata: 0, santriCount: new Set() }
    }
    acc[halaqahName].count++
    acc[halaqahName].totalNilai += ujian.nilaiAkhir || 0
    acc[halaqahName].santriCount.add(ujian.santriId)
    acc[halaqahName].rataRata = acc[halaqahName].totalNilai / acc[halaqahName].count
    return acc
  }, {} as Record<string, any>)

  // Convert santriCount Set to number
  Object.keys(byHalaqah).forEach(key => {
    byHalaqah[key].santriCount = byHalaqah[key].santriCount.size
  })

  // Performance categories
  const performanceCategories = {
    excellent: ujianData.filter(u => (u.nilaiAkhir || 0) >= 90).length,
    good: ujianData.filter(u => (u.nilaiAkhir || 0) >= 80 && (u.nilaiAkhir || 0) < 90).length,
    average: ujianData.filter(u => (u.nilaiAkhir || 0) >= 70 && (u.nilaiAkhir || 0) < 80).length,
    needsImprovement: ujianData.filter(u => (u.nilaiAkhir || 0) < 70).length
  }

  return NextResponse.json({
    success: true,
    data: {
      summary: {
        totalUjian,
        nilaiRataRata: Math.round(nilaiRataRata * 100) / 100,
        periode: periode || 'bulan-ini',
        jenisUjian: jenisUjian || 'semua',
        halaqah: halaqah || 'semua'
      },
      byJenisUjian,
      byHalaqah,
      performanceCategories,
      trends: {
        // TODO: Add trend analysis
        weeklyAverage: [],
        monthlyProgress: []
      }
    },
    message: 'Summary laporan ujian berhasil diambil'
  })
}

// Generate detail report
async function generateDetailReport(ujianData: any[], periode: string | null, jenisUjian: string | null, halaqah: string | null) {
  const detailData = ujianData.map(ujian => ({
    id: ujian.id,
    tanggalUjian: ujian.tanggalUjian.toISOString(),
    santri: {
      id: ujian.santriId,
      nama: ujian.santri.namaLengkap,
      username: ujian.santri.username,
      halaqah: ujian.santri.halaqah?.namaHalaqah || 'Tidak ada halaqah'
    },
    ujian: {
      jenis: ujian.templateUjian.jenisUjian,
      template: ujian.templateUjian.namaTemplate,
      juzRange: ujian.juzDari && ujian.juzSampai ? {
        dari: ujian.juzDari,
        sampai: ujian.juzSampai
      } : null,
      nilaiAkhir: ujian.nilaiAkhir || 0,
      status: ujian.statusUjian
    },
    komponenNilai: ujian.nilaiUjian.map((nilai: any) => ({
      komponen: nilai.komponenPenilaian?.namaKomponen || 'Unknown',
      nilaiRaw: nilai.nilaiRaw,
      nilaiTerbobot: nilai.nilaiTerbobot,
      bobot: nilai.komponenPenilaian?.bobotNilai || 0,
      maksimal: nilai.komponenPenilaian?.nilaiMaksimal || 100,
      catatan: nilai.catatan
    })),
    catatan: ujian.catatanGuru,
    tahunAjaran: ujian.tahunAjaran?.tahunAjaran || 'Unknown'
  }))

  return NextResponse.json({
    success: true,
    data: detailData,
    metadata: {
      totalRecords: detailData.length,
      periode: periode || 'bulan-ini',
      jenisUjian: jenisUjian || 'semua',
      halaqah: halaqah || 'semua'
    },
    message: 'Detail laporan ujian berhasil diambil'
  })
}

// Generate export data
async function generateExportData(ujianData: any[], periode: string | null, jenisUjian: string | null, halaqah: string | null) {
  const exportData = ujianData.map(ujian => ({
    'Tanggal Ujian': ujian.tanggalUjian.toLocaleDateString('id-ID'),
    'Nama Santri': ujian.santri.namaLengkap,
    'Username': ujian.santri.username,
    'Halaqah': ujian.santri.halaqah?.namaHalaqah || 'Tidak ada halaqah',
    'Jenis Ujian': ujian.templateUjian.jenisUjian,
    'Template': ujian.templateUjian.namaTemplate,
    'Juz Dari': ujian.juzDari || '-',
    'Juz Sampai': ujian.juzSampai || '-',
    'Nilai Akhir': ujian.nilaiAkhir || 0,
    'Status': ujian.statusUjian,
    'Catatan Guru': ujian.catatanGuru || '-',
    'Tahun Ajaran': ujian.tahunAjaran?.tahunAjaran || 'Unknown'
  }))

  return NextResponse.json({
    success: true,
    data: exportData,
    metadata: {
      format: 'export',
      totalRecords: exportData.length,
      periode: periode || 'bulan-ini',
      jenisUjian: jenisUjian || 'semua',
      halaqah: halaqah || 'semua',
      exportDate: new Date().toISOString()
    },
    message: 'Data export laporan ujian berhasil diambil'
  })
}