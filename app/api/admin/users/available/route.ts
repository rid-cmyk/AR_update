import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';

export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error);
    }

    // Ensure user is admin or super-admin
    if (!['admin', 'super-admin'].includes(user.role.name)) {
      return ApiResponse.forbidden('Access denied');
    }

    const { searchParams } = new URL(request.url);
    const halaqahId = searchParams.get('halaqahId');

    if (!halaqahId) {
      return ApiResponse.badRequest('halaqahId is required');
    }

    // Get santri that are available (not assigned to any halaqah) 
    // OR assigned to the specified halaqah (for editing purposes)
    const availableSantri = await prisma.user.findMany({
      where: {
        role: {
          name: 'santri'
        },
        OR: [
          // Santri not assigned to any halaqah
          {
            HalaqahSantri: {
              none: {}
            }
          },
          // Santri assigned to the specified halaqah
          {
            HalaqahSantri: {
              some: {
                halaqahId: parseInt(halaqahId)
              }
            }
          }
        ]
      },
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

    return ApiResponse.success(availableSantri);

  } catch (error) {
    console.error('Error fetching available santri:', error);
    return ApiResponse.serverError('Failed to fetch available santri');
  }
}