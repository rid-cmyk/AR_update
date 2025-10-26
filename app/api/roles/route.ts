import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';

export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    // Ensure user is admin or super-admin
    if (!['admin', 'super-admin'].includes(user.role.name)) {
      return ApiResponse.forbidden('Access denied');
    }

    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform the data to include userCount
    const rolesWithCount = roles.map(role => ({
      id: role.id,
      name: role.name,
      userCount: role._count.users
    }));

    return ApiResponse.success(rolesWithCount);

  } catch (error) {
    console.error('Error fetching roles:', error);
    return ApiResponse.serverError('Failed to fetch roles');
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    // Ensure user is admin or super-admin
    if (!['admin', 'super-admin'].includes(user.role.name)) {
      return ApiResponse.forbidden('Access denied');
    }

    const body = await request.json();
    const { name } = body;

    // Check for duplicate role name
    const existingRole = await prisma.role.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    });

    if (existingRole) {
      return ApiResponse.error('Role name already exists', 400);
    }

    const newRole = await prisma.role.create({
      data: {
        name: name.trim()
      },
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
      id: newRole.id,
      name: newRole.name,
      userCount: newRole._count.users
    };

    return ApiResponse.success(roleWithCount);

  } catch (error) {
    console.error('Error creating role:', error);
    return ApiResponse.serverError('Failed to create role');
  }
}