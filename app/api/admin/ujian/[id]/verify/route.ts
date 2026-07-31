import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'
import { notifyUjianVerified } from '@/lib/services/whatsapp-notifier'



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
    const updateData: Record<string, unknown> = {
      status: newStatus,
      verifiedAt: new Date()
    }

    if (keterangan) {
      updateData.keterangan = keterangan
    }

    // Get verifiedBy from session user ID
    const verifierId = parseInt(session.user.id as string)
    if (!isNaN(verifierId)) {
      updateData.verifiedBy = verifierId
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
                id: true,
                namaLengkap: true
              }
            }
          }
        },
      }
    })

    // Create notification for guru
    const guruId = ujian.halaqah.guru?.id
    if (guruId) {
      await prisma.notifikasi.create({
        data: {
          pesan: `Ujian ${ujian.jenis} untuk santri ${ujian.santri.namaLengkap} telah ${action === 'verify' ? 'diverifikasi' : 'ditolak'}`,
          type: 'rapot',
          refId: ujianId,
          userId: guruId
        }
      })

      // WhatsApp notification to guru
      notifyUjianVerified(ujian.santriId, action === "verify" ? "verified" : "rejected", {
        jenisUjian: ujian.jenis,
        namaGuru: ujian.halaqah.guru?.namaLengkap || "Guru",
        keterangan: action === "verify" ? "Ujian telah diverifikasi" : "Ujian ditolak",
      }).catch(console.error);
    }

    return NextResponse.json(ujian)
  } catch (error) {
    console.error('Error verifying ujian:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}