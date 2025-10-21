import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error);
    }

    // Ensure user is guru
    if (user.role.name !== 'guru') {
      return ApiResponse.forbidden('Access denied');
    }

    const { id } = await params;
    const body = await request.json();
    const { santriId, surat, ayatTarget, deadline, status } = body;

    if (!id) {
      return ApiResponse.error('Target ID is required', 400);
    }

    // Verify that the target belongs to this guru's santri
    const existingTarget = await prisma.targetHafalan.findFirst({
      where: {
        id: Number(id),
        santri: {
          HalaqahSantri: {
            some: {
              halaqah: {
                guruId: user.id
              }
            }
          }
        }
      }
    });

    if (!existingTarget) {
      return ApiResponse.forbidden('Target tidak ditemukan atau tidak memiliki akses');
    }

    // Update target
    const updatedTarget = await prisma.targetHafalan.update({
      where: { id: Number(id) },
      data: {
        santriId: santriId ? Number(santriId) : undefined,
        surat: surat || undefined,
        ayatTarget: ayatTarget ? Number(ayatTarget) : undefined,
        deadline: deadline ? new Date(deadline) : undefined,
        status: status || undefined
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

    return ApiResponse.success(updatedTarget);

  } catch (error) {
    console.error('Error updating target:', error);
    return ApiResponse.serverError('Failed to update target');
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error);
    }

    // Ensure user is guru
    if (user.role.name !== 'guru') {
      return ApiResponse.forbidden('Access denied');
    }

    const { id } = await params;

    if (!id) {
      return ApiResponse.error('Target ID is required', 400);
    }

    // Verify that the target belongs to this guru's santri
    const existingTarget = await prisma.targetHafalan.findFirst({
      where: {
        id: Number(id),
        santri: {
          HalaqahSantri: {
            some: {
              halaqah: {
                guruId: user.id
              }
            }
          }
        }
      }
    });

    if (!existingTarget) {
      return ApiResponse.forbidden('Target tidak ditemukan atau tidak memiliki akses');
    }

    // Delete target
    await prisma.targetHafalan.delete({
      where: { id: Number(id) }
    });

    return ApiResponse.success({ message: 'Target berhasil dihapus' });

  } catch (error) {
    console.error('Error deleting target:', error);
    return ApiResponse.serverError('Failed to delete target');
  }
}