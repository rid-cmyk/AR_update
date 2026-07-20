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
            HalaqahSantri: {
              include: { halaqah: true }
            }
          }
        },
        templateUjian: true,
        verifikator: true,
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

    return ujianList.map((ujian: any) => ({
      id: ujian.id,
      santri: ujian.santri?.namaLengkap || 'Unknown',
      halaqah: ujian.santri?.HalaqahSantri?.[0]?.halaqah?.namaHalaqah || 'Tidak ada halaqah',
      jenisUjian: ujian.templateUjian?.jenisUjian || 'Unknown',
      templateUjian: ujian.templateUjian?.namaTemplate || 'Unknown',
      nilaiAkhir: ujian.nilaiAkhir || 0,
      status: ujian.statusUjian,
      tanggal: ujian.tanggalUjian.toISOString(),
      verifier: ujian.verifikator?.namaLengkap || 'Belum diverifikasi',
      keterangan: ujian.catatanGuru,
      komponenNilai: (ujian.nilaiUjian || []).map((nilai: any) => ({
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
        deadline: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        santri: {
          include: {
            HalaqahSantri: {
              include: { halaqah: true }
            }
          }
        }
      },
      orderBy: {
        deadline: 'asc'
      }
    })

    return targetList.map((target: any) => {
      // Calculate progress based on status since TargetHafalan has no direct relation to Hafalan records
      const progress = target.status === 'selesai' ? 100 : (target.status === 'proses' ? 50 : 0);

      return {
        id: target.id,
        santri: target.santri?.namaLengkap || 'Unknown',
        halaqah: target.santri?.HalaqahSantri?.[0]?.halaqah?.namaHalaqah || 'Tidak ada halaqah',
        surat: target.surat,
        ayatTarget: target.ayatTarget,
        deadline: target.deadline.toISOString(),
        status: target.status,
        progress
      }
    })
  } catch (error) {
    console.error('Error getting target reports:', error)
    return []
  }
}