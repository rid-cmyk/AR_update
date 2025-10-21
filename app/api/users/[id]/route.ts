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
      where: { id: userId }
    });

    if (!existingUser) {
      return ApiResponse.notFound('User not found');
    }

    // Delete the user
    await prisma.user.delete({
      where: { id: userId }
    });

    return ApiResponse.success({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Error deleting user:', error);
    return ApiResponse.serverError('Failed to delete user');
  }
}