import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { getGuruSantriIds } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    const { searchParams } = new URL(request.url);
    const halaqahId = searchParams.get('halaqahId');

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

    const where: any = {};
    if (santriIds.length > 0) {
      where.santriId = { in: santriIds };
    }

    const targets = await prisma.targetHafalan.findMany({
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
      orderBy: { deadline: 'asc' }
    });

    return ApiResponse.success(targets);
  } catch (error) {
    console.error('GET /api/target error:', error);
    return ApiResponse.serverError('Failed to fetch targets');
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { santriId, surat, ayatTarget, deadline, status, halaqahId } = body;

    if (!santriId || !surat || !ayatTarget || !deadline || !halaqahId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify santri belongs to halaqah
    const halaqahSantri = await prisma.halaqahSantri.findFirst({
      where: {
        halaqahId: Number(halaqahId),
        santriId: Number(santriId)
      }
    });

    if (!halaqahSantri) {
      return NextResponse.json(
        { error: 'Santri tidak terdaftar di halaqah ini' },
        { status: 400 }
      );
    }

    const target = await prisma.targetHafalan.create({
      data: {
        santriId: Number(santriId),
        surat,
        ayatTarget: Number(ayatTarget),
        deadline: new Date(deadline),
        status: status as any
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

    return NextResponse.json(target);
  } catch (error) {
    console.error('POST /api/target error:', error);
    return NextResponse.json(
      { error: 'Failed to create target' },
      { status: 500 }
    );
  }
}