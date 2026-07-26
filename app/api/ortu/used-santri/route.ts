import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { withAuth } from '@/lib/api-helpers';

// GET - Get list of santri IDs that are already assigned to orang tua
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await withAuth(request, ['super_admin', 'admin']);
    if (authError || !user) {
      return NextResponse.json(
        { error: authError || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all santri IDs that are currently assigned to any orang tua
    const usedSantriRelations = await prisma.orangTuaSantri.findMany({
      select: {
        santriId: true
      }
    });

    // Extract unique santri IDs
    const usedSantriIds = [...new Set(usedSantriRelations.map(relation => relation.santriId))];

    return NextResponse.json(usedSantriIds);
  } catch (error) {
    console.error('Error fetching used santri IDs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch used santri IDs' },
      { status: 500 }
    );
  }
}