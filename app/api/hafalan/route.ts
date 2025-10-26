import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { getGuruSantriIds } from '@/lib/auth';
import { STATUS_HAFALAN } from '@/constants/constants';

// GET hafalan - with optional filters
export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    const { searchParams } = new URL(request.url);
    const halaqahId = searchParams.get('halaqahId');
    const santriId = searchParams.get('santriId');
    const tanggal = searchParams.get('tanggal');

    const where: Record<string, any> = {};

    let santriIds: number[] = [];

    if (halaqahId) {
      // Get santri IDs from specific halaqah
      const halaqahSantri = await prisma.halaqahSantri.findMany({
        where: { halaqahId: Number(halaqahId) },
        select: { santriId: true }
      });
      santriIds = halaqahSantri.map(hs => hs.santriId);
    } else if (user.role.name === 'guru') {
      // Guru only sees santri from their halaqah
      santriIds = await getGuruSantriIds(user.id);
    }

    if (santriIds.length > 0) {
      where.santriId = { in: santriIds };
    }

    if (santriId) {
      where.santriId = Number(santriId);
    }

    if (tanggal) {
      where.tanggal = {
        gte: new Date(tanggal + ' 00:00:00'),
        lt: new Date(tanggal + ' 23:59:59')
      };
    }

    const hafalan = await prisma.hafalan.findMany({
      where,
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        }
      },
      orderBy: { tanggal: 'desc' }
    });

    return ApiResponse.success(hafalan);
  } catch (error) {
    console.error('GET /api/hafalan error:', error);
    return ApiResponse.serverError('Failed to fetch hafalan');
  }
}

// CREATE hafalan
export async function POST(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    const body = await request.json();
    const { santriId, surat, ayatMulai, ayatSelesai, jenis, halaqahId, tanggal } = body;

    if (!santriId || !surat || !ayatMulai || !ayatSelesai || !jenis || !tanggal) {
      return ApiResponse.error('Missing required fields');
    }

    // For guru, verify santri belongs to their halaqah
    if (user.role.name === 'guru') {
      const guruSantriIds = await getGuruSantriIds(user.id);
      if (!guruSantriIds.includes(Number(santriId))) {
        return ApiResponse.forbidden('Santri tidak terdaftar di halaqah Anda');
      }
    }

    // Verify that santri belongs to the halaqah (if halaqahId provided)
    if (halaqahId) {
      const halaqahSantri = await prisma.halaqahSantri.findFirst({
        where: {
          halaqahId: Number(halaqahId),
          santriId: Number(santriId)
        }
      });

      if (!halaqahSantri) {
        return ApiResponse.error('Santri tidak terdaftar di halaqah ini');
      }
    }

    // Create hafalan record
    const hafalan = await prisma.hafalan.create({
      data: {
        santriId: Number(santriId),
        surat,
        ayatMulai: Number(ayatMulai),
        ayatSelesai: Number(ayatSelesai),
        status: jenis === 'ziyadah' ? STATUS_HAFALAN.ZIYADAH : STATUS_HAFALAN.MUROJAAH,
        tanggal: new Date(tanggal)
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

    return ApiResponse.success(hafalan, 201);
  } catch (error: any) {
    console.error('POST /api/hafalan error:', error);
    return ApiResponse.serverError('Failed to create hafalan');
  }
}