import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

// GET - Get detailed santri assignments with parent information
export async function GET() {
  try {
    // Get all santri assignments with parent details
    const assignments = await prisma.orangTuaSantri.findMany({
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
    });

    // Group by santri for easier lookup
    const santriAssignments = assignments.reduce((acc, assignment) => {
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

    return NextResponse.json(santriAssignments);
  } catch (error) {
    console.error('Error fetching santri assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch santri assignments' },
      { status: 500 }
    );
  }
}