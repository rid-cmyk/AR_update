import { prisma } from '@/lib/database/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, withAuth } from '@/lib/api-helpers'
import { calculatePredikat } from '@/lib/utils/hafalanAssessment'

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
    const ujianData = await prisma.ujianSantri.findMany({
      where: {
        santriId,
        tahunAjaranId,
        statusUjian: { in: ['selesai', 'diverifikasi'] }
      },
      orderBy: { tanggalUjian: 'desc' }
    })

    // Hitung nilai rata-rata
    const nilaiRataRata = ujianData.length > 0 
      ? Math.round(ujianData.reduce((sum, ujian) => sum + (ujian.nilaiAkhir || 0), 0) / ujianData.length)
      : 0

    // Hitung ranking
    const allSantriNilai = await prisma.ujianSantri.groupBy({
      by: ['santriId'],
      where: {
        tahunAjaranId,
        statusUjian: { in: ['selesai', 'diverifikasi'] }
      },
      _avg: {
        nilaiAkhir: true
      }
    })

    const sortedNilai = allSantriNilai
      .map(item => ({ santriId: item.santriId, avgNilai: item._avg.nilaiAkhir || 0 }))
      .sort((a, b) => b.avgNilai - a.avgNilai)

    const ranking = sortedNilai.findIndex(item => item.santriId === santriId) + 1

    // Dynamic KKM dan Predikat Kehormatan
    const setting = await prisma.systemSetting.findUnique({ where: { id: 'global' } });
    const kkmDefault = Number((setting?.data as Record<string, unknown>)?.kkmDefault || 70);

    const isLulus = nilaiRataRata >= kkmDefault;
    const hasOverride = ujianData.some(u => Boolean((u.pengaturan as Record<string, any>)?.overrideRemedial));
    const statusKelulusan = isLulus
      ? `Lulus (${calculatePredikat(nilaiRataRata)})`
      : (hasOverride ? `Tidak Lulus (${calculatePredikat(nilaiRataRata)})` : 'Perbaikan / Remedial Required');

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

    // Generate data grafik dan rekap per juz
    const rekapPerJuz = ujianData.map(u => ({
      ujianId: u.id,
      label: u.jenisUjianLabel || 'Ujian',
      tanggal: u.tanggalUjian,
      nilaiAkhir: u.nilaiAkhir,
      nilaiPerJuz: (u.pengaturan as Record<string, any>)?.nilaiPerJuz || {},
      predikat: calculatePredikat(u.nilaiAkhir),
    }));

    const grafikData = {
      labels: ujianData.map(u => u.jenisUjianLabel || 'Ujian'),
      values: ujianData.map(u => u.nilaiAkhir || 0),
      trend: nilaiRataRata >= 75 ? 'naik' : nilaiRataRata >= 60 ? 'stabil' : 'turun',
      kkm: kkmDefault,
      rekapPerJuz
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
  } catch (error) {
    console.error('Error generating raport:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}