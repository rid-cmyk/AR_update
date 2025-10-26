import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { logHalaqahAction } from '@/lib/halaqah-logger';
import { withAuth } from '@/lib/api-helpers';

// GET halaqah by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid halaqah ID' }, { status: 400 });
    }

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
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid halaqah ID' }, { status: 400 });
    }

    const body = await request.json();
    const { namaHalaqah, deskripsi, guruId, santriIds } = body;

    console.log('Updating halaqah:', id, body);

    if (!namaHalaqah) {
      return NextResponse.json({ error: 'Nama halaqah is required' }, { status: 400 });
    }

    if (!santriIds || !Array.isArray(santriIds) || santriIds.length < 5) {
      return NextResponse.json({ error: 'At least 5 santri must be selected' }, { status: 400 });
    }

    // Check if any santri is already assigned to another halaqah (excluding current halaqah)
    const existingAssignments = await prisma.halaqahSantri.findMany({
      where: {
        santriId: {
          in: santriIds.map(id => Number(id))
        },
        halaqahId: {
          not: id
        }
      },
      include: {
        halaqah: true,
        santri: true
      }
    });

    if (existingAssignments.length > 0) {
      const conflictingSantri = existingAssignments.map(assignment => 
        `${assignment.santri.namaLengkap} (sudah di ${assignment.halaqah.namaHalaqah})`
      );
      return NextResponse.json({ 
        error: `Santri berikut sudah terdaftar di halaqah lain: ${conflictingSantri.join(', ')}` 
      }, { status: 400 });
    }

    // Check if halaqah exists
    const existingHalaqah = await prisma.halaqah.findUnique({
      where: { id }
    });

    if (!existingHalaqah) {
      return NextResponse.json({ error: 'Halaqah not found' }, { status: 404 });
    }

    // Update halaqah in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update halaqah basic info
      const updatedHalaqah = await tx.halaqah.update({
        where: { id },
        data: {
          namaHalaqah,
          ...(guruId && { guruId: Number(guruId) })
        }
      });

      // Remove existing santri assignments
      await tx.halaqahSantri.deleteMany({
        where: { halaqahId: id }
      });

      // Add new santri assignments
      if (santriIds && Array.isArray(santriIds) && santriIds.length > 0) {
        const tahunAkademik = new Date().getFullYear().toString();
        const semester = new Date().getMonth() < 6 ? 'S1' : 'S2';

        const santriAssignments = santriIds.map((santriId: number) => ({
          halaqahId: id,
          santriId: Number(santriId),
          tahunAkademik,
          semester: semester as 'S1' | 'S2'
        }));

        await tx.halaqahSantri.createMany({
          data: santriAssignments
        });
      }

      return updatedHalaqah;
    });

    // Get updated halaqah with relations
    const halaqahWithRelations = await prisma.halaqah.findUnique({
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

    if (!halaqahWithRelations) {
      throw new Error('Failed to retrieve updated halaqah');
    }

    // Log the action
    await logHalaqahAction({
      action: 'UPDATE',
      halaqahId: halaqahWithRelations.id,
      halaqahName: halaqahWithRelations.namaHalaqah,
      userId: user.id,
      details: { santriCount: halaqahWithRelations.santri.length, guruId }
    });

    return NextResponse.json({
      id: halaqahWithRelations.id,
      namaHalaqah: halaqahWithRelations.namaHalaqah,
      guru: halaqahWithRelations.guru,
      santri: halaqahWithRelations.santri.map((s: { santri: any }) => s.santri),
      jumlahSantri: halaqahWithRelations.santri.length
    });

  } catch (error: any) {
    console.error('PUT /api/halaqah/[id] error:', error);
    return NextResponse.json({
      error: 'Failed to update halaqah',
      details: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}

// DELETE halaqah
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid halaqah ID' }, { status: 400 });
    }

    // Check if halaqah exists
    const existingHalaqah = await prisma.halaqah.findUnique({
      where: { id },
      include: {
        santri: true,
        jadwal: true,
        ujian: true
      }
    });

    if (!existingHalaqah) {
      return NextResponse.json({ error: 'Halaqah not found' }, { status: 404 });
    }

    // Check if halaqah has related data that prevents deletion
    if (existingHalaqah.ujian.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete halaqah with existing ujian records' 
      }, { status: 400 });
    }

    // Delete halaqah and related data in transaction
    await prisma.$transaction(async (tx) => {
      // Delete santri assignments
      await tx.halaqahSantri.deleteMany({
        where: { halaqahId: id }
      });

      // Delete jadwal
      await tx.jadwal.deleteMany({
        where: { halaqahId: id }
      });

      // Delete halaqah
      await tx.halaqah.delete({
        where: { id }
      });
    });

    // Log the action
    await logHalaqahAction({
      action: 'DELETE',
      halaqahId: id,
      halaqahName: existingHalaqah.namaHalaqah,
      userId: user.id,
      details: { santriCount: existingHalaqah.santri.length }
    });

    return NextResponse.json({ 
      message: 'Halaqah berhasil dihapus',
      deletedId: id 
    });

  } catch (error: any) {
    console.error('DELETE /api/halaqah/[id] error:', error);
    return NextResponse.json({
      error: 'Failed to delete halaqah',
      details: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}