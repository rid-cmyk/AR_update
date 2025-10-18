import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET single halaqah
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    const halaqah = await prisma.halaqah.findUnique({
      where: { id },
      include: {
        guru: true,
        santri: {
          include: {
            santri: true
          }
        }
      }
    });

    if (!halaqah) {
      return NextResponse.json({ error: 'Halaqah not found' }, { status: 404 });
    }

    const formatted = {
      id: halaqah.id,
      namaHalaqah: halaqah.namaHalaqah,
      guru: halaqah.guru,
      santri: halaqah.santri.map(s => s.santri),
      jumlahSantri: halaqah.santri.length
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('GET /api/halaqah/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch halaqah' }, { status: 500 });
  }
}

// UPDATE halaqah
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();
    const { namaHalaqah, guruId, santriIds, tahunAkademik, semester } = body;

    if (!namaHalaqah || !guruId || !santriIds || !tahunAkademik || !semester) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if halaqah exists
    const existingHalaqah = await prisma.halaqah.findUnique({
      where: { id }
    });

    if (!existingHalaqah) {
      return NextResponse.json({ error: 'Halaqah not found' }, { status: 404 });
    }

    // Update halaqah basic info
    const updatedHalaqah = await prisma.halaqah.update({
      where: { id },
      data: {
        namaHalaqah,
        guruId: Number(guruId)
      }
    });

    // Delete existing santri relationships
    await prisma.halaqahSantri.deleteMany({
      where: { halaqahId: id }
    });

    // Create new santri relationships
    const halaqahSantriData = santriIds.map((santriId: number) => ({
      halaqahId: id,
      santriId: Number(santriId),
      tahunAkademik,
      semester: semester as 'S1' | 'S2'
    }));

    await prisma.halaqahSantri.createMany({
      data: halaqahSantriData
    });

    return NextResponse.json(updatedHalaqah);
  } catch (error: any) {
    console.error('PUT /api/halaqah/[id] error:', error);
    return NextResponse.json({
      error: 'Failed to update halaqah',
      details: error.message
    }, { status: 500 });
  }
}

// DELETE halaqah
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    // Check if halaqah exists
    const existingHalaqah = await prisma.halaqah.findUnique({
      where: { id }
    });

    if (!existingHalaqah) {
      return NextResponse.json({ error: 'Halaqah not found' }, { status: 404 });
    }

    // Delete related records first (due to foreign key constraints)
    await prisma.halaqahSantri.deleteMany({
      where: { halaqahId: id }
    });

    // Delete jadwal if any
    await prisma.jadwal.deleteMany({
      where: { halaqahId: id }
    });

    // Delete ujian if any
    await prisma.ujian.deleteMany({
      where: { halaqahId: id }
    });

    // Finally delete the halaqah
    await prisma.halaqah.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Halaqah deleted successfully' });
  } catch (error: any) {
    console.error('DELETE /api/halaqah/[id] error:', error);
    return NextResponse.json({
      error: 'Failed to delete halaqah',
      details: error.message
    }, { status: 500 });
  }
}