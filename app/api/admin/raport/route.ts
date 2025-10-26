import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const raportList = await prisma.raportSantri.findMany({
      include: {
        santri: {
          select: {
            namaLengkap: true,
            username: true
          }
        },
        templateRaport: {
          select: {
            namaTemplate: true,
            namaLembaga: true
          }
        },
        tahunAjaran: {
          select: {
            namaLengkap: true,
            semester: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(raportList)
  } catch (error) {
    console.error('Error fetching raport:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}