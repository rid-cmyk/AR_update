import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

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

    // Get raport with all related data
    const raport = await prisma.raport.findUnique({
      where: { id: raportId },
      include: {
        details: true,
        ujian: {
          include: {
            santri: {
              select: {
                namaLengkap: true,
                username: true
              }
            }
          }
        }
      }
    })

    if (!raport) {
      return NextResponse.json(
        { error: 'Raport tidak ditemukan' },
        { status: 404 }
      )
    }

    // For now, return JSON data
    // In production, you would generate PDF here using libraries like puppeteer or jsPDF
    const pdfData = {
      raport,
      generatedAt: new Date().toISOString(),
      format: 'PDF'
    }

    // Get santri info from ujian if available
    const santriInfo = raport.ujian.length > 0 ? raport.ujian[0].santri : null
    const filename = santriInfo 
      ? `raport-${santriInfo.username}-${raport.semester}-${raport.tahunAkademik}.json`
      : `raport-${raport.id}-${raport.semester}-${raport.tahunAkademik}.json`

    return NextResponse.json(pdfData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('Error downloading raport:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}