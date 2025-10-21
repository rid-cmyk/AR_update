import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { STATUS_TARGET } from '@/constants/constants';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { santriId, surat, ayatTarget, deadline, status } = body;

    // Verify user authorization for target updates
    const token = request.headers.get('cookie')?.split('auth_token=')[1]?.split(';')[0];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mysecretkey") as any;
    const userId = decoded.id;

    // Get the target to check ownership
    const existingTarget = await prisma.targetHafalan.findUnique({
      where: { id: Number(id) },
      include: {
        santri: {
          include: {
            HalaqahSantri: {
              include: {
                halaqah: true
              }
            }
          }
        }
      }
    });

    if (!existingTarget) {
      return NextResponse.json({ error: 'Target not found' }, { status: 404 });
    }

    // Check if user is the guru of this santri's halaqah
    const isAuthorized = existingTarget.santri.HalaqahSantri.some((hs: any) => hs.halaqah.guruId === userId);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized to update this target' }, { status: 403 });
    }

    const statusMap: Record<string, string> = {
      'belum': STATUS_TARGET.BELUM,
      'proses': STATUS_TARGET.PROSES,
      'selesai': STATUS_TARGET.SELESAI
    };
    const mappedStatus = statusMap[status] || STATUS_TARGET.BELUM;

    const target = await prisma.targetHafalan.update({
      where: { id: Number(id) },
      data: {
        santriId: santriId ? Number(santriId) : undefined,
        surat: surat || undefined,
        ayatTarget: ayatTarget ? Number(ayatTarget) : undefined,
        deadline: deadline ? new Date(deadline) : undefined,
        status: mappedStatus as any
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
    console.error('PUT /api/target/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update target' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await prisma.targetHafalan.delete({
      where: { id: Number(id) }
    });

    return NextResponse.json({ message: 'Target deleted' });
  } catch (error) {
    console.error('DELETE /api/target/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete target' },
      { status: 500 }
    );
  }
}