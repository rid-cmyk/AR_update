import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

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
    const body = await request.json();
    const { namaHalaqah, deskripsi, guruId, santriIds } = body;

    console.log('Received halaqah data:', body);

    if (!namaHalaqah) {
      return NextResponse.json({ error: 'Nama halaqah is required' }, { status: 400 });
    }

    if (!santriIds || !Array.isArray(santriIds) || santriIds.length === 0) {
      return NextResponse.json({ error: 'At least one santri must be selected' }, { status: 400 });
    }

    // Create halaqah
    const halaqah = await prisma.halaqah.create({
      data: {
        namaHalaqah,
        ...(guruId && { guruId: Number(guruId) })
      }
    });

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