import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const halaqahId = searchParams.get('halaqahId')
    const jenisUjian = searchParams.get('jenisUjian')
    const guruId = searchParams.get('guruId')

    // Build date filter
    const dateFilter = startDate && endDate ? {
      tanggalUjian: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } : {}

    // Build additional filters
    const additionalFilters: any = {}
    if (halaqahId) {
      additionalFilters.santri = {
        halaqahSantri: {
          some: {
            halaqahId: parseInt(halaqahId)
          }
        }
      }
    }
    if (jenisUjian) {
      additionalFilters.templateUjian = {
        jenisUjian: jenisUjian
      }
    }
    if (guruId) {
      additionalFilters.createdBy = guruId
    }

    // Get ujian data with comprehensive relations
    const ujianData = await prisma.ujianSantri.findMany({
      where: {
        ...dateFilter,
        ...additionalFilters
      },
      include: {
        santri: {
          include: {
            halaqahSantri: {
              include: {
                halaqah: {
                  include: {
                    guru: {
                      select: {
                        id: true,
                        namaLengkap: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        templateUjian: true,
        nilaiUjian: {
          include: {
            komponenPenilaian: true
          }
        },
        tahunAjaran: true
      },
      orderBy: {
        tanggalUjian: 'desc'
      }
    })

    // Calculate comprehensive analytics
    const analytics = calculateUjianAnalytics(ujianData)

    // Get trending data (last 30 days comparison)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const trendingData = await prisma.ujianSantri.findMany({
      where: {
        tanggalUjian: {
          gte: thirtyDaysAgo
        },
        ...additionalFilters
      },
      include: {
        santri: true,
        templateUjian: true
      }
    })

    const trendingAnalytics = calculateTrendingAnalytics(trendingData)

    return NextResponse.json({
      success: true,
      data: {
        summary: analytics.summary,
        byJenisUjian: analytics.byJenisUjian,
        byHalaqah: analytics.byHalaqah,
        byGuru: analytics.byGuru,
        performanceDistribution: analytics.performanceDistribution,
        monthlyTrend: analytics.monthlyTrend,
        topPerformers: analytics.topPerformers,
        needsAttention: analytics.needsAttention,
        trending: trendingAnalytics,
        rawData: ujianData.map(u => ({
          id: u.id,
          santri: u.santri.namaLengkap,
          jenisUjian: u.templateUjian.jenisUjian,
          nilaiAkhir: u.nilaiAkhir,
          tanggal: u.tanggalUjian,
          status: u.statusUjian,
          halaqah: u.santri.halaqahSantri[0]?.halaqah?.namaHalaqah || 'Unknown',
          guru: u.santri.halaqahSantri[0]?.halaqah?.guru?.namaLengkap || 'Unknown'
        }))
      },
      message: `Analytics berhasil digenerate untuk ${ujianData.length} ujian`
    })

  } catch (error) {
    console.error('Error generating ujian analytics:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Gagal generate analytics ujian',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

function calculateUjianAnalytics(ujianData: any[]) {
  const totalUjian = ujianData.length
  const totalSantri = new Set(ujianData.map(u => u.santriId)).size
  const averageScore = ujianData.length > 0 ? 
    ujianData.reduce((sum, u) => sum + (u.nilaiAkhir || 0), 0) / ujianData.length : 0

  // Group by jenis ujian
  const byJenisUjian = ujianData.reduce((acc, ujian) => {
    const jenis = ujian.templateUjian.jenisUjian
    if (!acc[jenis]) {
      acc[jenis] = {
        count: 0,
        totalScore: 0,
        averageScore: 0,
        santriCount: new Set()
      }
    }
    acc[jenis].count++
    acc[jenis].totalScore += ujian.nilaiAkhir || 0
    acc[jenis].santriCount.add(ujian.santriId)
    return acc
  }, {} as any)

  // Calculate averages for jenis ujian
  Object.keys(byJenisUjian).forEach(jenis => {
    byJenisUjian[jenis].averageScore = byJenisUjian[jenis].totalScore / byJenisUjian[jenis].count
    byJenisUjian[jenis].santriCount = byJenisUjian[jenis].santriCount.size
  })

  // Group by halaqah
  const byHalaqah = ujianData.reduce((acc, ujian) => {
    const halaqah = ujian.santri.halaqahSantri[0]?.halaqah?.namaHalaqah || 'Unknown'
    if (!acc[halaqah]) {
      acc[halaqah] = {
        count: 0,
        totalScore: 0,
        averageScore: 0,
        santriCount: new Set(),
        guru: ujian.santri.halaqahSantri[0]?.halaqah?.guru?.namaLengkap || 'Unknown'
      }
    }
    acc[halaqah].count++
    acc[halaqah].totalScore += ujian.nilaiAkhir || 0
    acc[halaqah].santriCount.add(ujian.santriId)
    return acc
  }, {} as any)

  // Calculate averages for halaqah
  Object.keys(byHalaqah).forEach(halaqah => {
    byHalaqah[halaqah].averageScore = byHalaqah[halaqah].totalScore / byHalaqah[halaqah].count
    byHalaqah[halaqah].santriCount = byHalaqah[halaqah].santriCount.size
  })

  // Performance distribution
  const performanceDistribution = {
    excellent: ujianData.filter(u => (u.nilaiAkhir || 0) >= 90).length,
    good: ujianData.filter(u => (u.nilaiAkhir || 0) >= 80 && (u.nilaiAkhir || 0) < 90).length,
    average: ujianData.filter(u => (u.nilaiAkhir || 0) >= 70 && (u.nilaiAkhir || 0) < 80).length,
    needsImprovement: ujianData.filter(u => (u.nilaiAkhir || 0) < 70).length
  }

  // Monthly trend (last 6 months)
  const monthlyTrend = generateMonthlyTrend(ujianData)

  // Top performers
  const santriScores = ujianData.reduce((acc, ujian) => {
    const santriId = ujian.santriId
    if (!acc[santriId]) {
      acc[santriId] = {
        santri: ujian.santri.namaLengkap,
        halaqah: ujian.santri.halaqahSantri[0]?.halaqah?.namaHalaqah || 'Unknown',
        scores: [],
        totalUjian: 0
      }
    }
    acc[santriId].scores.push(ujian.nilaiAkhir || 0)
    acc[santriId].totalUjian++
    return acc
  }, {} as any)

  const topPerformers = Object.values(santriScores)
    .map((s: any) => ({
      ...s,
      averageScore: s.scores.reduce((sum: number, score: number) => sum + score, 0) / s.scores.length
    }))
    .sort((a: any, b: any) => b.averageScore - a.averageScore)
    .slice(0, 10)

  const needsAttention = Object.values(santriScores)
    .map((s: any) => ({
      ...s,
      averageScore: s.scores.reduce((sum: number, score: number) => sum + score, 0) / s.scores.length
    }))
    .filter((s: any) => s.averageScore < 70)
    .sort((a: any, b: any) => a.averageScore - b.averageScore)
    .slice(0, 10)

  return {
    summary: {
      totalUjian,
      totalSantri,
      averageScore: Math.round(averageScore * 100) / 100,
      passRate: Math.round((ujianData.filter(u => (u.nilaiAkhir || 0) >= 70).length / totalUjian) * 100),
      excellenceRate: Math.round((ujianData.filter(u => (u.nilaiAkhir || 0) >= 90).length / totalUjian) * 100)
    },
    byJenisUjian,
    byHalaqah,
    byGuru: {}, // TODO: Implement if needed
    performanceDistribution,
    monthlyTrend,
    topPerformers,
    needsAttention
  }
}

function generateMonthlyTrend(ujianData: any[]) {
  const months = []
  const now = new Date()
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
    
    const monthData = ujianData.filter(u => {
      const ujianDate = new Date(u.tanggalUjian)
      return ujianDate.getMonth() === date.getMonth() && ujianDate.getFullYear() === date.getFullYear()
    })
    
    months.push({
      month: monthName,
      count: monthData.length,
      averageScore: monthData.length > 0 ? 
        Math.round((monthData.reduce((sum, u) => sum + (u.nilaiAkhir || 0), 0) / monthData.length) * 100) / 100 : 0
    })
  }
  
  return months
}

function calculateTrendingAnalytics(trendingData: any[]) {
  const last7Days = trendingData.filter(u => {
    const ujianDate = new Date(u.tanggalUjian)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return ujianDate >= sevenDaysAgo
  })

  const last30Days = trendingData

  return {
    last7Days: {
      count: last7Days.length,
      averageScore: last7Days.length > 0 ? 
        Math.round((last7Days.reduce((sum, u) => sum + (u.nilaiAkhir || 0), 0) / last7Days.length) * 100) / 100 : 0
    },
    last30Days: {
      count: last30Days.length,
      averageScore: last30Days.length > 0 ? 
        Math.round((last30Days.reduce((sum, u) => sum + (u.nilaiAkhir || 0), 0) / last30Days.length) * 100) / 100 : 0
    },
    growth: {
      ujianCount: last7Days.length > 0 && last30Days.length > 0 ? 
        Math.round(((last7Days.length * 4.3) / last30Days.length - 1) * 100) : 0,
      scoreImprovement: 0 // TODO: Calculate based on historical data
    }
  }
}