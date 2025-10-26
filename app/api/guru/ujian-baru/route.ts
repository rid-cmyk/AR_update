import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      santriId,
      kategoriUjian,
      tahunAjaranId,
      juzMulai,
      juzSelesai,
      tanggalUjian,
      keterangan,
      nilaiData
    } = body

    // Validasi input
    if (!santriId || !kategoriUjian || !tahunAjaranId || !juzMulai || !juzSelesai) {
      return NextResponse.json({ error: 'Semua field wajib harus diisi' }, { status: 400 })
    }

    // Hitung nilai akhir berdasarkan kategori
    let nilaiAkhir = 0
    
    switch (kategoriUjian) {
      case 'tasmi':
        // Rata-rata nilai per halaman
        const totalHalaman = (juzSelesai - juzMulai + 1) * 20
        let totalNilaiHalaman = 0
        for (let i = 1; i <= totalHalaman; i++) {
          totalNilaiHalaman += nilaiData[`halaman_${i}`] || 0
        }
        nilaiAkhir = Math.round(totalNilaiHalaman / totalHalaman)
        break

      case 'kenaikan_juz':
      case 'uas':
        // Rata-rata nilai per juz
        let totalNilaiJuz = 0
        let jumlahJuz = 0
        for (let juz = juzMulai; juz <= juzSelesai; juz++) {
          totalNilaiJuz += nilaiData[`juz_${juz}`] || 0
          jumlahJuz++
        }
        nilaiAkhir = Math.round(totalNilaiJuz / jumlahJuz)
        break

      case 'mhq':
        // Perhitungan berbobot untuk MHQ
        const jumlahPertanyaan = nilaiData.jumlahPertanyaan || 0
        const bobotKriteria = { tajwid: 30, sifatul_huruf: 25, kejelasan: 25, kelancaran: 20 }
        let totalNilaiMHQ = 0
        let totalPertanyaan = 0

        for (let juz = juzMulai; juz <= juzSelesai; juz++) {
          for (let p = 1; p <= jumlahPertanyaan; p++) {
            let nilaiPertanyaan = 0
            Object.entries(bobotKriteria).forEach(([kriteria, bobot]) => {
              const nilai = nilaiData[`juz_${juz}_pertanyaan_${p}_${kriteria}`] || 0
              nilaiPertanyaan += (nilai * bobot) / 100
            })
            totalNilaiMHQ += nilaiPertanyaan
            totalPertanyaan++
          }
        }
        nilaiAkhir = totalPertanyaan > 0 ? Math.round(totalNilaiMHQ / totalPertanyaan) : 0
        break

      default:
        return NextResponse.json({ error: 'Kategori ujian tidak valid' }, { status: 400 })
    }

    // Simpan ujian ke database
    const ujian = await prisma.ujianGuru.create({
      data: {
        santriId,
        guruId: parseInt(session.user.id),
        jenisUjian: kategoriUjian,
        juzMulai,
        juzSelesai,
        totalNilai: nilaiAkhir,
        keterangan: keterangan || '',
        tanggalUjian: new Date(tanggalUjian),
        status: 'SELESAI',
        pengaturan: JSON.stringify({
          tahunAjaranId,
          nilaiData,
          kategoriUjian
        })
      },
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        }
      }
    })

    return NextResponse.json(ujian, { status: 201 })
  } catch (error) {
    console.error('Error creating ujian:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const santriId = searchParams.get('santriId')
    const kategori = searchParams.get('kategori')
    const tahunAjaranId = searchParams.get('tahunAjaranId')

    const whereClause: any = {
      guruId: parseInt(session.user.id)
    }

    if (santriId) {
      whereClause.santriId = parseInt(santriId)
    }

    if (kategori) {
      whereClause.jenisUjian = kategori
    }

    if (tahunAjaranId) {
      whereClause.pengaturan = {
        contains: `"tahunAjaranId":${tahunAjaranId}`
      }
    }

    const ujianList = await prisma.ujianGuru.findMany({
      where: whereClause,
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true,
            HalaqahSantri: {
              include: {
                halaqah: {
                  select: {
                    namaHalaqah: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { tanggalUjian: 'desc' }
    })

    return NextResponse.json(ujianList)
  } catch (error) {
    console.error('Error fetching ujian:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}