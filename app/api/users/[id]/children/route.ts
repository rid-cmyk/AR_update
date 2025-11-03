import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Get children for ortu
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ortuId = parseInt(id);

    // Check if user exists and is ortu
    const ortu = await prisma.user.findUnique({
      where: { id: ortuId },
      include: {
        role: true
      }
    });

    if (!ortu) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    if (ortu.role.name.toLowerCase() !== 'ortu') {
      return NextResponse.json(
        { error: 'User bukan orang tua' },
        { status: 400 }
      );
    }

    // Get children
    const children = await prisma.orangTuaSantri.findMany({
      where: { orangTuaId: ortuId },
      include: {
        santri: {
          select: {
            id: true,
            username: true,
            namaLengkap: true,
            foto: true,
            role: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    const childrenData = children.map(relation => relation.santri);

    return NextResponse.json(childrenData);
  } catch (error) {
    console.error('Error fetching children:', error);
    return NextResponse.json(
      { error: 'Failed to fetch children' },
      { status: 500 }
    );
  }
}

// PUT - Update children for ortu
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { children } = await request.json();
    const { id } = await params;
    const ortuId = parseInt(id);

    // Check if user exists and is ortu
    const ortu = await prisma.user.findUnique({
      where: { id: ortuId },
      include: {
        role: true
      }
    });

    if (!ortu) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    if (ortu.role.name.toLowerCase() !== 'ortu') {
      return NextResponse.json(
        { error: 'User bukan orang tua' },
        { status: 400 }
      );
    }

    // Validate children are santri
    if (children && children.length > 0) {
      const santriCheck = await prisma.user.findMany({
        where: {
          id: { in: children },
          role: {
            name: 'santri'
          }
        }
      });

      if (santriCheck.length !== children.length) {
        return NextResponse.json(
          { error: 'Semua anak harus berupa santri' },
          { status: 400 }
        );
      }
    }

    // Delete existing relationships
    await prisma.orangTuaSantri.deleteMany({
      where: { orangTuaId: ortuId }
    });

    // Create new relationships
    if (children && children.length > 0) {
      await prisma.orangTuaSantri.createMany({
        data: children.map((santriId: number) => ({
          orangTuaId: ortuId,
          santriId: santriId
        }))
      });
    }

    return NextResponse.json({
      message: 'Hubungan orang tua-anak berhasil diperbarui',
      ortuId,
      children
    });
  } catch (error) {
    console.error('Error updating children:', error);
    return NextResponse.json(
      { error: 'Failed to update children' },
      { status: 500 }
    );
  }
}