import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Get santri IDs that are already assigned to ortu
export async function GET() {
  try {
    const usedSantri = await prisma.orangTuaSantri.findMany({
      select: {
        santriId: true
      }
    });

    const usedSantriIds = usedSantri.map(relation => relation.santriId);

    return NextResponse.json(usedSantriIds);
  } catch (error) {
    console.error('Error fetching used santri:', error);
    return NextResponse.json(
      { error: 'Failed to fetch used santri' },
      { status: 500 }
    );
  }
}