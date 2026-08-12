import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';

export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    const { searchParams } = new URL(request.url);
    const halaqahId = searchParams.get('halaqahId');
    const roleName = user.role.name;

    let santriIds: number[] = [];

    if (roleName === 'super_admin' || roleName === 'admin') {
      if (halaqahId) {
        const halaqahSantri = await prisma.halaqahSantri.findMany({
          where: { halaqahId: Number(halaqahId) },
          select: { santriId: true }
        });
        santriIds = halaqahSantri.map(hs => hs.santriId);
      }
    } else if (roleName === 'guru') {
      let allowedHalaqahIds: number[] | null = null;
      if (halaqahId) {
        const owned = await prisma.halaqah.findFirst({
          where: { id: Number(halaqahId), guruId: user.id },
          select: { id: true }
        });
        if (!owned) {
          return ApiResponse.forbidden('Anda tidak memiliki akses ke halaqah ini');
        }
        allowedHalaqahIds = [Number(halaqahId)];
      }
      const halaqahList = await prisma.halaqah.findMany({
        where: allowedHalaqahIds ? { id: { in: allowedHalaqahIds }, guruId: user.id } : { guruId: user.id },
        include: {
          santri: { select: { santriId: true } }
        }
      });
      santriIds = [...new Set(halaqahList.flatMap(h => h.santri.map(hs => hs.santriId)))];
    } else if (roleName === 'santri') {
      santriIds = [user.id];
    } else if (roleName === 'ortu') {
      const children = await prisma.orangTuaSantri.findMany({
        where: { orangTuaId: user.id },
        select: { santriId: true }
      });
      santriIds = children.map(c => c.santriId);
    } else {
      return ApiResponse.forbidden('Role tidak memiliki akses ke target');
    }

    const where: Record<string, unknown> = {};
    if (santriIds.length > 0) {
      where.santriId = { in: santriIds };
    } else {
      return ApiResponse.success([]);
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
    const { user, error } = await withAuth(request, ['super_admin', 'admin', 'guru']);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

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

    // Guru hanya boleh membuat target di halaqah miliknya
    if (user.role.name === 'guru') {
      const ownedHalaqah = await prisma.halaqah.findFirst({
        where: { id: Number(halaqahId), guruId: user.id },
        select: { id: true }
      });
      if (!ownedHalaqah) {
        return NextResponse.json(
          { error: 'Anda tidak memiliki akses ke halaqah ini' },
          { status: 403 }
        );
      }
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