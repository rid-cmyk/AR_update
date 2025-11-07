import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

// POST - Trigger refresh of santri assignments (for real-time updates)
export async function POST() {
  try {
    // Get fresh data for both used santri IDs and detailed assignments
    const [usedSantriRelations, detailedAssignments] = await Promise.all([
      // Get used santri IDs
      prisma.orangTuaSantri.findMany({
        select: {
          santriId: true
        }
      }),
      
      // Get detailed assignments
      prisma.orangTuaSantri.findMany({
        include: {
          santri: {
            select: {
              id: true,
              namaLengkap: true,
              username: true,
              foto: true
            }
          },
          orangTua: {
            select: {
              id: true,
              namaLengkap: true,
              username: true
            }
          }
        }
      })
    ]);

    // Process used santri IDs
    const usedSantriIds = [...new Set(usedSantriRelations.map(relation => relation.santriId))];

    // Process detailed assignments
    const santriAssignments = detailedAssignments.reduce((acc, assignment) => {
      const santriId = assignment.santriId;
      if (!acc[santriId]) {
        acc[santriId] = {
          santri: assignment.santri,
          parents: []
        };
      }
      acc[santriId].parents.push(assignment.orangTua);
      return acc;
    }, {} as Record<number, { santri: any; parents: any[] }>);

    return NextResponse.json({
      usedSantriIds,
      santriAssignments,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error refreshing assignments:', error);
    return NextResponse.json(
      { error: 'Failed to refresh assignments' },
      { status: 500 }
    );
  }
}