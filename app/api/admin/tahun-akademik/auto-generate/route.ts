import { NextRequest, NextResponse } from 'next/server';
import type { TahunAjaran } from '@prisma/client';
import { prisma } from '@/lib/database/prisma';
import { withAuth } from '@/lib/api-helpers';
import { getCurrentTahunAkademik, getTahunAkademikRange, type TahunAkademikInfo } from '@/lib/tahun-akademik-utils';

/**
 * Kelompokkan entri semester per tahun akademik (2 semester -> 1 TahunAjaran)
 */
function groupByTahunAjaran(list: TahunAkademikInfo[]): TahunAkademikInfo[] {
  return [...new Map(list.map((item) => [`${item.tahunMulai}-${item.tahunSelesai}`, item])).values()];
}

async function createSemesters(tahunAjaranId: number, tahunMulai: number, tahunSelesai: number, userId: number) {
  await prisma.semester.createMany({
    data: [
      {
        tahunAjaranId,
        namaSemester: 'Semester 1 Ganjil',
        semesterUrutan: 1,
        tanggalMulai: new Date(`${tahunMulai}-07-01`),
        tanggalSelesai: new Date(`${tahunMulai}-12-31`),
        isActive: false,
        createdBy: userId,
      },
      {
        tahunAjaranId,
        namaSemester: 'Semester 2 Genap',
        semesterUrutan: 2,
        tanggalMulai: new Date(`${tahunSelesai}-01-01`),
        tanggalSelesai: new Date(`${tahunSelesai}-06-30`),
        isActive: false,
        createdBy: userId,
      },
    ],
  });
}

/**
 * POST /api/admin/tahun-akademik/auto-generate
 * Auto-generate tahun akademik berdasarkan sistem kalender
 */
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['admin', 'super_admin']);
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { startYear, endYear, autoSetActive } = body;

    // Validasi input
    if (!startYear || !endYear) {
      return NextResponse.json({
        error: 'startYear dan endYear harus diisi',
      }, { status: 400 });
    }

    if (startYear > endYear) {
      return NextResponse.json({
        error: 'startYear tidak boleh lebih besar dari endYear',
      }, { status: 400 });
    }

    // Generate tahun akademik (2 semester per tahun -> dikelompokkan per tahun)
    const tahunAkademikList = groupByTahunAjaran(getTahunAkademikRange(startYear, endYear));
    const currentTahunAkademik = getCurrentTahunAkademik();

    const createdRecords: TahunAjaran[] = [];
    const skippedRecords: Array<TahunAkademikInfo & { reason: string; id?: number }> = [];

    for (const tahunAkademik of tahunAkademikList) {
      try {
        // Cek apakah sudah ada
        const existing = await prisma.tahunAjaran.findFirst({
          where: {
            tahunMulai: tahunAkademik.tahunMulai,
            tahunSelesai: tahunAkademik.tahunSelesai,
          },
        });

        if (existing) {
          skippedRecords.push({
            ...tahunAkademik,
            reason: 'Already exists',
            id: existing.id,
          });
          continue;
        }

        // Tentukan apakah ini tahun akademik aktif
        const isCurrentActive = autoSetActive &&
          tahunAkademik.tahunMulai === currentTahunAkademik.tahunMulai &&
          tahunAkademik.tahunSelesai === currentTahunAkademik.tahunSelesai;

        // Jika ini akan menjadi aktif, nonaktifkan yang lain
        if (isCurrentActive) {
          await prisma.tahunAjaran.updateMany({
            where: { isActive: true },
            data: { isActive: false },
          });
        }

        // Buat record tahun akademik baru
        const newRecord = await prisma.tahunAjaran.create({
          data: {
            tahunMulai: tahunAkademik.tahunMulai,
            tahunSelesai: tahunAkademik.tahunSelesai,
            namaLengkap: tahunAkademik.namaLengkap,
            tanggalMulai: tahunAkademik.tanggalMulai,
            tanggalSelesai: tahunAkademik.tanggalSelesai,
            isActive: isCurrentActive,
            createdBy: user.id,
          },
        });

        // Buat 2 semester otomatis
        await createSemesters(newRecord.id, newRecord.tahunMulai, newRecord.tahunSelesai, user.id);

        createdRecords.push(newRecord);
      } catch (err) {
        console.error('Error creating tahun akademik:', err);
        skippedRecords.push({
          ...tahunAkademik,
          reason: 'Database error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil generate ${createdRecords.length} tahun akademik`,
      data: {
        created: createdRecords.length,
        skipped: skippedRecords.length,
        total: tahunAkademikList.length,
      },
    });
  } catch (error) {
    console.error('Auto-generate tahun akademik error:', error);
    return NextResponse.json({
      error: 'Gagal generate tahun akademik',
    }, { status: 500 });
  }
}

/**
 * GET /api/admin/tahun-akademik/auto-generate
 * Preview tahun akademik yang akan di-generate
 */
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['admin', 'super_admin']);
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startYear = parseInt(searchParams.get('startYear') || '2024');
    const endYear = parseInt(searchParams.get('endYear') || '2025');

    if (startYear > endYear) {
      return NextResponse.json({
        error: 'startYear tidak boleh lebih besar dari endYear',
      }, { status: 400 });
    }

    // Generate preview (per tahun akademik)
    const tahunAkademikList = groupByTahunAjaran(getTahunAkademikRange(startYear, endYear));
    const currentTahunAkademik = getCurrentTahunAkademik();

    // Cek yang sudah ada
    const existingRecords = await prisma.tahunAjaran.findMany({
      where: {
        tahunMulai: { gte: startYear, lte: endYear },
      },
      select: {
        id: true,
        tahunMulai: true,
        tahunSelesai: true,
        namaLengkap: true,
        isActive: true,
      },
    });

    const preview = tahunAkademikList.map((tahunAkademik) => {
      const existing = existingRecords.find((record) =>
        record.tahunMulai === tahunAkademik.tahunMulai &&
        record.tahunSelesai === tahunAkademik.tahunSelesai
      );

      const isCurrent =
        tahunAkademik.tahunMulai === currentTahunAkademik.tahunMulai &&
        tahunAkademik.tahunSelesai === currentTahunAkademik.tahunSelesai;

      return {
        ...tahunAkademik,
        exists: !!existing,
        existingId: existing?.id,
        isCurrentActive: existing?.isActive || false,
        willBeActive: isCurrent,
        status: existing ? 'exists' : 'will_create',
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        preview,
        total: preview.length,
        existing: preview.filter((p) => p.exists).length,
        willCreate: preview.filter((p) => !p.exists).length,
        currentTahunAkademik,
      },
    });
  } catch (error) {
    console.error('Preview tahun akademik error:', error);
    return NextResponse.json({
      error: 'Gagal preview tahun akademik',
    }, { status: 500 });
  }
}
