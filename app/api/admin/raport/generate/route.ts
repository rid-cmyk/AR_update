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
    const { tahunAkademikId, templateRaportId, halaqahIds, generateAll, overwriteExisting } = body

    // Validasi input
    if (!tahunAkademikId || !templateRaportId) {
      return NextResponse.json(
        { error: 'Tahun akademik dan template raport wajib diisi' },
        { status: 400 }
      )
    }

    // Get tahun ajaran
    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id: tahunAkademikId }
    })

    if (!tahunAjaran) {
      return NextResponse.json(
        { error: 'Tahun akademik tidak ditemukan' },
        { status: 404 }
      )
    }

    // Get template raport
    const templateRaport = await prisma.templateRaport.findUnique({
      where: { id: templateRaportId }
    })

    if (!templateRaport) {
      return NextResponse.json(
        { error: 'Template raport tidak ditemukan' },
        { status: 404 }
      )
    }

    // Get santri berdasarkan halaqah
    let santriList: any[] = []

    if (generateAll) {
      // Get all santri in active tahun akademik
      const halaqahSantri = await prisma.halaqahSantri.findMany({
        where: {
          tahunAkademik: tahunAjaran.namaLengkap,
          semester: tahunAjaran.semester
        },
        include: {
          santri: true,
          halaqah: true
        }
      })
      santriList = halaqahSantri
    } else {
      // Get santri from selected halaqah
      const halaqahSantri = await prisma.halaqahSantri.findMany({
        where: {
          halaqahId: { in: halaqahIds },
          tahunAkademik: tahunAjaran.namaLengkap,
          semester: tahunAjaran.semester
        },
        include: {
          santri: true,
          halaqah: true
        }
      })
      santriList = halaqahSantri
    }

    let generatedCount = 0
    let skippedCount = 0

    for (const halaqahSantri of santriList) {
      const santriId = halaqahSantri.santriId

      // Check if raport already exists
      const existingRaport = await prisma.raportSantri.findFirst({
        where: {
          santriId,
          tahunAjaranId: tahunAkademikId
        }
      })

      if (existingRaport && !overwriteExisting) {
        skippedCount++
        continue
      }

      // Get all verified ujian for this santri
      const ujianList = await prisma.ujian.findMany({
        where: {
          santriId
        },
        include: {
          santri: {
            select: {
              namaLengkap: true,
              username: true
            }
          }
        }
      })

      if (ujianList.length === 0) {
        skippedCount++
        continue
      }

      // Calculate nilai rata-rata per jenis ujian
      const jenisUjianMap = new Map<string, { total: number; count: number; ujian: any[] }>()

      ujianList.forEach(ujian => {
        const jenis = ujian.jenis
        if (!jenisUjianMap.has(jenis)) {
          jenisUjianMap.set(jenis, { total: 0, count: 0, ujian: [] })
        }
        const data = jenisUjianMap.get(jenis)!
        data.total += ujian.nilai
        data.count += 1
        data.ujian.push(ujian)
      })

      // Create raport details
      const raportDetails = Array.from(jenisUjianMap.entries()).map(([jenisUjian, data]) => ({
        jenisUjian: jenisUjian as any,
        nilaiUjian: data.total,
        jumlahUjian: data.count,
        nilaiRataRata: Math.round(data.total / data.count)
      }))

      // Calculate overall nilai rata-rata
      const totalNilai = raportDetails.reduce((sum, detail) => sum + detail.nilaiRataRata, 0)
      const nilaiRataRata = raportDetails.length > 0 ? Math.round(totalNilai / raportDetails.length) : 0

      // Determine keterangan lulus
      const keteranganLulus = nilaiRataRata >= 75 ? 'LULUS' : nilaiRataRata >= 60 ? 'REMEDIAL' : 'TIDAK LULUS'

      // Create or update raport
      const raportData = {
        santriId,
        templateRaportId,
        tahunAjaranId: tahunAkademikId,
        nilaiRataRata,
        totalNilaiAkhir: nilaiRataRata,
        statusKelulusan: keteranganLulus,
        catatanGuru: `Raport generated on ${new Date().toLocaleDateString()}`
      }

      if (existingRaport && overwriteExisting) {
        // Delete existing details
        await prisma.raportDetail.deleteMany({
          where: { raportId: existingRaport.id }
        })

        // Update existing raport
        await prisma.raportSantri.update({
          where: { id: existingRaport.id },
          data: raportData
        })
      } else {
        // Create new raport
        await prisma.raportSantri.create({
          data: raportData
        })
      }

      // Link ujian to raport
      const raport = await prisma.raportSantri.findFirst({
        where: {
          santriId,
          tahunAjaranId: tahunAkademikId
        }
      })

      if (raport) {
        await prisma.ujian.updateMany({
          where: {
            id: { in: ujianList.map(u => u.id) }
          },
          data: {
            raportId: raport.id
          }
        })
      }

      generatedCount++
    }

    // Calculate ranking
    await calculateRanking(tahunAkademikId)

    return NextResponse.json({
      generated: generatedCount,
      skipped: skippedCount,
      total: santriList.length
    })
  } catch (error) {
    console.error('Error generating raport:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function calculateRanking(tahunAjaranId: number) {
  // Get all raport for this period
  const raportList = await prisma.raportSantri.findMany({
    where: {
      tahunAjaranId,
      nilaiRataRata: { not: null }
    },
    orderBy: {
      nilaiRataRata: 'desc'
    }
  })

  // Update ranking
  for (let i = 0; i < raportList.length; i++) {
    await prisma.raportSantri.update({
      where: { id: raportList[i].id },
      data: { ranking: i + 1 }
    })
  }
}