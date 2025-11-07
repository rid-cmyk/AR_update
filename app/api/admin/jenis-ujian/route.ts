import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get jenis ujian from database
    const jenisUjianList = await prisma.templateUjian.findMany({
      include: {
        komponenPenilaian: true
      },
      orderBy: {
        jenisUjian: 'asc'
      }
    })

    // Transform data to match frontend expectations
    const transformedJenisUjian = jenisUjianList.map(template => ({
      id: template.id.toString(),
      nama: template.namaTemplate,
      jenisUjian: template.jenisUjian,
      deskripsi: template.deskripsi || `Template ujian ${template.jenisUjian}`,
      tipeUjian: template.jenisUjian === 'mhq' ? 'per-halaman' : 'per-juz', // MHQ biasanya per halaman
      komponenPenilaian: template.komponenPenilaian.map(komponen => ({
        nama: komponen.namaKomponen,
        bobot: komponen.bobotNilai,
        nilaiMaksimal: komponen.nilaiMaksimal
      })),
      // Add specific configuration for MHQ
      showMushaf: template.jenisUjian === 'mhq' || template.jenisUjian === 'tasmi',
      mushafType: template.jenisUjian === 'mhq' ? 'quran-digital' : 'mushaf-digital'
    }))

    // If no real data, provide sample data for demo
    if (transformedJenisUjian.length === 0) {
      const sampleJenisUjian = [
        {
          id: '1',
          nama: "Ujian MHQ",
          jenisUjian: 'mhq',
          deskripsi: 'Musabaqah Hifdzil Quran - Ujian hafalan dengan Al-Quran digital',
          tipeUjian: 'per-halaman' as const,
          komponenPenilaian: [
            { nama: 'Kelancaran', bobot: 30, nilaiMaksimal: 100 },
            { nama: 'Tajwid', bobot: 25, nilaiMaksimal: 100 },
            { nama: 'Makharijul Huruf', bobot: 25, nilaiMaksimal: 100 },
            { nama: 'Fashahah', bobot: 20, nilaiMaksimal: 100 }
          ],
          showMushaf: true,
          mushafType: 'quran-digital'
        },
        {
          id: '2',
          nama: "Ujian Tasmi'",
          jenisUjian: 'tasmi',
          deskripsi: 'Ujian hafalan dengan mushaf digital',
          tipeUjian: 'per-juz' as const,
          komponenPenilaian: [
            { nama: 'Hafalan', bobot: 40, nilaiMaksimal: 100 },
            { nama: 'Tajwid', bobot: 30, nilaiMaksimal: 100 },
            { nama: 'Kelancaran', bobot: 30, nilaiMaksimal: 100 }
          ],
          showMushaf: true,
          mushafType: 'mushaf-digital'
        },
        {
          id: '3',
          nama: "Ujian Tahfidz",
          jenisUjian: 'tahfidz',
          deskripsi: 'Ujian hafalan tahfidz',
          tipeUjian: 'per-juz' as const,
          komponenPenilaian: [
            { nama: 'Hafalan', bobot: 50, nilaiMaksimal: 100 },
            { nama: 'Tajwid', bobot: 25, nilaiMaksimal: 100 },
            { nama: 'Adab', bobot: 25, nilaiMaksimal: 100 }
          ],
          showMushaf: false,
          mushafType: 'none'
        }
      ]
      
      return NextResponse.json({
        success: true,
        data: sampleJenisUjian,
        message: 'Data jenis ujian berhasil diambil (sample data)'
      })
    }

    return NextResponse.json({
      success: true,
      data: transformedJenisUjian,
      message: 'Data jenis ujian berhasil diambil'
    })

  } catch (error) {
    console.error('Error fetching jenis ujian:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Gagal mengambil data jenis ujian',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}