import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from "@/lib/auth"
import { prisma } from '@/lib/database/prisma'
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthUser(request)
    if (!user || error) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const ujianList = await prisma.ujianSantri.findMany({
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        },
        guru: {
          select: {
            id: true,
            namaLengkap: true
          }
        },
        templateUjian: {
          select: {
            id: true,
            namaTemplate: true,
            jenisUjian: true
          }
        }
      },
      orderBy: { tanggalUjian: 'desc' }
    })

    return NextResponse.json(ujianList)
  } catch (error) {
    console.error('Error fetching ujian for verification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}