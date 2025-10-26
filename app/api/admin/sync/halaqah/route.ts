import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';

// Endpoint untuk sinkronisasi dan validasi data halaqah
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

    const syncResults = {
      duplicateSantri: [],
      orphanedAssignments: [],
      halaqahWithoutSantri: [],
      santriWithoutHalaqah: [],
      fixed: []
    };

    // 1. Check for duplicate santri assignments
    const duplicateAssignments = await prisma.$queryRaw`
      SELECT santriId, COUNT(*) as count, 
             array_agg(halaqahId) as halaqahIds
      FROM "HalaqahSantri" 
      GROUP BY santriId 
      HAVING COUNT(*) > 1
    `;

    (syncResults as any).duplicateSantri = duplicateAssignments as any[];

    // 2. Check for orphaned halaqah assignments (santri doesn't exist)
    const orphanedAssignments = await prisma.halaqahSantri.findMany({
      where: {
        NOT: {
          santri: { id: { gt: 0 } }
        }
      },
      include: {
        halaqah: true
      }
    });

    (syncResults as any).orphanedAssignments = orphanedAssignments;

    // 3. Check for halaqah without santri
    const halaqahWithoutSantri = await prisma.halaqah.findMany({
      where: {
        santri: {
          none: {}
        }
      }
    });

    (syncResults as any).halaqahWithoutSantri = halaqahWithoutSantri;

    // 4. Check for santri without halaqah
    const santriWithoutHalaqah = await prisma.user.findMany({
      where: {
        role: {
          name: 'santri'
        },
        HalaqahSantri: {
          none: {}
        }
      },
      select: {
        id: true,
        namaLengkap: true,
        username: true
      }
    });

    (syncResults as any).santriWithoutHalaqah = santriWithoutHalaqah;

    // Auto-fix orphaned assignments
    if (orphanedAssignments.length > 0) {
      await prisma.halaqahSantri.deleteMany({
        where: {
          id: {
            in: orphanedAssignments.map(oa => oa.id)
          }
        }
      });
      (syncResults as any).fixed.push(`Removed ${orphanedAssignments.length} orphaned assignments`);
    }

    return NextResponse.json({
      message: 'Sync completed',
      results: syncResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error syncing halaqah data:', error);
    return NextResponse.json({
      error: 'Failed to sync halaqah data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint untuk melihat status sinkronisasi
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

    // Get summary statistics
    const stats = {
      totalHalaqah: await prisma.halaqah.count(),
      totalSantri: await prisma.user.count({
        where: { role: { name: 'santri' } }
      }),
      totalGuru: await prisma.user.count({
        where: { role: { name: 'guru' } }
      }),
      totalAssignments: await prisma.halaqahSantri.count(),
      halaqahWithGuru: await prisma.halaqah.count({
        where: { guruId: { gt: 0 } }
      }),
      santriAssigned: await prisma.user.count({
        where: {
          role: { name: 'santri' },
          HalaqahSantri: { some: {} }
        }
      })
    };

    return NextResponse.json({
      stats,
      lastSync: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting sync status:', error);
    return NextResponse.json({
      error: 'Failed to get sync status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}