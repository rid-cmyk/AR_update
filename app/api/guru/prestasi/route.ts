import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { getGuruSantriIds } from '@/lib/auth';

// GET prestasi - filtered by guru's halaqah
export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    if (user.role.name !== 'guru') {
      return ApiResponse.forbidden('Access denied');
    }

    const { searchParams } = new URL(request.url);
    const halaqahId = searchParams.get('halaqahId');

    let santriIds: number[] = [];

    if (halaqahId) {
      // Get santri IDs from specific halaqah
      const halaqahSantri = await prisma.halaqahSantri.findMany({
        where: { 
          halaqahId: Number(halaqahId),
          halaqah: {
            guruId: user.id // Ensure guru owns this halaqah
          }
        },
        select: { santriId: true }
      });
      santriIds = halaqahSantri.map(hs => hs.santriId);
    } else {
      // Get all santri from guru's halaqah
      santriIds = await getGuruSantriIds(user.id);
    }

    if (santriIds.length === 0) {
      return ApiResponse.success([]);
    }

    const prestasi = await prisma.prestasi.findMany({
      where: {
        santriId: { in: santriIds }
      },
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        }
      },
      orderBy: [
        { tahun: 'desc' },
        { id: 'desc' }
      ]
    });

    return ApiResponse.success(prestasi);
  } catch (error) {
    console.error('GET /api/guru/prestasi error:', error);
    return ApiResponse.serverError('Failed to fetch prestasi');
  }
}

// CREATE prestasi
export async function POST(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    if (user.role.name !== 'guru') {
      return ApiResponse.forbidden('Access denied');
    }

    const body = await request.json();
    const { santriId, namaPrestasi, keterangan, kategori, tahun, halaqahId } = body;

    if (!santriId || !namaPrestasi || !tahun) {
      return ApiResponse.error('Missing required fields');
    }

    // Verify that santri belongs to guru's halaqah
    const guruSantriIds = await getGuruSantriIds(user.id);
    if (!guruSantriIds.includes(Number(santriId))) {
      return ApiResponse.forbidden('Santri tidak terdaftar di halaqah Anda');
    }

    // Create prestasi record
    const prestasi = await prisma.prestasi.create({
      data: {
        santriId: Number(santriId),
        namaPrestasi,
        keterangan: keterangan || null,
        kategori: kategori || null,
        tahun: Number(tahun),
        validated: false // Default to not validated
      },
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        }
      }
    });

    // Create notification for santri
    await prisma.notifikasi.create({
      data: {
        pesan: `Prestasi baru ditambahkan: ${namaPrestasi}`,
        type: 'rapot',
        refId: prestasi.id,
        userId: Number(santriId)
      }
    });

    return ApiResponse.success(prestasi, 201);
  } catch (error: any) {
    console.error('POST /api/guru/prestasi error:', error);
    return ApiResponse.serverError('Failed to create prestasi');
  }
}
