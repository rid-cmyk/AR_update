import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/database/prisma';
import {
  calculatePerJuzKKMStatus,
  calculateHafalanVelocity,
  predictCompletionAndRisk,
} from '@/lib/services/predictiveAnalytics';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { user: authUser, error } = await getAuthUser(request);
    if (error || !authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const roleName = authUser.role.name;
    const allowedRoles = ['super_admin', 'admin', 'guru', 'ortu', 'santri', 'yayasan'];
    if (!allowedRoles.includes(roleName)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Role not allowed' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const santriIdParam = searchParams.get('santriId');
    const daysWindowParam = searchParams.get('daysWindow');
    const kkmThresholdParam = searchParams.get('kkmThreshold');

    const daysWindow = Math.max(1, parseInt(daysWindowParam || '30', 10) || 30);
    const kkmThreshold = parseFloat(kkmThresholdParam || '80') || 80;

    let targetSantriId: number | null = null;
    if (santriIdParam) {
      const parsed = parseInt(santriIdParam, 10);
      if (!isNaN(parsed) && parsed > 0) {
        targetSantriId = parsed;
      }
    }

    if (roleName === 'santri') {
      if (targetSantriId !== null && targetSantriId !== authUser.id) {
        return NextResponse.json(
          { success: false, error: 'Santri hanya dapat mengakses data analitik milik sendiri' },
          { status: 403 }
        );
      }
      targetSantriId = authUser.id;
    }

    if (!targetSantriId) {
      return NextResponse.json(
        { success: false, error: 'Parameter santriId wajib diisi' },
        { status: 400 }
      );
    }

    const whereClause: any = {
      id: targetSantriId,
      role: { name: 'santri' },
    };

    if (roleName === 'ortu') {
      whereClause.anak = {
        some: { orangTuaId: authUser.id },
      };
    } else if (roleName === 'guru') {
      whereClause.OR = [
        { HalaqahSantri: { some: { halaqah: { guruId: authUser.id } } } },
        {
          HalaqahSantri: {
            some: {
              halaqah: {
                permissions: {
                  some: { guruId: authUser.id, canHafalan: true, isActive: true },
                },
              },
            },
          },
        },
      ];
    }

    const startDate = new Date(Date.now() - daysWindow * 86400000);

    // Single parameterized Prisma Query (Zero N+1)
    const santri = await prisma.user.findFirst({
      where: whereClause,
      select: {
        id: true,
        namaLengkap: true,
        username: true,
        foto: true,
        HalaqahSantri: {
          select: {
            halaqah: {
              select: {
                id: true,
                namaHalaqah: true,
                guru: {
                  select: {
                    id: true,
                    namaLengkap: true,
                  },
                },
              },
            },
          },
        },
        Hafalan: {
          where: {
            tanggal: { gte: startDate },
          },
          select: {
            id: true,
            tanggal: true,
            surat: true,
            ayatMulai: true,
            ayatSelesai: true,
            status: true,
          },
          orderBy: { tanggal: 'desc' },
        },
        TargetHafalan: {
          where: {
            status: { in: ['proses', 'belum'] },
          },
          select: {
            id: true,
            surat: true,
            ayatTarget: true,
            deadline: true,
            status: true,
          },
          orderBy: { deadline: 'asc' },
        },
        ujianSantri: {
          where: {
            statusUjian: 'diverifikasi',
          },
          select: {
            id: true,
            tanggalUjian: true,
            nilaiAkhir: true,
            nilaiDetail: true,
            juzDari: true,
            juzSampai: true,
            jenisUjianLabel: true,
          },
          orderBy: { tanggalUjian: 'desc' },
        },
      },
    });

    if (!santri) {
      return NextResponse.json(
        { success: false, error: 'Santri tidak ditemukan atau Anda tidak memiliki hak akses' },
        { status: 404 }
      );
    }

    // Aggregate scores per juz from verified exams
    const scoresPerJuz: Record<number, number> = {};
    for (const exam of santri.ujianSantri) {
      if (exam.nilaiDetail && typeof exam.nilaiDetail === 'object') {
        const detail = exam.nilaiDetail as Record<string, any>;
        for (let juz = 1; juz <= 30; juz++) {
          if (scoresPerJuz[juz] !== undefined) continue;

          let juzScore: number | null = null;
          const directKey = String(juz);

          if (typeof detail[directKey] === 'number') {
            juzScore = detail[directKey];
          } else if (
            typeof detail[directKey] === 'string' &&
            !isNaN(parseFloat(detail[directKey]))
          ) {
            juzScore = parseFloat(detail[directKey]);
          } else if (typeof detail[directKey] === 'object' && detail[directKey] !== null) {
            const obj = detail[directKey];
            if (typeof obj.score === 'number') juzScore = obj.score;
            else if (typeof obj.nilai === 'number') juzScore = obj.nilai;
          }

          if (juzScore === null) {
            const subValues: number[] = [];
            for (const [k, v] of Object.entries(detail)) {
              if (new RegExp(`^juz[-_\\s]?${juz}([-_\\s]|$)`, 'i').test(k)) {
                if (typeof v === 'number') subValues.push(v);
                else if (typeof v === 'string' && !isNaN(parseFloat(v)))
                  subValues.push(parseFloat(v));
              }
            }
            if (subValues.length > 0) {
              juzScore = Math.round(subValues.reduce((a, b) => a + b, 0) / subValues.length);
            }
          }

          if (juzScore !== null && !isNaN(juzScore)) {
            scoresPerJuz[juz] = juzScore;
          }
        }
      }

      if (typeof exam.nilaiAkhir === 'number' && exam.juzDari && exam.juzSampai) {
        for (let juz = exam.juzDari; juz <= exam.juzSampai; juz++) {
          if (scoresPerJuz[juz] === undefined) {
            scoresPerJuz[juz] = exam.nilaiAkhir;
          }
        }
      }
    }

    const perJuzKKM = calculatePerJuzKKMStatus(scoresPerJuz, kkmThreshold);

    const setoranList = santri.Hafalan.map((h) => ({
      tanggal: h.tanggal,
      jumlahAyat: Math.max(0, h.ayatSelesai - h.ayatMulai + 1),
      status: h.status,
    }));
    const velocity = calculateHafalanVelocity(setoranList, daysWindow);

    const activeTarget = santri.TargetHafalan[0] || null;
    const targetTotalAyat = activeTarget ? activeTarget.ayatTarget : 0;
    const targetDeadline = activeTarget ? activeTarget.deadline : null;

    const currentProgressAyat = setoranList
      .filter((s) => !s.status || String(s.status).toLowerCase() === 'ziyadah')
      .reduce((sum, s) => sum + s.jumlahAyat, 0);

    const prediction = predictCompletionAndRisk(
      currentProgressAyat,
      targetTotalAyat,
      velocity.dailyVelocityAyat,
      targetDeadline
    );

    return NextResponse.json({
      success: true,
      data: {
        santri: {
          id: santri.id,
          namaLengkap: santri.namaLengkap,
          username: santri.username,
          foto: santri.foto,
          halaqah: santri.HalaqahSantri.map((hs) => ({
            id: hs.halaqah.id,
            namaHalaqah: hs.halaqah.namaHalaqah,
            guruNama: hs.halaqah.guru?.namaLengkap || 'Belum Ditentukan',
          })),
        },
        activeTarget: activeTarget
          ? {
              id: activeTarget.id,
              surat: activeTarget.surat,
              ayatTarget: activeTarget.ayatTarget,
              deadline: activeTarget.deadline.toISOString(),
              status: activeTarget.status,
            }
          : null,
        perJuzKKM,
        velocity,
        prediction: {
          ...prediction,
          estimatedCompletionDate: prediction.estimatedCompletionDate
            ? prediction.estimatedCompletionDate.toISOString()
            : null,
        },
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching predictive analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
