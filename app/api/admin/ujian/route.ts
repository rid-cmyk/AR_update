import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'



export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ujianList = await prisma.ujianGuru.findMany({
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