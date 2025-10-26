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

    const ujianList = await prisma.ujian.findMany({
      where: {
        // status: { in: ['submitted', 'verified', 'rejected'] } // Temporary: skip for build
      },
      include: {
        santri: {
          select: {
            namaLengkap: true,
            username: true
          }
        },
        halaqah: {
          select: {
            namaHalaqah: true,
            guru: {
              select: {
                namaLengkap: true
              }
            }
          }
        },
        // templateUjian: {
        //   select: {
        //     namaTemplate: true,
        //     jenisUjian: true
        //   }
        // },
        // nilaiUjian: {
        //   include: {
        //     komponenPenilaian: {
        //       select: {
        //         namaKomponen: true,
        //         bobotNilai: true,
        //         nilaiMaksimal: true
        //       }
        //     }
        //   }
        // },
        // verifier: {
        //   select: {
        //     namaLengkap: true
        //   }
        // }
      },
      orderBy: { tanggal: 'desc' }
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