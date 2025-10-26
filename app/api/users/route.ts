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

    const users = await prisma.user.findMany({
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
      },
      orderBy: {
        namaLengkap: 'asc'
      }
    });

    return ApiResponse.success(users);

  } catch (error) {
    console.error('Error fetching users:', error);
    return ApiResponse.serverError('Failed to fetch users');
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
    const { username, password, namaLengkap, passCode, noTlp, roleId, assignedSantris } = body;

    // Check for duplicate username
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return ApiResponse.error('Username already exists', 400);
    }

    const newUser = await prisma.user.create({
      data: {
        username,
        password, // This should be hashed in production
        namaLengkap,
        passCode,
        noTlp,
        roleId: Number(roleId)
      },
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

    // If user is ortu and has assigned santris, create relationships
    if (assignedSantris && assignedSantris.length > 0) {
      const ortuSantriData = assignedSantris.map((santriId: number) => ({
        orangTuaId: newUser.id,
        santriId: Number(santriId)
      }));

      await prisma.orangTuaSantri.createMany({
        data: ortuSantriData,
        skipDuplicates: true
      });
    }

    return ApiResponse.success(newUser);

  } catch (error) {
    console.error('Error creating user:', error);
    return ApiResponse.serverError('Failed to create user');
  }
}