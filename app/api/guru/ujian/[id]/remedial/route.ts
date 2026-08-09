import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from "@/lib/auth"
import { prisma } from '@/lib/database/prisma'
export async function POST(
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
    const sessionUserId = parseInt(user.id)

    const existingUjian = await prisma.ujianSantri.findFirst({
      where: {
        id: ujianId,
        guruId: sessionUserId,
      },
      include: {
        templateUjian: true,
        santri: {
          select: { namaLengkap: true, username: true }
        }
      }
    })

    if (!existingUjian) {
      return NextResponse.json(
        { error: 'Ujian tidak ditemukan atau Anda tidak memiliki akses' },
        { status: 404 }
      )
    }

    let customTargetJuz: number[] = [];
    try {
      const body = await request.json();
      if (Array.isArray(body?.targetJuz)) {
        customTargetJuz = body.targetJuz.map(Number).filter((n: number) => !isNaN(n));
      }
    } catch {
      // Empty body is okay
    }

    const pengaturan = (existingUjian.pengaturan as Record<string, any>) || {};
    const defaultRemedialList = Array.isArray(pengaturan.juzRemedialList) ? pengaturan.juzRemedialList : [];
    const targetJuz = customTargetJuz.length > 0 ? customTargetJuz : defaultRemedialList;

    if (targetJuz.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada juz yang memerlukan remedial pada ujian ini' },
        { status: 400 }
      );
    }

    const juzDari = Math.min(...targetJuz);
    const juzSampai = Math.max(...targetJuz);

    const remedialUjian = await prisma.ujianSantri.create({
      data: {
        santriId: existingUjian.santriId,
        templateUjianId: existingUjian.templateUjianId,
        tahunAjaranId: existingUjian.tahunAjaranId,
        tanggalUjian: new Date(),
        statusUjian: 'draft',
        catatanGuru: `Ujian Remedial untuk Juz ${targetJuz.join(', ')}`,
        createdBy: sessionUserId,
        guruId: sessionUserId,
        jenisUjianLabel: existingUjian.jenisUjianLabel,
        juzDari,
        juzSampai,
        pengaturan: {
          ...pengaturan,
          isRemedial: true,
          parentUjianId: ujianId,
          targetJuzRemedial: targetJuz,
          kkm: pengaturan.kkm || 70,
          statusKelulusan: 'REMEDIAL_IN_PROGRESS',
        },
      },
      include: {
        santri: {
          select: {
            namaLengkap: true,
            username: true
          }
        },
        templateUjian: {
          select: {
            namaTemplate: true
          }
        }
      }
    });

    return NextResponse.json(remedialUjian, { status: 201 });
  } catch (error) {
    console.error('Error creating remedial ujian:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
