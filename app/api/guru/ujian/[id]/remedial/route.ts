import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from "@/lib/auth"
import { prisma } from '@/lib/database/prisma'
import { calculateNilaiPerJuz } from '@/lib/utils/hafalanAssessment'

function clampNilai(value: unknown, fallback = 0): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(100, Math.max(0, Math.round(n)));
}

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
    const sessionUserId = parseInt(user.id)

    const existingUjian = await prisma.ujianSantri.findFirst({
      where: {
        id: ujianId,
        guruId: sessionUserId,
      },
    })

    if (!existingUjian) {
      return NextResponse.json(
        { error: 'Ujian tidak ditemukan atau Anda tidak memiliki akses' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const nilaiDetail: Record<string, number> =
      body?.nilaiDetail && typeof body.nilaiDetail === 'object'
        ? Object.fromEntries(
            Object.entries(body.nilaiDetail).map(([k, v]) => [k, clampNilai(v)])
          )
        : (existingUjian.nilaiDetail as Record<string, number>) || {}
    const nilaiAkhir = clampNilai(body?.nilaiAkhir, existingUjian.nilaiAkhir || 0)
    const catatan = typeof body?.catatan === 'string' ? body.catatan : existingUjian.catatanGuru || ''
    const status = String(body?.status || 'SELESAI').toUpperCase() === 'DRAFT' ? 'draft' : 'selesai'

    const pengaturan = (existingUjian.pengaturan as Record<string, any>) || {}
    const kkm = Number(pengaturan.kkm) || 70
    const juzDari = existingUjian.juzDari || 1
    const juzSampai = existingUjian.juzSampai || 1

    const evalResult = calculateNilaiPerJuz(nilaiDetail, juzDari, juzSampai, kkm, false)

    const updatedPengaturan = {
      ...pengaturan,
      isRemedial: true,
      parentUjianId: pengaturan.parentUjianId || ujianId,
      kkm,
      nilaiPerJuz: JSON.parse(JSON.stringify(evalResult.nilaiPerJuz)),
      juzRemedialList: evalResult.juzRemedialList,
      statusKelulusan: status === 'draft' ? 'REMEDIAL_IN_PROGRESS' : (evalResult.isAllJuzLulus ? 'LULUS' : 'REMEDIAL_REQUIRED'),
      rekomendasiRemedial: status === 'selesai' && !evalResult.isAllJuzLulus,
    }

    const remedialUjian = await prisma.ujianSantri.update({
      where: { id: ujianId },
      data: {
        statusUjian: status,
        nilaiAkhir,
        nilaiDetail,
        catatanGuru: catatan || `Ujian Remedial untuk Juz ${[...(pengaturan.targetJuzRemedial || [])].join(', ')}`,
        pengaturan: updatedPengaturan,
        tanggalUjian: new Date(),
      },
      include: {
        santri: { select: { namaLengkap: true, username: true } },
        templateUjian: { select: { namaTemplate: true } },
      },
    })

    return NextResponse.json(remedialUjian)
  } catch (error) {
    console.error('Error updating remedial ujian:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
