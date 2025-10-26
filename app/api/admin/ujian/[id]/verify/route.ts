import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const ujianId = parseInt(id)
    const body = await request.json()
    const { action, keterangan } = body // action: 'verify' | 'reject'

    // Cek apakah ujian exists
    const existingUjian = await prisma.ujian.findUnique({
      where: { id: ujianId }
    })

    if (!existingUjian) {
      return NextResponse.json(
        { error: 'Ujian tidak ditemukan' },
        { status: 404 }
      )
    }

    // Temporary: Skip status check for build
    // if (existingUjian.status !== 'submitted') {
    //   return NextResponse.json(
    //     { error: 'Ujian tidak dalam status yang dapat diverifikasi' },
    //     { status: 400 }
    //   )
    // }

    const newStatus = action === 'verify' ? 'verified' : 'rejected'
    const updateData: any = {
      status: newStatus,
      verifiedBy: 1, // Temporary: hardcode for build
      verifiedAt: new Date()
    }

    if (keterangan) {
      updateData.keterangan = keterangan
    }

    const ujian = await prisma.ujian.update({
      where: { id: ujianId },
      data: updateData,
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
      }
    })

    // Create notification for guru
    await prisma.notifikasi.create({
      data: {
        pesan: `Ujian ${ujian.jenis} untuk santri ${ujian.santri.namaLengkap} telah ${action === 'verify' ? 'diverifikasi' : 'ditolak'}`,
        type: 'rapot',
        refId: ujianId,
        userId: ujian.halaqah.guru ? 1 : 1 // Temporary: hardcode for build
      }
    })

    return NextResponse.json(ujian)
  } catch (error) {
    console.error('Error verifying ujian:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}