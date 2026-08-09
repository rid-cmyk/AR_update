 
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from "@/lib/auth"
import { prisma } from '@/lib/database/prisma'
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthUser(request)
    if (!user || error) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tahunAjaranId = searchParams.get('tahunAjaranId')

    const whereClause: any = {}

    const santriFilter = tahunAjaranId && !isNaN(Number(tahunAjaranId))
      ? { tahunAjaranId: Number(tahunAjaranId) }
      : undefined

    if (santriFilter) {
      whereClause.santri = {
        some: santriFilter
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
        santri: santriFilter ? {
          where: santriFilter
        } : undefined,
        _count: {
          select: {
            santri: santriFilter ? {
              where: santriFilter
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