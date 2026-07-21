import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const semester = searchParams.get('semester') || 'S1'
    const tahunAjaran = searchParams.get('tahunAjaran') || '2024/2025'

    console.log('Tahfidz Reports - Semester:', semester, 'Tahun Ajaran:', tahunAjaran)

    // Get comprehensive tahfidz reports
    const reports = await getTahfidzReports(semester, tahunAjaran)

    return NextResponse.json({
      success: true,
      data: {
        reports,
        summary: {
          totalSantri: reports.length,
          averageNilai: reports.length > 0 ? 
            Math.round(reports.reduce((sum, r) => sum + r.nilaiAkhir, 0) / reports.length * 100) / 100 : 0,
          averageKehadiran: reports.length > 0 ? 
            Math.round(reports.reduce((sum, r) => sum + r.absensi.rate, 0) / reports.length * 100) / 100 : 0,
          averageTargetCompletion: reports.length > 0 ? 
            Math.round(reports.reduce((sum, r) => sum + r.target.rate, 0) / reports.length * 100) / 100 : 0,
          totalHafalan: reports.reduce((sum, r) => sum + r.hafalan.total, 0),
          totalPrestasi: reports.reduce((sum, r) => sum + r.prestasi, 0)
        }
      },
      metadata: {
        semester,
        tahunAjaran,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error generating tahfidz reports:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Gagal mengambil data laporan tahfidz',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
  }
}

// Get comprehensive tahfidz reports
async function getTahfidzReports(semester: string, tahunAjaran: string) {
  try {
    // Get tahun ajaran data
    const tahunAjaranData = await prisma.tahunAjaran.findFirst({
      where: {
        namaLengkap: tahunAjaran
      }
    })

    if (!tahunAjaranData) {
      console.log('Tahun ajaran not found, using current year')
    }

    // Calculate semester date range
    const currentYear = new Date().getFullYear()
    const startDate = semester === 'S1' ? 
      new Date(currentYear, 6, 1) : // July 1st for S1
      new Date(currentYear + 1, 0, 1) // January 1st for S2
    
    const endDate = semester === 'S1' ? 
      new Date(currentYear, 11, 31) : // December 31st for S1
      new Date(currentYear + 1, 5, 30) // June 30th for S2

    // Get all santri with their data
    const santriList = await prisma.user.findMany({
      where: {
        role: {
          name: 'santri'
        }
      },
      include: {
        HalaqahSantri: {
          include: {
            halaqah: {
              include: {
                guru: true
              }
            }
          }
        },
        Hafalan: {
          where: {
            tanggal: {
              gte: startDate,
              lte: endDate
            }
          }
        },
        Ujian: {
          where: {
            tanggal: {
              gte: startDate,
              lte: endDate
            }
          }
        },
        TargetHafalan: {
          where: {
            deadline: {
              gte: startDate,
              lte: endDate
            }
          }
        },
        Absensi: {
          where: {
            tanggal: {
              gte: startDate,
              lte: endDate
            }
          }
        },
        Prestasi: true
      }
    })

    return santriList.map(santri => {
      // Calculate hafalan statistics
      const totalHafalan = santri.Hafalan.length
      const ziyadahCount = santri.Hafalan.filter(h => h.status === 'ziyadah').length
      const murojaahCount = santri.Hafalan.filter(h => h.status === 'murojaah').length
      
      const totalAyat = santri.Hafalan.reduce((sum, hafalan) => {
        return sum + (hafalan.ayatSelesai - hafalan.ayatMulai + 1)
      }, 0)

      // Calculate absensi statistics
      const totalAbsensi = santri.Absensi.length
      const presentCount = santri.Absensi.filter(abs => abs.status === 'masuk').length
      const absensiRate = totalAbsensi > 0 ? (presentCount / totalAbsensi) * 100 : 0

      // Calculate target statistics
      const totalTarget = santri.TargetHafalan.length
      const completedTarget = santri.TargetHafalan.filter(t => t.status === 'selesai').length
      const targetRate = totalTarget > 0 ? (completedTarget / totalTarget) * 100 : 0

      // Calculate prestasi
      const totalPrestasi = santri.Prestasi.length

      // Calculate nilai akhir (comprehensive scoring)
      const hafalanScore = Math.min((totalAyat / 100) * 30, 30) // Max 30 points for hafalan
      const absensiScore = (absensiRate / 100) * 25 // Max 25 points for attendance
      const targetScore = (targetRate / 100) * 25 // Max 25 points for target completion
      const prestasiScore = Math.min(totalPrestasi * 5, 20) // Max 20 points for prestasi
      
      const nilaiAkhir = Math.round(hafalanScore + absensiScore + targetScore + prestasiScore)

      // Determine status akhir
      let statusAkhir = 'Merah' // Default
      if (nilaiAkhir >= 80 && absensiRate >= 80) {
        statusAkhir = 'Hijau'
      } else if (nilaiAkhir >= 60 && absensiRate >= 60) {
        statusAkhir = 'Kuning'
      }

      // Generate catatan
      const catatan = generateCatatan(santri, {
        totalHafalan,
        totalAyat,
        absensiRate,
        targetRate,
        totalPrestasi,
        nilaiAkhir
      })

      return {
        santriId: santri.id,
        namaSantri: santri.namaLengkap,
        halaqah: santri.HalaqahSantri[0]?.halaqah.namaHalaqah || 'Tidak ada halaqah',
        guru: santri.HalaqahSantri[0]?.halaqah.guru?.namaLengkap || 'Tidak ada guru',
        hafalan: {
          total: totalHafalan,
          ziyadah: ziyadahCount,
          murojaah: murojaahCount,
          totalAyat
        },
        absensi: {
          total: totalAbsensi,
          present: presentCount,
          rate: Math.round(absensiRate * 100) / 100
        },
        target: {
          total: totalTarget,
          completed: completedTarget,
          rate: Math.round(targetRate * 100) / 100
        },
        prestasi: totalPrestasi,
        nilaiAkhir,
        statusAkhir,
        catatan
      }
    })
  } catch (error) {
    console.error('Error getting tahfidz reports:', error)
    return []
  }
}

// Generate catatan for santri
function generateCatatan(santri: any, stats: any) {
  const notes = []
  
  if (stats.absensiRate >= 90) {
    notes.push('Kehadiran sangat baik')
  } else if (stats.absensiRate < 60) {
    notes.push('Perlu meningkatkan kehadiran')
  }
  
  if (stats.totalAyat >= 200) {
    notes.push('Hafalan sangat produktif')
  } else if (stats.totalAyat < 50) {
    notes.push('Perlu meningkatkan hafalan')
  }
  
  if (stats.targetRate >= 80) {
    notes.push('Target tercapai dengan baik')
  } else if (stats.targetRate < 50) {
    notes.push('Perlu fokus pada target')
  }
  
  if (stats.totalPrestasi > 0) {
    notes.push(`Meraih ${stats.totalPrestasi} prestasi`)
  }
  
  if (notes.length === 0) {
    notes.push('Performa standar, perlu peningkatan')
  }
  
  return notes.join('. ') + '.'
}