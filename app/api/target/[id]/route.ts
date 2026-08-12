import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { STATUS_TARGET } from '@/constants/constants';
import { withAuth } from '@/lib/api-helpers';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { santriId, surat, ayatTarget, deadline, status } = body;

    // Verify user authorization for target updates
    const { user, error } = await withAuth(request, ['super_admin', 'admin', 'guru']);
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: error === 'Insufficient permissions' ? 403 : 401 });
    }

    const userId = user.id;
    const roleName = user.role.name;

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

    // Guru hanya boleh mengubah target di halaqah miliknya
    if (roleName === 'guru') {
      const isAuthorized = existingTarget.santri.HalaqahSantri.some((hs: Record<string, unknown>) => (hs.halaqah as Record<string, unknown>).guruId === userId);
      if (!isAuthorized) {
        return NextResponse.json({ error: 'Unauthorized to update this target' }, { status: 403 });
      }
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
    const { user, error } = await withAuth(request, ['super_admin', 'admin', 'guru']);
    if (error || !user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: error === 'Insufficient permissions' ? 403 : 401 });
    }
    
    const { id } = await params;

    if (user.role.name === 'guru') {
      const existingTarget = await prisma.targetHafalan.findUnique({
        where: { id: Number(id) },
        include: {
          santri: {
            include: {
              HalaqahSantri: { include: { halaqah: true } }
            }
          }
        }
      });

      if (!existingTarget) {
        return NextResponse.json({ error: 'Target not found' }, { status: 404 });
      }

      const isAuthorized = existingTarget.santri.HalaqahSantri.some((hs: Record<string, unknown>) => (hs.halaqah as Record<string, unknown>).guruId === user.id);
      if (!isAuthorized) {
        return NextResponse.json({ error: 'Unauthorized to delete this target' }, { status: 403 });
      }
    }

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