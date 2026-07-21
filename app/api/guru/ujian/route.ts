import { getAuthUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'

export async function POST(request: NextRequest) {
  const { user: authUser } = await getAuthUser(request);
  if (!authUser) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  
  try {
    const body = await request.json()
    const {
      ujianResults,
      jenisUjian,
      juzRange
    } = body

    if (!ujianResults || !Array.isArray(ujianResults) || ujianResults.length === 0) {
      return NextResponse.json({ 
        success: false,
        message: 'Data ujian tidak lengkap' 
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

    if (juzRange.dari < 1 || juzRange.sampai > 30 || juzRange.dari > juzRange.sampai) {
      return NextResponse.json({ 
        success: false,
        message: 'Range juz tidak valid (1-30)' 
      }, { status: 400 })
    }

    for (const result of ujianResults) {
      if (!result.santriId || !result.nilaiDetail || typeof result.nilaiAkhir !== 'number') {
        return NextResponse.json({ 
          success: false,
          message: `Data ujian tidak lengkap untuk santri ID: ${result.santriId}` 
        }, { status: 400 })
      }
    }

    const savedUjian = ujianResults.map((result: any, index: number) => {
      const nilaiDetailKeys = Object.keys(result.nilaiDetail || {})
      const nilaiArray = Object.values(result.nilaiDetail || {}).filter(n => typeof n === 'number') as number[]
      const avgNilai = nilaiArray.length > 0 ? nilaiArray.reduce((a, b) => a + b, 0) / nilaiArray.length : 0
      const completionRate = nilaiDetailKeys.length > 0 ? (nilaiArray.length / nilaiDetailKeys.length) * 100 : 0

      let mushafPages = null
      if (jenisUjian.tipeUjian === 'per-halaman') {
        const pageCount = (juzRange.sampai - juzRange.dari + 1) * 21
        if (pageCount <= 200) {
          mushafPages = generatePageRange(juzRange.dari, juzRange.sampai)
        }
      }

      return {
        id: Date.now() + index,
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
        createdBy: authUser.id
      }
    })

    return NextResponse.json({
      success: true,
      data: savedUjian,
      summary: {
        totalSantri: savedUjian.length,
        averageScore: Math.round((savedUjian.reduce((sum: number, u: any) => sum + u.nilaiAkhir, 0) / savedUjian.length) * 100) / 100,
        completionRate: Math.round((savedUjian.reduce((sum: number, u: any) => sum + u.metadata.completionRate, 0) / savedUjian.length) * 100) / 100,
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
  }
}

function generatePageRange(juzDari: number, juzSampai: number): number[] {
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
  const maxPages = 604
  
  for (let juz = juzDari; juz <= juzSampai; juz++) {
    const mapping = JUZ_TO_PAGE_MAPPING[juz]
    if (mapping && mapping.start <= maxPages && mapping.end <= maxPages) {
      for (let page = mapping.start; page <= mapping.end; page++) {
        pages.push(page)
      }
    }
  }

  return pages
}
