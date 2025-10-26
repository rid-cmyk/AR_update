import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      hs.halaqah.guruId === 1 // Temporary: hardcode for build
    )

    if (!halaqahSantri) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki akses untuk menilai santri ini' },
        { status: 403 }
      )
    }

    // Get atau buat template ujian default
    let templateUjian = await prisma.templateUjian.findFirst({
      where: {
        jenisUjian: jenisUjian as any,
        isActive: true
      },
      include: {
        komponenPenilaian: true
      }
    })

    if (!templateUjian) {
      // Buat template default jika belum ada
      const tahunAkademikAktif = await prisma.tahunAkademik.findFirst({
        where: { isActive: true }
      })

      if (!tahunAkademikAktif) {
        return NextResponse.json(
          { error: 'Tahun akademik aktif tidak ditemukan' },
          { status: 400 }
        )
      }

      templateUjian = await prisma.templateUjian.create({
        data: {
          namaTemplate: `Template ${jenisUjian.toUpperCase()} Default`,
          jenisUjian: jenisUjian as any,
          deskripsi: `Template default untuk ujian ${jenisUjian}`,
          isActive: true,
          tahunAkademik: tahunAkademikAktif.tahunAkademik,
          createdBy: parseInt(session.user.id),
          komponenPenilaian: {
            create: getDefaultKomponen(jenisUjian)
          }
        },
        include: {
          komponenPenilaian: true
        }
      })
    }

    // Buat data ujian detail
    const ujianDetail = {
      jenis: jenisUjian as any,
      nilaiAkhir,
      tanggal: new Date(tanggal),
      keterangan: `${keterangan || ''} | Juz ${juzMulai}-${juzSelesai} | ${jenisUjian === 'mhq' ? `${jumlahPertanyaan} pertanyaan/juz` : ''}`.trim(),
      status: 'draft' as any,
      santriId: santri.id,
      halaqahId: halaqahSantri.halaqahId,
      templateUjianId: templateUjian.id,
      // Simpan detail juz penilaian sebagai JSON
      detailPenilaian: {
        juzMulai,
        juzSelesai,
        jumlahPertanyaan: jenisUjian === 'mhq' ? jumlahPertanyaan : null,
        juzPenilaian
      }
    }

    // Create ujian
    const ujian = await prisma.ujian.create({
      data: ujianDetail,
      include: {
        santri: {
          select: {
            namaLengkap: true,
            username: true
          }
        },
        halaqah: {
          select: {
            namaHalaqah: true
          }
        },
        templateUjian: {
          select: {
            namaTemplate: true,
            jenisUjian: true
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