import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'
import { notifyUjianSubmit } from '@/lib/services/whatsapp-notifier'



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

    // Cek apakah ujian exists dan milik guru
    const sessionUserId = parseInt(session.user.id)
    const existingUjian = await prisma.ujianGuru.findFirst({
      where: {
        id: ujianId,
        guruId: sessionUserId
      }
    })

    if (!existingUjian) {
      return NextResponse.json(
        { error: 'Ujian tidak ditemukan atau Anda tidak memiliki akses' },
        { status: 404 }
      )
    }

    // Update status ke SUBMITTED
    const ujian = await prisma.ujianGuru.update({
      where: { id: ujianId },
      data: {
        status: 'SUBMITTED'
      },
      include: {
        santri: {
          select: {
            namaLengkap: true,
            username: true
          }
        },
        guru: {
          select: {
            namaLengkap: true
          }
        }
      }
    })

    // Create notification for admin/musyrif
    const adminUser = await prisma.user.findFirst({
      where: { role: { name: 'admin' } },
      select: { id: true }
    });
    if (adminUser) {
      await prisma.notifikasi.create({
        data: {
          pesan: `Ujian ${ujian.jenisUjian} untuk santri ${ujian.santri.namaLengkap} menunggu verifikasi`,
          type: 'rapot',
          refId: ujianId,
          userId: adminUser.id
        }
      });

      // WhatsApp notification to admin
      notifyUjianSubmit(ujian.santriId, {
        jenisUjian: ujian.jenisUjian,
        namaGuru: ujian.guru?.namaLengkap || "Guru",
      }).catch(console.error);
    }

    return NextResponse.json(ujian)
  } catch (error) {
    console.error('Error submitting ujian:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}