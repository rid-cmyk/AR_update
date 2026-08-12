import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from "@/lib/auth"
import { prisma } from '@/lib/database/prisma'
import { notifyUjianSubmit } from '@/lib/services/whatsapp-notifier'



export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthUser(request)
    if (!user || error) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const ujianId = parseInt(id)

    // Cek apakah ujian exists dan milik guru
    const sessionUserId = parseInt(user.id)
    const existingUjian = await prisma.ujianSantri.findFirst({
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

    // Guru TIDAK boleh melewati kewajiban remedial per-juz lewat override.
    // Keputusan override remedial hanya valid bila sudah disetujui admin/verifikator.
    const overrideRemedial = false;
    let alasanTanpaRemedial = '';
    try {
      const body = await request.json();
      alasanTanpaRemedial = typeof body?.alasanTanpaRemedial === 'string' ? body?.alasanTanpaRemedial : '';
    } catch {
      // Empty body is okay
    }

    const pengaturan = (existingUjian.pengaturan as Record<string, any>) || {};
    const rekomendasiRemedial = Boolean(pengaturan.rekomendasiRemedial);
    const juzRemedialList = Array.isArray(pengaturan.juzRemedialList) ? pengaturan.juzRemedialList : [];

    if (rekomendasiRemedial && !overrideRemedial && juzRemedialList.length > 0) {
      return NextResponse.json(
        {
          error: `Terdapat ${juzRemedialList.length} juz di bawah KKM (Juz ${juzRemedialList.join(', ')}). Harap jadwalkan remedial per-juz atau konfirmasikan teruskan tanpa remedial.`,
          requireRemedialDecision: true,
          juzRemedialList,
          kkm: pengaturan.kkm || 70,
        },
        { status: 422 }
      );
    }

    const updatedPengaturan = {
      ...pengaturan,
      overrideRemedial,
      alasanTanpaRemedial,
      statusKelulusan: overrideRemedial ? 'TIDAK_LULUS' : (pengaturan.statusKelulusan || 'LULUS'),
    };

    // Update status ke selesai (menunggu verifikasi)
    const ujian = await prisma.ujianSantri.update({
      where: { id: ujianId },
      data: {
        statusUjian: 'selesai',
        pengaturan: updatedPengaturan,
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
        },
        templateUjian: {
          select: {
            namaTemplate: true
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
          pesan: `Ujian ${ujian.jenisUjianLabel || ujian.templateUjian?.namaTemplate} untuk santri ${ujian.santri.namaLengkap} menunggu verifikasi`,
          type: 'rapot',
          refId: ujianId,
          userId: adminUser.id
        }
      });

      // WhatsApp notification to admin
      notifyUjianSubmit(ujian.santriId, {
        jenisUjian: ujian.jenisUjianLabel || ujian.templateUjian?.namaTemplate || 'Ujian',
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