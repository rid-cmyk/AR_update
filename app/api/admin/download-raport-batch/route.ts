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
    const { raportIds, tahunAjaranId } = body

    if (!raportIds || !Array.isArray(raportIds) || raportIds.length === 0) {
      return NextResponse.json({ error: 'Raport IDs harus diisi' }, { status: 400 })
    }

    // Ambil data raport
    const raportList = await prisma.raportSantri.findMany({
      where: {
        santriId: { in: raportIds },
        tahunAjaranId: tahunAjaranId
      },
      include: {
        santri: {
          select: {
            namaLengkap: true,
            username: true
          }
        },
        templateRaport: true,
        tahunAjaran: true
      }
    })

    if (raportList.length === 0) {
      return NextResponse.json({ error: 'Tidak ada raport yang ditemukan' }, { status: 404 })
    }

    // Simulasi pembuatan ZIP file
    // Dalam implementasi nyata, Anda akan menggunakan library seperti JSZip atau archiver
    const zipBuffer = Buffer.from('Simulasi ZIP file dengan ' + raportList.length + ' raport')

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="raport-batch-${tahunAjaranId}.zip"`
      }
    })

  } catch (error) {
    console.error('Error creating batch download:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}