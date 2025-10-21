import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error);
    }

    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);
    if (isNaN(userId)) {
      return ApiResponse.error('Invalid user ID', 400);
    }

    // Check if user exists and is a parent
    const parentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!parentUser) {
      return ApiResponse.notFound('User not found');
    }

    if (parentUser.role.name.toLowerCase() !== 'ortu') {
      return ApiResponse.error('User is not a parent', 400);
    }

    // Get assigned santris
    const assignedSantris = await prisma.orangTuaSantri.findMany({
      where: { orangTuaId: userId },
      include: {
        santri: {
          select: {
            id: true,
            username: true,
            namaLengkap: true
          }
        }
      }
    });

    return ApiResponse.success(assignedSantris);

  } catch (error) {
    console.error('Error fetching assigned santris:', error);
    return ApiResponse.serverError('Failed to fetch assigned santris');
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const { assignedSantris } = body; // Array of santri IDs

    if (!Array.isArray(assignedSantris)) {
      return ApiResponse.error('assignedSantris must be an array', 400);
    }

    // Check if user exists and is a parent
    const parentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!parentUser) {
      return ApiResponse.notFound('User not found');
    }

    if (parentUser.role.name.toLowerCase() !== 'ortu') {
      return ApiResponse.error('User is not a parent', 400);
    }

    // Validate that all assigned santris exist and are actually santris
    for (const santriId of assignedSantris) {
      const santri = await prisma.user.findUnique({
        where: { id: santriId },
        include: { role: true }
      });

      if (!santri) {
        return ApiResponse.error(`Santri with ID ${santriId} not found`, 400);
      }

      if (santri.role.name.toLowerCase() !== 'santri') {
        return ApiResponse.error(`User with ID ${santriId} is not a santri`, 400);
      }
    }

    // Delete existing assignments
    await prisma.orangTuaSantri.deleteMany({
      where: { orangTuaId: userId }
    });

    // Create new assignments
    if (assignedSantris.length > 0) {
      const assignments = assignedSantris.map(santriId => ({
        orangTuaId: userId,
        santriId: santriId
      }));

      await prisma.orangTuaSantri.createMany({
        data: assignments
      });
    }

    return ApiResponse.success({ message: 'Assigned santris updated successfully' });

  } catch (error) {
    console.error('Error updating assigned santris:', error);
    return ApiResponse.serverError('Failed to update assigned santris');
  }
}