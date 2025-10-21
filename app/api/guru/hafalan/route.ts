import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';

export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error);
    }

    // Ensure user is guru
    if (user.role.name !== 'guru') {
      return ApiResponse.forbidden('Access denied');
    }

    // Get all santri IDs that belong to this guru's halaqah
    const halaqahSantri = await prisma.halaqahSantri.findMany({
      where: {
        halaqah: {
          guruId: user.id
        }
      },
      select: {
        santriId: true
      }
    });

    const santriIds = halaqahSantri.map((hs: any) => hs.santriId);

    if (santriIds.length === 0) {
      return ApiResponse.success([]);
    }

    // Get hafalan data for these santri
    const hafalan = await prisma.hafalan.findMany({
      where: {
        santriId: {
          in: santriIds
        }
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
      orderBy: {
        tanggal: 'desc'
      }
    });

    return ApiResponse.success(hafalan);

  } catch (error) {
    console.error('Error fetching guru hafalan data:', error);
    return ApiResponse.serverError('Failed to fetch hafalan data');
  }
}