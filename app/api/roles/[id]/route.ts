import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const roleId = parseInt(resolvedParams.id);
    if (isNaN(roleId)) {
      return ApiResponse.error('Invalid role ID', 400);
    }

    // Check if role exists and has users
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        _count: {
          select: { users: true }
        }
      }
    });

    if (!role) {
      return ApiResponse.error('Role not found', 404);
    }

    // Prevent deletion if role has users
    if (role._count.users > 0) {
      return ApiResponse.error('Cannot delete role with existing users. Please reassign or delete users first.', 400);
    }

    // Delete the role
    await prisma.role.delete({
      where: { id: roleId }
    });

    return ApiResponse.success({ message: 'Role deleted successfully' });

  } catch (error) {
    console.error('Error deleting role:', error);
    return ApiResponse.serverError('Failed to delete role');
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error);
    }

    // Ensure user is admin or super-admin
    if (!['admin', 'super-admin'].includes(user.role.name)) {
      return ApiResponse.forbidden('Access denied');
    }

    const resolvedParams2 = await params;
    const roleId = parseInt(resolvedParams2.id);
    if (isNaN(roleId)) {
      return ApiResponse.error('Invalid role ID', 400);
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return ApiResponse.error('Role name is required', 400);
    }

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!existingRole) {
      return ApiResponse.error('Role not found', 404);
    }

    // Check for duplicate role name (excluding current role)
    const duplicateRole = await prisma.role.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive'
        },
        id: {
          not: roleId
        }
      }
    });

    if (duplicateRole) {
      return ApiResponse.error('Role name already exists', 400);
    }

    // Update the role
    const updatedRole = await prisma.role.update({
      where: { id: roleId },
      data: { name: name.trim() },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    const roleWithCount = {
      id: updatedRole.id,
      name: updatedRole.name,
      userCount: updatedRole._count.users
    };

    return ApiResponse.success(roleWithCount);

  } catch (error) {
    console.error('Error updating role:', error);
    return ApiResponse.serverError('Failed to update role');
  }
}