import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/database/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) }
    })

    if (!user || user.role !== 'GURU') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const {
      santriId,
      templateUjianId,
      tanggalUjian,
      keterangan,
      juzDari,
      juzSampai,
      nilaiUjian
    } = await request.json()

    // Validasi input
    if (!santriId || !templateUjianId || !tanggalUjian || !nilaiUjian) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // Cek template ujian exists
    const template = await prisma.templateUjian.findUnique({
      where: { id: parseInt(templateUjianId) },
      include: { komponenPenilaian: true }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template ujian tidak ditemukan' }, { status: 404 })
    }

    // Get current academic year
    const currentTahunAjaran = await prisma.tahunAjaran.findFirst({
      where: { isActive: true }
    })

    if (!currentTahunAjaran) {
      return NextResponse.json({ error: 'Tahun ajaran aktif tidak ditemukan' }, { status: 400 })
    }

    // Calculate nilai akhir
    let nilaiAkhir = 0
    if (template.jenisUjian === 'mhq') {
      // For MHQ, calculate weighted average
      const totalBobot = template.komponenPenilaian.reduce((sum, k) => sum + k.bobotNilai, 0)
      nilaiAkhir = nilaiUjian.reduce((sum: number, nilai: any) => {
        const komponen = template.komponenPenilaian.find(k => k.id === nilai.komponenPenilaianId)
        if (komponen) {
          const nilaiTerbobot = (nilai.nilaiRaw / komponen.nilaiMaksimal) * komponen.bobotNilai
          return sum + nilaiTerbobot
        }
        return sum
      }, 0)
      nilaiAkhir = Math.round((nilaiAkhir / totalBobot) * 100)
    } else if (template.jenisUjian === 'uas') {
      // For UAS, calculate average of all pages
      const totalNilai = nilaiUjian.reduce((sum: number, nilai: any) => sum + nilai.nilaiRaw, 0)
      nilaiAkhir = Math.round(totalNilai / nilaiUjian.length)
    }

    // Simpan data ujian
    const ujian = await prisma.ujianSantri.create({
      data: {
        santriId: parseInt(santriId),
        templateUjianId: parseInt(templateUjianId),
        tahunAjaranId: currentTahunAjaran.id,
        tanggalUjian: new Date(tanggalUjian),
        nilaiAkhir,
        catatanGuru: keterangan || '',
        juzDari: juzDari || 1,
        juzSampai: juzSampai || 1,
        statusUjian: 'submitted',
        createdBy: user.id,
        verifiedBy: null
      }
    })

    // Simpan nilai ujian
    const nilaiUjianData = nilaiUjian.map((nilai: any, index: number) => {
      if (template.jenisUjian === 'mhq') {
        // For MHQ, use existing komponen penilaian
        const komponen = template.komponenPenilaian.find(k => k.id === nilai.komponenPenilaianId)
        if (!komponen) throw new Error(`Komponen ${nilai.komponenPenilaianId} tidak ditemukan`)

        return {
          ujianSantriId: ujian.id,
          komponenPenilaianId: nilai.komponenPenilaianId,
          nilaiRaw: nilai.nilaiRaw,
          nilaiTerbobot: Math.round((nilai.nilaiRaw / komponen.nilaiMaksimal) * komponen.bobotNilai),
          catatan: nilai.catatan || ''
        }
      } else {
        // For UAS, create dynamic komponen for each page
        return {
          ujianSantriId: ujian.id,
          komponenPenilaianId: null, // Will be handled differently for UAS
          nilaiRaw: nilai.nilaiRaw,
          nilaiTerbobot: nilai.nilaiRaw, // Direct value for UAS
          catatan: nilai.catatan || `Halaman ${index + 1}`,
          urutan: nilai.urutan || index + 1
        }
      }
    })

    await prisma.nilaiUjian.createMany({
      data: nilaiUjianData
    })

    // Fetch complete ujian data
    const completeUjian = await prisma.ujianSantri.findUnique({
      where: { id: ujian.id },
      include: {
        santri: {
          select: {
            namaLengkap: true,
            username: true,
            halaqah: {
              select: {
                namaHalaqah: true
              }
            }
          }
        },
        templateUjian: {
          select: {
            namaTemplate: true,
            jenisUjian: true
          }
        },
        nilaiUjian: {
          include: {
            komponenPenilaian: {
              select: {
                namaKomponen: true,
                bobotNilai: true,
                nilaiMaksimal: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: completeUjian
    })

  } catch (error) {
    console.error('Error creating ujian:', error)
    return NextResponse.json(
      { error: 'Gagal menyimpan data ujian' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) }
    })

    if (!user || user.role !== 'GURU') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const santriId = searchParams.get('santriId')
    const templateUjianId = searchParams.get('templateUjianId')

    const whereClause: any = {
      createdBy: user.id
    }

    if (santriId) {
      whereClause.santriId = parseInt(santriId)
    }

    if (templateUjianId) {
      whereClause.templateUjianId = parseInt(templateUjianId)
    }

    const ujianList = await prisma.ujianSantri.findMany({
      where: whereClause,
      include: {
        santri: {
          select: {
            namaLengkap: true,
            username: true,
            halaqah: {
              select: {
                namaHalaqah: true
              }
            }
          }
        },
        templateUjian: {
          select: {
            namaTemplate: true,
            jenisUjian: true
          }
        },
        nilaiUjian: {
          include: {
            komponenPenilaian: {
              select: {
                namaKomponen: true,
                bobotNilai: true,
                nilaiMaksimal: true
              }
            }
          }
        }
      },
      orderBy: {
        tanggalUjian: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: ujianList
    })

  } catch (error) {
    console.error('Error fetching ujian:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data ujian' },
      { status: 500 }
    )
  }
}