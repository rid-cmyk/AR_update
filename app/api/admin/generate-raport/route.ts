import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, withAuth } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request)
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized')
    }

    const body = await request.json()
    const { santriId, templateRaportId, tahunAjaranId } = body

    // Validasi input
    if (!santriId || !templateRaportId || !tahunAjaranId) {
      return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 })
    }

    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    try {
      // Cek apakah santri, template, dan tahun ajaran ada
      const [santri, template, tahunAjaran] = await Promise.all([
        prisma.user.findUnique({ where: { id: santriId } }),
      prisma.templateRaport.findUnique({ where: { id: templateRaportId } }),
      prisma.tahunAjaran.findUnique({ where: { id: tahunAjaranId } })
    ])

    if (!santri || !template || !tahunAjaran) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    }

    // Ambil data ujian santri untuk tahun ajaran ini
    const ujianData = await prisma.ujianGuru.findMany({
      where: {
        santriId,
        pengaturan: {
          contains: `"tahunAjaranId":${tahunAjaranId}`
        }
      },
      orderBy: { tanggalUjian: 'desc' }
    })

    // Hitung nilai rata-rata
    const nilaiRataRata = ujianData.length > 0 
      ? Math.round(ujianData.reduce((sum, ujian) => sum + ujian.totalNilai, 0) / ujianData.length)
      : 0

    // Hitung ranking (simulasi - dalam implementasi nyata perlu query yang lebih kompleks)
    const allSantriNilai = await prisma.ujianGuru.groupBy({
      by: ['santriId'],
      where: {
        pengaturan: {
          contains: `"tahunAjaranId":${tahunAjaranId}`
        }
      },
      _avg: {
        totalNilai: true
      }
    })

    const sortedNilai = allSantriNilai
      .map(item => ({ santriId: item.santriId, avgNilai: item._avg.totalNilai || 0 }))
      .sort((a, b) => b.avgNilai - a.avgNilai)

    const ranking = sortedNilai.findIndex(item => item.santriId === santriId) + 1

    // Tentukan status kelulusan
    let statusKelulusan = 'Tidak Lulus'
    if (nilaiRataRata >= 80) {
      statusKelulusan = 'Lulus'
    } else if (nilaiRataRata >= 60) {
      statusKelulusan = 'Perbaikan'
    }

    // Cek apakah raport sudah ada
    const existingRaport = await prisma.raportSantri.findUnique({
      where: {
        santriId_tahunAjaranId: {
          santriId,
          tahunAjaranId
        }
      }
    })

    let raportSantri
    if (existingRaport) {
      // Update raport yang sudah ada
      raportSantri = await prisma.raportSantri.update({
        where: { id: existingRaport.id },
        data: {
          templateRaportId,
          nilaiRataRata,
          ranking,
          statusKelulusan,
          tanggalGenerate: new Date(),
          createdBy: user.id
        }
      })
    } else {
      // Buat raport baru
      raportSantri = await prisma.raportSantri.create({
        data: {
          santriId,
          templateRaportId,
          tahunAjaranId,
          nilaiRataRata,
          ranking,
          statusKelulusan,
          createdBy: user.id
        }
      })
    }

    // Generate data grafik (simulasi)
    const grafikData = {
      labels: ujianData.map(u => u.jenisUjian),
      values: ujianData.map(u => u.totalNilai),
      trend: nilaiRataRata >= 75 ? 'naik' : nilaiRataRata >= 60 ? 'stabil' : 'turun'
    }

    // Update dengan data grafik
    await prisma.raportSantri.update({
      where: { id: raportSantri.id },
      data: {
        grafikData: JSON.stringify(grafikData)
      }
    })

      return NextResponse.json({
        santriId,
        templateRaportId,
        tahunAjaranId,
        nilaiRataRata,
        ranking,
        statusKelulusan,
        raportId: raportSantri.id
      }, { status: 201 })
    } finally {
      await prisma.$disconnect()
    }
  } catch (error) {
    console.error('Error generating raport:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}