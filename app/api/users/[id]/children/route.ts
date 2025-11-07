import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

// GET - Get children (santri) of a specific orang tua
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    // Check if user exists and is ortu
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    if (user.role.name.toLowerCase() !== 'ortu') {
      return NextResponse.json(
        { error: 'User bukan orang tua' },
        { status: 400 }
      );
    }

    // Get children of this orang tua
    const children = await prisma.orangTuaSantri.findMany({
      where: { orangTuaId: userId },
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true,
            foto: true
          }
        }
      }
    });

    // Return array of santri IDs for form compatibility
    const childrenIds = children.map(child => child.santriId);

    return NextResponse.json(childrenIds);
  } catch (error) {
    console.error('Error fetching user children:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user children' },
      { status: 500 }
    );
  }
}