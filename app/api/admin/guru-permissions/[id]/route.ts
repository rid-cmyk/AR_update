import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';

// DELETE - Hapus guru permission
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    // Hanya admin dan super-admin yang bisa hapus permission
    if (!['admin', 'super-admin'].includes(user.role.name)) {
      return ApiResponse.forbidden('Access denied');
    }

    const resolvedParams = await params;
    const permissionId = parseInt(resolvedParams.id);
    
    if (isNaN(permissionId)) {
      return ApiResponse.error('Invalid permission ID', 400);
    }

    // Get permission info sebelum dihapus
    const permission = await prisma.guruPermission.findUnique({
      where: { id: permissionId },
      include: {
        guru: {
          select: {
            namaLengkap: true
          }
        },
        halaqah: {
          select: {
            namaHalaqah: true
          }
        }
      }
    });

    if (!permission) {
      return ApiResponse.notFound('Permission tidak ditemukan');
    }

    // Delete permission
    await prisma.guruPermission.delete({
      where: { id: permissionId }
    });

    // Log activity
    await prisma.auditLog.create({
      data: {
        action: 'DELETE_GURU_PERMISSION',
        keterangan: `${user.namaLengkap} menghapus permission ${permission.guru.namaLengkap} untuk halaqah ${permission.halaqah.namaHalaqah}`,
        userId: user.id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Permission berhasil dihapus'
    });

  } catch (error: any) {
    console.error('DELETE /api/admin/guru-permissions/[id] error:', error);
    return ApiResponse.serverError('Failed to delete guru permission');
  }
}

// PUT - Update guru permission
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    // Hanya admin dan super-admin yang bisa update permission
    if (!['admin', 'super-admin'].includes(user.role.name)) {
      return ApiResponse.forbidden('Access denied');
    }

    const resolvedParams = await params;
    const permissionId = parseInt(resolvedParams.id);
    
    if (isNaN(permissionId)) {
      return ApiResponse.error('Invalid permission ID', 400);
    }

    const body = await request.json();
    const { canAbsensi, canHafalan, canTarget, isActive } = body;

    // Check if permission exists
    const existingPermission = await prisma.guruPermission.findUnique({
      where: { id: permissionId }
    });

    if (!existingPermission) {
      return ApiResponse.notFound('Permission tidak ditemukan');
    }

    // Update permission
    const updatedPermission = await prisma.guruPermission.update({
      where: { id: permissionId },
      data: {
        canAbsensi: canAbsensi ?? existingPermission.canAbsensi,
        canHafalan: canHafalan ?? existingPermission.canHafalan,
        canTarget: canTarget ?? existingPermission.canTarget,
        isActive: isActive ?? existingPermission.isActive
      },
      include: {
        guru: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        },
        halaqah: {
          select: {
            id: true,
            namaHalaqah: true
          }
        }
      }
    });

    // Log activity
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_GURU_PERMISSION',
        keterangan: `${user.namaLengkap} mengupdate permission ${updatedPermission.guru.namaLengkap} untuk halaqah ${updatedPermission.halaqah.namaHalaqah}`,
        userId: user.id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Permission berhasil diupdate',
      data: updatedPermission
    });

  } catch (error: any) {
    console.error('PUT /api/admin/guru-permissions/[id] error:', error);
    return ApiResponse.serverError('Failed to update guru permission');
  }
}