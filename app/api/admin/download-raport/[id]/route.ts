import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const raportId = parseInt(id)
    if (isNaN(raportId)) {
      return NextResponse.json({ error: 'ID raport tidak valid' }, { status: 400 })
    }

    // Ambil data raport
    const raport = await prisma.raportSantri.findUnique({
      where: { id: raportId },
      include: {
        santri: {
          select: {
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
        },
        templateRaport: true,
        tahunAjaran: true
      }
    })

    if (!raport) {
      return NextResponse.json({ error: 'Raport tidak ditemukan' }, { status: 404 })
    }

    // Simulasi pembuatan PDF
    // Dalam implementasi nyata, Anda akan menggunakan library seperti puppeteer atau jsPDF
    const pdfBuffer = Buffer.from(`
      RAPORT SANTRI
      =============
      
      Nama: ${raport.santri.namaLengkap}
      Username: ${raport.santri.username}
      Halaqah: ${raport.santri.HalaqahSantri[0]?.halaqah?.namaHalaqah || 'N/A'}
      Tahun Ajaran: ${raport.tahunAjaran.namaLengkap}
      
      Nilai Rata-rata: ${raport.nilaiRataRata}
      Ranking: ${raport.ranking}
      Status: ${raport.statusKelulusan}
      
      Tanggal Generate: ${raport.tanggalGenerate}
    `)

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="raport-${raport.santri.namaLengkap}-${raport.tahunAjaran.namaLengkap}.pdf"`
      }
    })

  } catch (error) {
    console.error('Error downloading raport:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}