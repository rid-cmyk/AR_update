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

    // Get target hafalan data for these santri
    const targets = await prisma.targetHafalan.findMany({
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
        deadline: 'asc'
      }
    });

    return ApiResponse.success(targets);

  } catch (error) {
    console.error('Error fetching guru target data:', error);
    return ApiResponse.serverError('Failed to fetch target data');
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error);
    }

    // Ensure user is guru
    if (user.role.name !== 'guru') {
      return ApiResponse.forbidden('Access denied');
    }

    const body = await request.json();
    const { santriId, surat, ayatTarget, deadline, halaqahId } = body;

    if (!santriId || !surat || !ayatTarget || !deadline || !halaqahId) {
      return ApiResponse.error('Missing required fields', 400);
    }

    // Verify that the santri belongs to this guru's halaqah
    const halaqahSantri = await prisma.halaqahSantri.findFirst({
      where: {
        halaqahId: Number(halaqahId),
        santriId: Number(santriId),
        halaqah: {
          guruId: user.id
        }
      }
    });

    if (!halaqahSantri) {
      return ApiResponse.forbidden('Santri tidak terdaftar di halaqah Anda');
    }

    // Create target hafalan
    const target = await prisma.targetHafalan.create({
      data: {
        santriId: Number(santriId),
        surat,
        ayatTarget: Number(ayatTarget),
        deadline: new Date(deadline),
        status: 'belum'
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

    return ApiResponse.success(target);

  } catch (error) {
    console.error('Error creating target:', error);
    return ApiResponse.serverError('Failed to create target');
  }
}