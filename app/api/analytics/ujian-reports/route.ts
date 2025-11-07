import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Default date range if not provided
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const end = endDate ? new Date(endDate) : new Date()

    console.log('Ujian Reports - Date Range:', { start, end })

    // Get ujian reports
    const ujianReports = await getUjianReports(start, end)
    
    // Get target reports
    const targetReports = await getTargetReports(start, end)

    return NextResponse.json({
      success: true,
      data: {
        ujianReports,
        targetReports
      },
      metadata: {
        dateRange: { start, end },
        totalUjian: ujianReports.length,
        totalTarget: targetReports.length,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error generating ujian reports:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Gagal mengambil data laporan ujian',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Get detailed ujian reports
async function getUjianReports(startDate: Date, endDate: Date) {
  try {
    const ujianList = await prisma.ujianSantri.findMany({
      where: {
        tanggalUjian: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        santri: {
          include: {
            halaqah: true
          }
        },
        templateUjian: true,
        verifiedBy: true,
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

    return ujianList.map(ujian => ({
      id: ujian.id,
      santri: ujian.santri.namaLengkap,
      halaqah: ujian.santri.halaqah?.namaHalaqah || 'Tidak ada halaqah',
      jenisUjian: ujian.templateUjian.jenisUjian,
      templateUjian: ujian.templateUjian.namaTemplate,
      nilaiAkhir: ujian.nilaiAkhir || 0,
      status: ujian.statusUjian,
      tanggal: ujian.tanggalUjian.toISOString(),
      verifier: ujian.verifiedBy?.namaLengkap || 'Belum diverifikasi',
      keterangan: ujian.catatanGuru,
      komponenNilai: ujian.nilaiUjian.map(nilai => ({
        komponen: nilai.komponenPenilaian?.namaKomponen || 'Unknown',
        nilaiRaw: nilai.nilaiRaw,
        nilaiTerbobot: nilai.nilaiTerbobot,
        bobot: nilai.komponenPenilaian?.bobotNilai || 0,
        catatan: nilai.catatan
      }))
    }))
  } catch (error) {
    console.error('Error getting ujian reports:', error)
    return []
  }
}

// Get detailed target reports
async function getTargetReports(startDate: Date, endDate: Date) {
  try {
    const targetList = await prisma.targetHafalan.findMany({
      where: {
        OR: [
          {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          },
          {
            deadline: {
              gte: startDate,
              lte: endDate
            }
          }
        ]
      },
      include: {
        santri: {
          include: {
            halaqah: true
          }
        },
        surat: true,
        hafalanSantri: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }
      },
      orderBy: {
        deadline: 'asc'
      }
    })

    return targetList.map(target => {
      // Calculate progress based on hafalan records
      const completedAyat = target.hafalanSantri.reduce((sum, hafalan) => {
        return sum + (hafalan.ayatSampai - hafalan.ayatDari + 1)
      }, 0)
      
      const progress = target.ayatTarget > 0 ? Math.round((completedAyat / target.ayatTarget) * 100) : 0

      return {
        id: target.id,
        santri: target.santri.namaLengkap,
        halaqah: target.santri.halaqah?.namaHalaqah || 'Tidak ada halaqah',
        surat: target.surat.namaSurat,
        ayatTarget: target.ayatTarget,
        deadline: target.deadline.toISOString(),
        status: target.statusTarget,
        progress: Math.min(progress, 100),
        completedAyat,
        keterangan: target.keterangan
      }
    })
  } catch (error) {
    console.error('Error getting target reports:', error)
    return []
  }
}