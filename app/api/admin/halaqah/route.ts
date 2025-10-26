import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tahunAkademik = searchParams.get('tahunAkademik')
    const semester = searchParams.get('semester')

    const whereClause: any = {}

    if (tahunAkademik && semester) {
      whereClause.santri = {
        some: {
          tahunAkademik,
          semester: semester as any
        }
      }
    }

    const halaqahList = await prisma.halaqah.findMany({
      where: whereClause,
      include: {
        guru: {
          select: {
            namaLengkap: true
          }
        },
        santri: tahunAkademik && semester ? {
          where: {
            tahunAkademik,
            semester: semester as any
          }
        } : undefined,
        _count: {
          select: {
            santri: tahunAkademik && semester ? {
              where: {
                tahunAkademik,
                semester: semester as any
              }
            } : true
          }
        }
      },
      orderBy: { namaHalaqah: 'asc' }
    })

    // Transform data to include santri count
    const transformedData = halaqahList.map(halaqah => ({
      id: halaqah.id,
      namaHalaqah: halaqah.namaHalaqah,
      guru: halaqah.guru,
      santriCount: halaqah._count.santri
    }))

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error fetching halaqah:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}