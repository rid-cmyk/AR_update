import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { logHalaqahAction } from '@/lib/halaqah-logger';
import { withAuth } from '@/lib/api-helpers';

// GET all halaqah
export async function GET() {
  try {
    const halaqah = await prisma.halaqah.findMany({
      include: {
        guru: true,
        santri: {
          include: {
            santri: true
          }
        }
      }
    });

    const formatted = halaqah.map(h => ({
      id: h.id,
      namaHalaqah: h.namaHalaqah,
      guru: h.guru,
      santri: h.santri.map(s => s.santri),
      jumlahSantri: h.santri.length
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('GET /api/halaqah error:', error);
    return NextResponse.json({ error: 'Failed to fetch halaqah' }, { status: 500 });
  }
}

// CREATE halaqah
export async function POST(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { namaHalaqah, deskripsi, guruId, santriIds } = body;

    console.log('Received halaqah data:', body);

    if (!namaHalaqah) {
      return NextResponse.json({ error: 'Nama halaqah is required' }, { status: 400 });
    }

    if (!santriIds || !Array.isArray(santriIds) || santriIds.length < 5) {
      return NextResponse.json({ error: 'At least 5 santri must be selected' }, { status: 400 });
    }

    // Check if any santri is already assigned to another halaqah
    const existingAssignments = await prisma.halaqahSantri.findMany({
      where: {
        santriId: {
          in: santriIds.map(id => Number(id))
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

    // Create halaqah
    const halaqah = await prisma.halaqah.create({
      data: {
        namaHalaqah,
        ...(guruId && { guruId: Number(guruId) })
      }
    });

    console.log('Created halaqah:', halaqah.id, halaqah.namaHalaqah);

    // Assign santri to halaqah if provided
    if (santriIds && Array.isArray(santriIds) && santriIds.length > 0) {
      const tahunAkademik = new Date().getFullYear().toString();
      const semester = new Date().getMonth() < 6 ? 'S1' : 'S2';

      const santriAssignments = santriIds.map((santriId: number) => ({
        halaqahId: halaqah.id,
        santriId: Number(santriId),
        tahunAkademik,
        semester: semester as 'S1' | 'S2'
      }));

      await prisma.halaqahSantri.createMany({
        data: santriAssignments
      });

      console.log(`Assigned ${santriAssignments.length} santri to halaqah ${halaqah.id}`);
    }

    // Get the created halaqah with relations
    const halaqahWithRelations = await prisma.halaqah.findUnique({
      where: { id: halaqah.id },
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
      throw new Error('Failed to retrieve created halaqah');
    }

    // Log the action
    await logHalaqahAction({
      action: 'CREATE',
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
    console.error('POST /api/halaqah error:', error);
    return NextResponse.json({
      error: 'Failed to create halaqah',
      details: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}