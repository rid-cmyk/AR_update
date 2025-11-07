import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { withAuth } from '@/lib/api-helpers';
import { getCurrentTahunAkademik } from '@/lib/tahun-akademik-utils';

/**
 * GET /api/admin/tahun-akademik/active
 * Mendapatkan tahun akademik yang aktif
 */
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cari tahun akademik aktif di database
    const activeTahunAkademik = await prisma.tahunAjaran.findFirst({
      where: { isActive: true },
      include: {
        creator: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        },
        _count: {
          select: {
            templateUjian: true,
            templateRaport: true,
            ujianSantri: true,
            raportSantri: true
          }
        }
      }
    });

    // Jika tidak ada yang aktif, gunakan tahun akademik saat ini
    const currentTahunAkademik = getCurrentTahunAkademik();

    return NextResponse.json({
      success: true,
      data: {
        active: activeTahunAkademik,
        current: currentTahunAkademik,
        hasActive: !!activeTahunAkademik,
        isCurrentActive: activeTahunAkademik ? (
          activeTahunAkademik.tahunMulai === currentTahunAkademik.tahunMulai &&
          activeTahunAkademik.tahunSelesai === currentTahunAkademik.tahunSelesai &&
          activeTahunAkademik.semester === currentTahunAkademik.semester
        ) : false
      }
    });

  } catch (error) {
    console.error('Get active tahun akademik error:', error);
    return NextResponse.json({
      error: 'Gagal mendapatkan tahun akademik aktif',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * POST /api/admin/tahun-akademik/active
 * Set tahun akademik aktif
 */
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['admin', 'super_admin']);
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tahunAjaranId } = body;

    if (!tahunAjaranId) {
      return NextResponse.json({ 
        error: 'tahunAjaranId harus diisi' 
      }, { status: 400 });
    }

    // Cek apakah tahun ajaran exists
    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id: tahunAjaranId }
    });

    if (!tahunAjaran) {
      return NextResponse.json({ 
        error: 'Tahun ajaran tidak ditemukan' 
      }, { status: 404 });
    }

    // Nonaktifkan semua tahun ajaran
    await prisma.tahunAjaran.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    // Aktifkan tahun ajaran yang dipilih
    const updatedTahunAjaran = await prisma.tahunAjaran.update({
      where: { id: tahunAjaranId },
      data: { 
        isActive: true,
        updatedAt: new Date()
      },
      include: {
        creator: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Tahun akademik ${updatedTahunAjaran.namaLengkap} berhasil diaktifkan`,
      data: updatedTahunAjaran
    });

  } catch (error) {
    console.error('Set active tahun akademik error:', error);
    return NextResponse.json({
      error: 'Gagal mengaktifkan tahun akademik',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}