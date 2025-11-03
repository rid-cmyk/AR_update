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
    if (!['admin', 'super_admin'].includes(user.role.name)) {
      return ApiResponse.forbidden('Access denied');
    }

    // Get all santri IDs that are already assigned to any ortu
    const assignedSantris = await prisma.orangTuaSantri.findMany({
      select: {
        santriId: true
      }
    });

    // Extract just the IDs
    const assignedSantriIds = assignedSantris.map(item => item.santriId);

    return ApiResponse.success(assignedSantriIds);

  } catch (error) {
    console.error('Error fetching assigned santris:', error);
    return ApiResponse.serverError('Failed to fetch assigned santris');
  }
}