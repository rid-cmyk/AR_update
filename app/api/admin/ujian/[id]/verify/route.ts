import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { getAuthUser } from '@/lib/auth'
import { notifyUjianVerified } from '@/lib/services/whatsapp-notifier'



export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthUser(request)
    if (!user || error) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }
    if (!['super_admin', 'admin'].includes(user.role.name)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const ujianId = parseInt(id)
    const body = await request.json()
    const { action, keterangan } = body // action: 'verify' | 'reject'

    // Cek apakah ujian exists
    const existingUjian = await prisma.ujianSantri.findUnique({
      where: { id: ujianId }
    })

    if (!existingUjian) {
      return NextResponse.json(
        { error: 'Ujian tidak ditemukan' },
        { status: 404 }
      )
    }

    const newStatus = action === 'verify' ? 'diverifikasi' : 'ditolak'
    const updateData: Record<string, unknown> = {
      statusUjian: newStatus,
      tanggalVerifikasi: new Date()
    }

    if (keterangan) {
      updateData.catatanGuru = [existingUjian.catatanGuru, keterangan].filter(Boolean).join(' | ')
    }

    // Get verifiedBy from session user ID
    const verifierId = parseInt(user.id)
    if (!isNaN(verifierId)) {
      updateData.diverifikasiBy = verifierId
    }

    const ujian = await prisma.ujianSantri.update({
      where: { id: ujianId },
      data: updateData,
      include: {
        santri: {
          select: {
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
            namaTemplate: true
          }
        }
      }
    })

    // Create notification for guru
    const guruId = ujian.guru?.id || ujian.createdBy
    if (guruId) {
      await prisma.notifikasi.create({
        data: {
          pesan: `Ujian ${ujian.jenisUjianLabel || ujian.templateUjian?.namaTemplate} untuk santri ${ujian.santri.namaLengkap} telah ${action === 'verify' ? 'diverifikasi' : 'ditolak'}`,
          type: 'rapot',
          refId: ujianId,
          userId: guruId
        }
      })

      // WhatsApp notification to guru
      notifyUjianVerified(ujian.santriId, action === "verify" ? "verified" : "rejected", {
        jenisUjian: ujian.jenisUjianLabel || ujian.templateUjian?.namaTemplate || "Ujian",
        guruId: guruId,
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