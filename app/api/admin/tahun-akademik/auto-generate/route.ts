import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { withAuth } from '@/lib/api-helpers';
import { getCurrentTahunAkademik, getTahunAkademikRange } from '@/lib/tahun-akademik-utils';

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
        error: 'startYear dan endYear harus diisi' 
      }, { status: 400 });
    }

    if (startYear > endYear) {
      return NextResponse.json({ 
        error: 'startYear tidak boleh lebih besar dari endYear' 
      }, { status: 400 });
    }

    // Generate tahun akademik
    const tahunAkademikList = getTahunAkademikRange(startYear, endYear);
    const currentTahunAkademik = getCurrentTahunAkademik();
    
    const createdRecords = [];
    const skippedRecords = [];

    for (const tahunAkademik of tahunAkademikList) {
      try {
        // Cek apakah sudah ada
        const existing = await prisma.tahunAjaran.findFirst({
          where: {
            tahunMulai: tahunAkademik.tahunMulai,
            tahunSelesai: tahunAkademik.tahunSelesai,
            semester: tahunAkademik.semester
          }
        });

        if (existing) {
          skippedRecords.push({
            ...tahunAkademik,
            reason: 'Already exists',
            id: existing.id
          });
          continue;
        }

        // Tentukan apakah ini tahun akademik aktif
        const isCurrentActive = autoSetActive && 
          tahunAkademik.tahunMulai === currentTahunAkademik.tahunMulai &&
          tahunAkademik.tahunSelesai === currentTahunAkademik.tahunSelesai &&
          tahunAkademik.semester === currentTahunAkademik.semester;

        // Jika ini akan menjadi aktif, nonaktifkan yang lain
        if (isCurrentActive) {
          await prisma.tahunAjaran.updateMany({
            where: { isActive: true },
            data: { isActive: false }
          });
        }

        // Buat record baru
        const newRecord = await prisma.tahunAjaran.create({
          data: {
            tahunMulai: tahunAkademik.tahunMulai,
            tahunSelesai: tahunAkademik.tahunSelesai,
            semester: tahunAkademik.semester,
            namaLengkap: tahunAkademik.namaLengkap,
            tanggalMulai: tahunAkademik.tanggalMulai,
            tanggalSelesai: tahunAkademik.tanggalSelesai,
            isActive: isCurrentActive,
            createdBy: user.id
          }
        });

        createdRecords.push(newRecord);

      } catch (error) {
        console.error('Error creating tahun akademik:', error);
        skippedRecords.push({
          ...tahunAkademik,
          reason: 'Database error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil generate ${createdRecords.length} tahun akademik`,
      data: {
        created: createdRecords,
        skipped: skippedRecords,
        summary: {
          totalGenerated: tahunAkademikList.length,
          created: createdRecords.length,
          skipped: skippedRecords.length,
          currentActive: currentTahunAkademik
        }
      }
    });

  } catch (error) {
    console.error('Auto-generate tahun akademik error:', error);
    return NextResponse.json({
      error: 'Gagal generate tahun akademik',
      details: error instanceof Error ? error.message : 'Unknown error'
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
        error: 'startYear tidak boleh lebih besar dari endYear' 
      }, { status: 400 });
    }

    // Generate preview
    const tahunAkademikList = getTahunAkademikRange(startYear, endYear);
    const currentTahunAkademik = getCurrentTahunAkademik();

    // Cek yang sudah ada
    const existingRecords = await prisma.tahunAjaran.findMany({
      where: {
        tahunMulai: { gte: startYear, lte: endYear }
      },
      select: {
        id: true,
        tahunMulai: true,
        tahunSelesai: true,
        semester: true,
        namaLengkap: true,
        isActive: true
      }
    });

    const preview = tahunAkademikList.map(tahunAkademik => {
      const existing = existingRecords.find(record => 
        record.tahunMulai === tahunAkademik.tahunMulai &&
        record.tahunSelesai === tahunAkademik.tahunSelesai &&
        record.semester === tahunAkademik.semester
      );

      const isCurrent = 
        tahunAkademik.tahunMulai === currentTahunAkademik.tahunMulai &&
        tahunAkademik.tahunSelesai === currentTahunAkademik.tahunSelesai &&
        tahunAkademik.semester === currentTahunAkademik.semester;

      return {
        ...tahunAkademik,
        exists: !!existing,
        existingId: existing?.id,
        isCurrentActive: existing?.isActive || false,
        willBeActive: isCurrent,
        status: existing ? 'exists' : 'will_create'
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        preview,
        summary: {
          total: preview.length,
          existing: preview.filter(p => p.exists).length,
          willCreate: preview.filter(p => !p.exists).length,
          currentTahunAkademik
        }
      }
    });

  } catch (error) {
    console.error('Preview tahun akademik error:', error);
    return NextResponse.json({
      error: 'Gagal preview tahun akademik',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}