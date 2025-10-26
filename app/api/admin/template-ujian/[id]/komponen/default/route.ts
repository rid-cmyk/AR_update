import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const templateId = parseInt(id)
    const body = await request.json()
    const { jenisUjian } = body

    // Cek apakah template exists
    const existingTemplate = await prisma.templateUjian.findUnique({
      where: { id: templateId }
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template tidak ditemukan' },
        { status: 404 }
      )
    }

    // Hapus komponen yang sudah ada
    await prisma.komponenPenilaian.deleteMany({
      where: { templateUjianId: templateId }
    })

    // Template default berdasarkan jenis ujian
    const defaultKomponen: Record<string, Array<{
      namaKomponen: string
      bobotNilai: number
      nilaiMaksimal: number
      deskripsi: string
      urutan: number
    }>> = {
      tasmi: [
        {
          namaKomponen: 'Kelancaran',
          bobotNilai: 50,
          nilaiMaksimal: 100,
          deskripsi: 'Penilaian kelancaran dalam membaca Al-Quran',
          urutan: 1
        },
        {
          namaKomponen: 'Tajwid & Makhraj',
          bobotNilai: 50,
          nilaiMaksimal: 100,
          deskripsi: 'Penilaian ketepatan tajwid dan makhraj huruf',
          urutan: 2
        }
      ],
      mhq: [
        {
          namaKomponen: 'Kelancaran',
          bobotNilai: 30,
          nilaiMaksimal: 100,
          deskripsi: 'Penilaian kelancaran dalam membaca Al-Quran',
          urutan: 1
        },
        {
          namaKomponen: 'Ketepatan Ayat',
          bobotNilai: 30,
          nilaiMaksimal: 100,
          deskripsi: 'Penilaian ketepatan hafalan ayat Al-Quran',
          urutan: 2
        },
        {
          namaKomponen: 'Tajwid & Makhraj',
          bobotNilai: 25,
          nilaiMaksimal: 100,
          deskripsi: 'Penilaian ketepatan tajwid dan makhraj huruf',
          urutan: 3
        },
        {
          namaKomponen: 'Penampilan',
          bobotNilai: 15,
          nilaiMaksimal: 100,
          deskripsi: 'Penilaian penampilan dan sikap saat ujian',
          urutan: 4
        }
      ],
      uas: [
        {
          namaKomponen: 'Kelancaran',
          bobotNilai: 40,
          nilaiMaksimal: 100,
          deskripsi: 'Penilaian kelancaran dalam membaca Al-Quran',
          urutan: 1
        },
        {
          namaKomponen: 'Ketepatan Ayat',
          bobotNilai: 30,
          nilaiMaksimal: 100,
          deskripsi: 'Penilaian ketepatan hafalan ayat Al-Quran',
          urutan: 2
        },
        {
          namaKomponen: 'Tajwid & Makhraj',
          bobotNilai: 20,
          nilaiMaksimal: 100,
          deskripsi: 'Penilaian ketepatan tajwid dan makhraj huruf',
          urutan: 3
        },
        {
          namaKomponen: 'Adab & Sikap',
          bobotNilai: 10,
          nilaiMaksimal: 100,
          deskripsi: 'Penilaian adab dan sikap santri',
          urutan: 4
        }
      ],
      kenaikan_juz: [
        {
          namaKomponen: 'Kelancaran',
          bobotNilai: 40,
          nilaiMaksimal: 100,
          deskripsi: 'Penilaian kelancaran dalam membaca Al-Quran',
          urutan: 1
        },
        {
          namaKomponen: 'Ketepatan Ayat',
          bobotNilai: 30,
          nilaiMaksimal: 100,
          deskripsi: 'Penilaian ketepatan hafalan ayat Al-Quran',
          urutan: 2
        },
        {
          namaKomponen: 'Tajwid & Makhraj',
          bobotNilai: 20,
          nilaiMaksimal: 100,
          deskripsi: 'Penilaian ketepatan tajwid dan makhraj huruf',
          urutan: 3
        },
        {
          namaKomponen: 'Adab & Sikap',
          bobotNilai: 10,
          nilaiMaksimal: 100,
          deskripsi: 'Penilaian adab dan sikap santri',
          urutan: 4
        }
      ]
    }

    const komponenData = defaultKomponen[jenisUjian]
    if (!komponenData) {
      return NextResponse.json(
        { error: 'Template default tidak tersedia untuk jenis ujian ini' },
        { status: 400 }
      )
    }

    // Buat komponen baru
    const newKomponen = await Promise.all(
      komponenData.map(komponen =>
        prisma.komponenPenilaian.create({
          data: {
            ...komponen,
            templateUjianId: templateId
          }
        })
      )
    )

    return NextResponse.json(newKomponen, { status: 201 })
  } catch (error) {
    console.error('Error creating default komponen:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}