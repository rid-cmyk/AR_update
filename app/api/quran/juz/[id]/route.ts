import { NextRequest, NextResponse } from 'next/server'

// Mapping Juz ke Surat dan Ayat
const JUZ_MAPPING: Record<number, Array<{ suratId: number; ayatStart: number; ayatEnd: number }>> = {
  1: [{ suratId: 1, ayatStart: 1, ayatEnd: 7 }, { suratId: 2, ayatStart: 1, ayatEnd: 141 }],
  2: [{ suratId: 2, ayatStart: 142, ayatEnd: 252 }],
  3: [{ suratId: 2, ayatStart: 253, ayatEnd: 286 }, { suratId: 3, ayatStart: 1, ayatEnd: 92 }],
  4: [{ suratId: 3, ayatStart: 93, ayatEnd: 200 }, { suratId: 4, ayatStart: 1, ayatEnd: 23 }],
  5: [{ suratId: 4, ayatStart: 24, ayatEnd: 147 }],
  6: [{ suratId: 4, ayatStart: 148, ayatEnd: 176 }, { suratId: 5, ayatStart: 1, ayatEnd: 81 }],
  7: [{ suratId: 5, ayatStart: 82, ayatEnd: 120 }, { suratId: 6, ayatStart: 1, ayatEnd: 110 }],
  8: [{ suratId: 6, ayatStart: 111, ayatEnd: 165 }, { suratId: 7, ayatStart: 1, ayatEnd: 87 }],
  9: [{ suratId: 7, ayatStart: 88, ayatEnd: 206 }, { suratId: 8, ayatStart: 1, ayatEnd: 40 }],
  10: [{ suratId: 8, ayatStart: 41, ayatEnd: 75 }, { suratId: 9, ayatStart: 1, ayatEnd: 92 }],
  11: [{ suratId: 9, ayatStart: 93, ayatEnd: 129 }, { suratId: 10, ayatStart: 1, ayatEnd: 109 }, { suratId: 11, ayatStart: 1, ayatEnd: 5 }],
  12: [{ suratId: 11, ayatStart: 6, ayatEnd: 123 }, { suratId: 12, ayatStart: 1, ayatEnd: 52 }],
  13: [{ suratId: 12, ayatStart: 53, ayatEnd: 111 }, { suratId: 13, ayatStart: 1, ayatEnd: 43 }, { suratId: 14, ayatStart: 1, ayatEnd: 52 }],
  14: [{ suratId: 15, ayatStart: 1, ayatEnd: 99 }, { suratId: 16, ayatStart: 1, ayatEnd: 128 }],
  15: [{ suratId: 17, ayatStart: 1, ayatEnd: 111 }, { suratId: 18, ayatStart: 1, ayatEnd: 74 }],
  16: [{ suratId: 18, ayatStart: 75, ayatEnd: 110 }, { suratId: 19, ayatStart: 1, ayatEnd: 98 }, { suratId: 20, ayatStart: 1, ayatEnd: 135 }],
  17: [{ suratId: 21, ayatStart: 1, ayatEnd: 112 }, { suratId: 22, ayatStart: 1, ayatEnd: 78 }],
  18: [{ suratId: 23, ayatStart: 1, ayatEnd: 118 }, { suratId: 24, ayatStart: 1, ayatEnd: 64 }, { suratId: 25, ayatStart: 1, ayatEnd: 20 }],
  19: [{ suratId: 25, ayatStart: 21, ayatEnd: 77 }, { suratId: 26, ayatStart: 1, ayatEnd: 227 }, { suratId: 27, ayatStart: 1, ayatEnd: 55 }],
  20: [{ suratId: 27, ayatStart: 56, ayatEnd: 93 }, { suratId: 28, ayatStart: 1, ayatEnd: 88 }, { suratId: 29, ayatStart: 1, ayatEnd: 45 }],
  21: [{ suratId: 29, ayatStart: 46, ayatEnd: 69 }, { suratId: 30, ayatStart: 1, ayatEnd: 60 }, { suratId: 31, ayatStart: 1, ayatEnd: 34 }, { suratId: 32, ayatStart: 1, ayatEnd: 30 }, { suratId: 33, ayatStart: 1, ayatEnd: 30 }],
  22: [{ suratId: 33, ayatStart: 31, ayatEnd: 73 }, { suratId: 34, ayatStart: 1, ayatEnd: 54 }, { suratId: 35, ayatStart: 1, ayatEnd: 45 }, { suratId: 36, ayatStart: 1, ayatEnd: 27 }],
  23: [{ suratId: 36, ayatStart: 28, ayatEnd: 83 }, { suratId: 37, ayatStart: 1, ayatEnd: 182 }, { suratId: 38, ayatStart: 1, ayatEnd: 88 }, { suratId: 39, ayatStart: 1, ayatEnd: 31 }],
  24: [{ suratId: 39, ayatStart: 32, ayatEnd: 75 }, { suratId: 40, ayatStart: 1, ayatEnd: 85 }, { suratId: 41, ayatStart: 1, ayatEnd: 46 }],
  25: [{ suratId: 41, ayatStart: 47, ayatEnd: 54 }, { suratId: 42, ayatStart: 1, ayatEnd: 53 }, { suratId: 43, ayatStart: 1, ayatEnd: 89 }, { suratId: 44, ayatStart: 1, ayatEnd: 59 }, { suratId: 45, ayatStart: 1, ayatEnd: 37 }],
  26: [{ suratId: 46, ayatStart: 1, ayatEnd: 35 }, { suratId: 47, ayatStart: 1, ayatEnd: 38 }, { suratId: 48, ayatStart: 1, ayatEnd: 29 }, { suratId: 49, ayatStart: 1, ayatEnd: 18 }, { suratId: 50, ayatStart: 1, ayatEnd: 45 }, { suratId: 51, ayatStart: 1, ayatEnd: 30 }],
  27: [{ suratId: 51, ayatStart: 31, ayatEnd: 60 }, { suratId: 52, ayatStart: 1, ayatEnd: 49 }, { suratId: 53, ayatStart: 1, ayatEnd: 62 }, { suratId: 54, ayatStart: 1, ayatEnd: 55 }, { suratId: 55, ayatStart: 1, ayatEnd: 78 }, { suratId: 56, ayatStart: 1, ayatEnd: 96 }, { suratId: 57, ayatStart: 1, ayatEnd: 29 }],
  28: [{ suratId: 58, ayatStart: 1, ayatEnd: 22 }, { suratId: 59, ayatStart: 1, ayatEnd: 24 }, { suratId: 60, ayatStart: 1, ayatEnd: 13 }, { suratId: 61, ayatStart: 1, ayatEnd: 14 }, { suratId: 62, ayatStart: 1, ayatEnd: 11 }, { suratId: 63, ayatStart: 1, ayatEnd: 11 }, { suratId: 64, ayatStart: 1, ayatEnd: 18 }, { suratId: 65, ayatStart: 1, ayatEnd: 12 }, { suratId: 66, ayatStart: 1, ayatEnd: 12 }],
  29: [{ suratId: 67, ayatStart: 1, ayatEnd: 30 }, { suratId: 68, ayatStart: 1, ayatEnd: 52 }, { suratId: 69, ayatStart: 1, ayatEnd: 52 }, { suratId: 70, ayatStart: 1, ayatEnd: 44 }, { suratId: 71, ayatStart: 1, ayatEnd: 28 }, { suratId: 72, ayatStart: 1, ayatEnd: 28 }, { suratId: 73, ayatStart: 1, ayatEnd: 20 }, { suratId: 74, ayatStart: 1, ayatEnd: 56 }, { suratId: 75, ayatStart: 1, ayatEnd: 40 }, { suratId: 76, ayatStart: 1, ayatEnd: 31 }, { suratId: 77, ayatStart: 1, ayatEnd: 50 }],
  30: [{ suratId: 78, ayatStart: 1, ayatEnd: 40 }, { suratId: 79, ayatStart: 1, ayatEnd: 46 }, { suratId: 80, ayatStart: 1, ayatEnd: 42 }, { suratId: 81, ayatStart: 1, ayatEnd: 29 }, { suratId: 82, ayatStart: 1, ayatEnd: 19 }, { suratId: 83, ayatStart: 1, ayatEnd: 36 }, { suratId: 84, ayatStart: 1, ayatEnd: 25 }, { suratId: 85, ayatStart: 1, ayatEnd: 22 }, { suratId: 86, ayatStart: 1, ayatEnd: 17 }, { suratId: 87, ayatStart: 1, ayatEnd: 19 }, { suratId: 88, ayatStart: 1, ayatEnd: 26 }, { suratId: 89, ayatStart: 1, ayatEnd: 30 }, { suratId: 90, ayatStart: 1, ayatEnd: 20 }, { suratId: 91, ayatStart: 1, ayatEnd: 15 }, { suratId: 92, ayatStart: 1, ayatEnd: 21 }, { suratId: 93, ayatStart: 1, ayatEnd: 11 }, { suratId: 94, ayatStart: 1, ayatEnd: 8 }, { suratId: 95, ayatStart: 1, ayatEnd: 8 }, { suratId: 96, ayatStart: 1, ayatEnd: 19 }, { suratId: 97, ayatStart: 1, ayatEnd: 5 }, { suratId: 98, ayatStart: 1, ayatEnd: 8 }, { suratId: 99, ayatStart: 1, ayatEnd: 8 }, { suratId: 100, ayatStart: 1, ayatEnd: 11 }, { suratId: 101, ayatStart: 1, ayatEnd: 11 }, { suratId: 102, ayatStart: 1, ayatEnd: 8 }, { suratId: 103, ayatStart: 1, ayatEnd: 3 }, { suratId: 104, ayatStart: 1, ayatEnd: 9 }, { suratId: 105, ayatStart: 1, ayatEnd: 5 }, { suratId: 106, ayatStart: 1, ayatEnd: 4 }, { suratId: 107, ayatStart: 1, ayatEnd: 7 }, { suratId: 108, ayatStart: 1, ayatEnd: 3 }, { suratId: 109, ayatStart: 1, ayatEnd: 6 }, { suratId: 110, ayatStart: 1, ayatEnd: 3 }, { suratId: 111, ayatStart: 1, ayatEnd: 5 }, { suratId: 112, ayatStart: 1, ayatEnd: 4 }, { suratId: 113, ayatStart: 1, ayatEnd: 5 }, { suratId: 114, ayatStart: 1, ayatEnd: 6 }]
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const juzId = parseInt(id)

    if (isNaN(juzId) || juzId < 1 || juzId > 30) {
      return NextResponse.json({
        success: false,
        message: 'Invalid juz ID'
      }, { status: 400 })
    }

    const juzMapping = JUZ_MAPPING[juzId]
    if (!juzMapping) {
      return NextResponse.json({
        success: false,
        message: 'Juz mapping not found'
      }, { status: 404 })
    }

    // Fetch ayat dari semua surat dalam juz ini
    const ayatList = []
    
    for (const mapping of juzMapping) {
      const response = await fetch(`https://equran.id/api/v2/surat/${mapping.suratId}`, {
        next: { revalidate: 86400 } // Cache 24 jam
      })
      
      if (response.ok) {
        const data = await response.json()
        const surat = data.data
        
        // Filter ayat sesuai range
        const ayatInRange = surat.ayat.filter((ayat: any) => 
          ayat.nomorAyat >= mapping.ayatStart && ayat.nomorAyat <= mapping.ayatEnd
        )
        
        ayatList.push({
          suratId: mapping.suratId,
          namaLatin: surat.namaLatin,
          nama: surat.nama,
          ayat: ayatInRange
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        juz: juzId,
        surat: ayatList
      }
    })

  } catch (error) {
    console.error('Error fetching juz:', error)
    return NextResponse.json({
      success: false,
      message: 'Gagal mengambil data juz'
    }, { status: 500 })
  }
}
