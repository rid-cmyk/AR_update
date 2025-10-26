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

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const excludeAssigned = searchParams.get('excludeAssigned') === 'true';
    const excludeHalaqahId = searchParams.get('excludeHalaqahId');

    const whereClause: any = {};

    if (role) {
      whereClause.role = {
        name: role
      };
    }

    // If excludeAssigned is true and role is santri, filter out santri already assigned to halaqah
    if (excludeAssigned && role === 'santri') {
      const assignedSantriQuery: any = {};
      
      // If excludeHalaqahId is provided, exclude santri from that specific halaqah
      if (excludeHalaqahId) {
        assignedSantriQuery.halaqahId = {
          not: parseInt(excludeHalaqahId)
        };
      }

      // Get all santri IDs that are already assigned to halaqah (excluding the specified halaqah if provided)
      const assignedSantriIds = await prisma.halaqahSantri.findMany({
        where: assignedSantriQuery,
        select: {
          santriId: true
        }
      });

      const assignedIds = assignedSantriIds.map(hs => hs.santriId);

      if (assignedIds.length > 0) {
        whereClause.id = {
          notIn: assignedIds
        };
      }
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        namaLengkap: true,
        role: {
          select: {
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