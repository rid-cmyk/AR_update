import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error);
    }

    // Ensure user is admin or super-admin
    if (!['admin', 'super-admin'].includes(user.role.name)) {
      return ApiResponse.forbidden('Access denied');
    }

    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);
    if (isNaN(userId)) {
      return ApiResponse.error('Invalid user ID', 400);
    }

    const body = await request.json();
    const { username, password, namaLengkap, passCode, noTlp, roleId, assignedSantris } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return ApiResponse.notFound('User not found');
    }

    // Check for duplicate username (excluding current user)
    if (username && username !== existingUser.username) {
      const duplicateUser = await prisma.user.findUnique({
        where: { username }
      });

      if (duplicateUser) {
        return ApiResponse.error('Username already exists', 400);
      }
    }

    const updateData: any = {
      namaLengkap,
      passCode,
      noTlp,
    };

    if (username) updateData.username = username;
    if (password) updateData.password = password; // This should be hashed in production
    if (roleId) updateData.roleId = Number(roleId);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        namaLengkap: true,
        noTlp: true,
        role: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Update santri assignments for ortu users
    if (assignedSantris !== undefined) {
      // Delete existing assignments
      await prisma.orangTuaSantri.deleteMany({
        where: { orangTuaId: userId }
      });

      // Create new assignments if any
      if (assignedSantris.length > 0) {
        const ortuSantriData = assignedSantris.map((santriId: number) => ({
          orangTuaId: userId,
          santriId: Number(santriId)
        }));

        await prisma.orangTuaSantri.createMany({
          data: ortuSantriData,
          skipDuplicates: true
        });
      }
    }

    return ApiResponse.success(updatedUser);

  } catch (error) {
    console.error('Error updating user:', error);
    return ApiResponse.serverError('Failed to update user');
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error);
    }

    // Ensure user is admin or super-admin
    if (!['admin', 'super-admin'].includes(user.role.name)) {
      return ApiResponse.forbidden('Access denied');
    }

    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);
    if (isNaN(userId)) {
      return ApiResponse.error('Invalid user ID', 400);
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!existingUser) {
      return ApiResponse.notFound('User not found');
    }

    // Prevent deletion of super-admin
    if (existingUser.role.name === 'super-admin') {
      return ApiResponse.error('Cannot delete super-admin user', 400);
    }

    // Use transaction to handle cascade deletes
    await prisma.$transaction(async (tx) => {
      // Delete related records first to avoid foreign key constraints
      
      // Delete OrangTuaSantri relations (both as parent and child)
      await tx.orangTuaSantri.deleteMany({
        where: {
          OR: [
            { orangTuaId: userId },
            { santriId: userId }
          ]
        }
      });

      // Delete GuruPermission records
      await tx.guruPermission.deleteMany({
        where: { guruId: userId }
      });

      // Delete Absensi records
      await tx.absensi.deleteMany({
        where: { santriId: userId }
      });

      // Delete Hafalan records
      await tx.hafalan.deleteMany({
        where: { santriId: userId }
      });

      // Delete TargetHafalan records
      await tx.targetHafalan.deleteMany({
        where: { santriId: userId }
      });

      // Delete HalaqahSantri records
      await tx.halaqahSantri.deleteMany({
        where: { santriId: userId }
      });

      // Delete Prestasi records
      await tx.prestasi.deleteMany({
        where: { santriId: userId }
      });

      // Delete Ujian records
      await tx.ujian.deleteMany({
        where: { santriId: userId }
      });

      // Delete Notifikasi records
      await tx.notifikasi.deleteMany({
        where: { userId: userId }
      });

      // Delete AuditLog records
      await tx.auditLog.deleteMany({
        where: { userId: userId }
      });

      // Delete PengumumanRead records
      await tx.pengumumanRead.deleteMany({
        where: { userId: userId }
      });

      // Update Halaqah records if user is a guru (set guruId to null or reassign)
      await tx.halaqah.updateMany({
        where: { guruId: userId },
        data: { guruId: null } // This will need to be handled properly in production
      });

      // Update Pengumuman records (set createdBy to null or reassign)
      await tx.pengumuman.updateMany({
        where: { createdBy: userId },
        data: { createdBy: null } // This will need to be handled properly in production
      });

      // Finally delete the user
      await tx.user.delete({
        where: { id: userId }
      });
    });

    return ApiResponse.success({ 
      message: 'User and all related data deleted successfully',
      deletedUser: {
        id: existingUser.id,
        username: existingUser.username,
        namaLengkap: existingUser.namaLengkap,
        role: existingUser.role.name
      }
    });

  } catch (error: any) {
    console.error('Error deleting user:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2003') {
      return ApiResponse.error('Cannot delete user: still referenced by other records', 400);
    }
    
    if (error.code === 'P2025') {
      return ApiResponse.notFound('User not found');
    }

    return ApiResponse.serverError(`Failed to delete user: ${error.message}`);
  }
}