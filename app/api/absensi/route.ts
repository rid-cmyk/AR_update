import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { getGuruSantriIds } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error);
    }

    const { searchParams } = new URL(request.url);
    const halaqahId = searchParams.get('halaqahId');
    const tanggal = searchParams.get('tanggal');

    if (!tanggal) {
      return ApiResponse.error('tanggal is required');
    }

    let jadwalIds: number[] = [];

    if (halaqahId) {
      // Get jadwal for this halaqah on this date
      const jadwal = await prisma.jadwal.findFirst({
        where: {
          halaqahId: Number(halaqahId),
          jamMulai: {
            gte: new Date(tanggal + ' 00:00:00'),
            lt: new Date(tanggal + ' 23:59:59')
          }
        }
      });
      if (jadwal) jadwalIds = [jadwal.id];
    } else if (user.role.name === 'guru') {
      // Get all jadwal for user's halaqah on this date
      const userHalaqah = await prisma.halaqah.findMany({
        where: { guruId: user.id },
        select: { id: true }
      });
      const halaqahIds = userHalaqah.map(h => h.id);

      const jadwals = await prisma.jadwal.findMany({
        where: {
          halaqahId: { in: halaqahIds },
          jamMulai: {
            gte: new Date(tanggal + ' 00:00:00'),
            lt: new Date(tanggal + ' 23:59:59')
          }
        },
        select: { id: true }
      });
      jadwalIds = jadwals.map(j => j.id);
    }

    if (jadwalIds.length === 0) {
      return ApiResponse.success([]);
    }

    // Get absensi for these jadwals
    const absensi = await prisma.absensi.findMany({
      where: {
        jadwalId: { in: jadwalIds }
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

    return ApiResponse.success(absensi);
  } catch (error) {
    console.error('GET /api/absensi error:', error);
    return ApiResponse.serverError('Failed to fetch absensi');
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error);
    }

    const body = await request.json();
    const { santriId, status, tanggal, halaqahId } = body;

    if (!santriId || !status || !tanggal || !halaqahId) {
      return ApiResponse.error('santriId, status, tanggal, halaqahId are required');
    }

    // For guru, verify santri belongs to their halaqah
    if (user.role.name === 'guru') {
      const guruSantriIds = await getGuruSantriIds(user.id);
      if (!guruSantriIds.includes(Number(santriId))) {
        return ApiResponse.forbidden('Santri tidak terdaftar di halaqah Anda');
      }
    }

    // Map status using constants
    const statusMap: Record<string, string> = {
      'masuk': 'masuk',
      'izin': 'izin',
      'tidak': 'alpha'
    };
    const mappedStatus = statusMap[status] || 'alpha';

    // Find jadwal for this halaqah on this date
    const jadwal = await prisma.jadwal.findFirst({
      where: {
        halaqahId: Number(halaqahId),
        jamMulai: {
          gte: new Date(tanggal + ' 00:00:00'),
          lt: new Date(tanggal + ' 23:59:59')
        }
      }
    });

    if (!jadwal) {
      return ApiResponse.error('No jadwal found for this halaqah on this date');
    }

    // Check if absensi already exists
    const existing = await prisma.absensi.findFirst({
      where: {
        santriId: Number(santriId),
        jadwalId: jadwal.id
      }
    });

    if (existing) {
      // Update
      const updated = await prisma.absensi.update({
        where: { id: existing.id },
        data: { status: mappedStatus as any },
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
      return ApiResponse.success(updated);
    } else {
      // Create
      const absensi = await prisma.absensi.create({
        data: {
          santriId: Number(santriId),
          jadwalId: jadwal.id,
          status: mappedStatus as any,
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
      return ApiResponse.success(absensi, 201);
    }
  } catch (error) {
    console.error('POST /api/absensi error:', error);
    return ApiResponse.serverError('Failed to save absensi');
  }
}