import { prisma } from '@/lib/database/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from "@/lib/auth"
import { JenisUjianTemplate, StatusUjian } from '@prisma/client'
import { calculateNilaiPerJuz } from '@/lib/utils/hafalanAssessment'



export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthUser(request)
    if (!user || error) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      santriId, 
      jenisUjian, 
      tanggal, 
      juzMulai, 
      juzSelesai, 
      jumlahPertanyaan,
      keterangan, 
      juzPenilaian, 
      nilaiAkhir 
    } = body

    // Validasi input
    if (!santriId || !jenisUjian || !tanggal || !juzPenilaian) {
      return NextResponse.json(
        { error: 'Data ujian tidak lengkap' },
        { status: 400 }
      )
    }

    // Get santri data
    const santri = await prisma.user.findFirst({
      where: { username: santriId },
      include: {
        HalaqahSantri: {
          include: {
            halaqah: true
          }
        }
      }
    })

    if (!santri) {
      return NextResponse.json(
        { error: 'Santri tidak ditemukan' },
        { status: 404 }
      )
    }

    // Cek apakah guru mengajar di halaqah santri
    const halaqahSantri = santri.HalaqahSantri.find(hs => 
      hs.halaqah.guruId === parseInt(user.id)
    )

    if (!halaqahSantri) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki akses untuk menilai santri ini' },
        { status: 403 }
      )
    }

    // Get tahun akademik aktif
    const tahunAkademikAktif = await prisma.tahunAjaran.findFirst({
      where: { isActive: true }
    })

    if (!tahunAkademikAktif) {
      return NextResponse.json(
        { error: 'Tahun akademik aktif tidak ditemukan' },
        { status: 400 }
      )
    }

    // Get atau buat template ujian default
    let templateUjian = await prisma.templateUjian.findFirst({
      where: {
        jenisUjian: jenisUjian as JenisUjianTemplate,
        status: 'aktif'
      },
      include: {
        komponenPenilaian: true
      }
    })

    if (!templateUjian) {
      // Buat template default jika belum ada

      templateUjian = await prisma.templateUjian.create({
        data: {
          namaTemplate: `Template ${jenisUjian.toUpperCase()} Default`,
          jenisUjian: jenisUjian as JenisUjianTemplate,
          deskripsi: `Template default untuk ujian ${jenisUjian}`,
          status: 'aktif',
          tahunAjaranId: tahunAkademikAktif.id,
          createdBy: parseInt(user.id),
          komponenPenilaian: {
            create: getDefaultKomponen(jenisUjian)
          }
        },
        include: {
          komponenPenilaian: true
        }
      })
    }

    const setting = await prisma.systemSetting.findUnique({ where: { id: 'global' } });
    const kkmDefault = Number((setting?.data as Record<string, unknown>)?.kkmDefault || 70);

    const evalResult = calculateNilaiPerJuz(
      juzPenilaian,
      Number(juzMulai || 1),
      Number(juzSelesai || 30),
      kkmDefault
    );

    // Buat data ujian detail
    const ujianDetail: any = {
      santriId: santri.id,
      templateUjianId: templateUjian.id,
      tahunAjaranId: tahunAkademikAktif.id,
      tanggalUjian: new Date(tanggal),
      nilaiAkhir: nilaiAkhir ?? evalResult.nilaiAkhirGabungan,
      statusUjian: 'draft' as StatusUjian,
      catatanGuru: `${keterangan || ''} | Juz ${juzMulai}-${juzSelesai} | ${jenisUjian === 'mhq' ? `${jumlahPertanyaan} pertanyaan/juz` : ''}`.trim(),
      juzDari: Number(juzMulai || 1),
      juzSampai: Number(juzSelesai || 30),
      createdBy: parseInt(user.id),
      nilaiDetail: juzPenilaian,
      pengaturan: {
        kkm: kkmDefault,
        statusKelulusan: evalResult.isAllJuzLulus ? 'LULUS' : 'REMEDIAL_REQUIRED',
        rekomendasiRemedial: !evalResult.isAllJuzLulus,
        juzRemedialList: evalResult.juzRemedialList,
        nilaiPerJuz: evalResult.nilaiPerJuz,
        predikatAkhir: evalResult.predikatAkhir
      }
    }

    // Create ujian
    const ujian = await prisma.ujianSantri.create({
      data: ujianDetail,
      include: {
        santri: {
          select: {
            namaLengkap: true,
            username: true
          }
        },
        templateUjian: {
          select: {
            namaTemplate: true,
            jenisUjian: true
          }
        },
        tahunAjaran: {
          select: {
            namaLengkap: true
          }
        }
      }
    })

    return NextResponse.json(ujian, { status: 201 })
  } catch (error) {
    console.error('Error creating detailed ujian:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getDefaultKomponen(jenisUjian: string) {
  const komponenMap: Record<string, Array<{
    namaKomponen: string
    bobotNilai: number
    nilaiMaksimal: number
    deskripsi: string
    urutan: number
  }>> = {
    tasmi: [
      {
        namaKomponen: 'Kelancaran',
        bobotNilai: 60,
        nilaiMaksimal: 100,
        deskripsi: 'Penilaian kelancaran membaca per halaman',
        urutan: 1
      },
      {
        namaKomponen: 'Tajwid',
        bobotNilai: 40,
        nilaiMaksimal: 100,
        deskripsi: 'Penilaian ketepatan tajwid',
        urutan: 2
      }
    ],
    mhq: [
      {
        namaKomponen: 'Ketepatan Hafalan',
        bobotNilai: 50,
        nilaiMaksimal: 100,
        deskripsi: 'Ketepatan menjawab pertanyaan hafalan',
        urutan: 1
      },
      {
        namaKomponen: 'Kelancaran',
        bobotNilai: 30,
        nilaiMaksimal: 100,
        deskripsi: 'Kelancaran dalam menjawab',
        urutan: 2
      },
      {
        namaKomponen: 'Tajwid',
        bobotNilai: 20,
        nilaiMaksimal: 100,
        deskripsi: 'Ketepatan tajwid saat menjawab',
        urutan: 3
      }
    ],
    uas: [
      {
        namaKomponen: 'Hafalan',
        bobotNilai: 70,
        nilaiMaksimal: 100,
        deskripsi: 'Penilaian hafalan per juz',
        urutan: 1
      },
      {
        namaKomponen: 'Tajwid',
        bobotNilai: 30,
        nilaiMaksimal: 100,
        deskripsi: 'Penilaian tajwid',
        urutan: 2
      }
    ],
    kenaikan_juz: [
      {
        namaKomponen: 'Hafalan',
        bobotNilai: 80,
        nilaiMaksimal: 100,
        deskripsi: 'Penilaian hafalan untuk kenaikan juz',
        urutan: 1
      },
      {
        namaKomponen: 'Kelancaran',
        bobotNilai: 20,
        nilaiMaksimal: 100,
        deskripsi: 'Penilaian kelancaran',
        urutan: 2
      }
    ]
  }

  return komponenMap[jenisUjian] || komponenMap.uas
}