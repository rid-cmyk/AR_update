import prisma from '@/lib/database/prisma';
import { NextRequest, NextResponse } from 'next/server';

// UPDATE hafalan
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Hafalan ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const { santriId, surat, ayatMulai, ayatSelesai, status, tanggal } = body;

    if (ayatMulai > ayatSelesai) {
      return NextResponse.json({ error: 'Ayat mulai tidak boleh lebih besar dari ayat selesai' }, { status: 400 });
    }

    // Verify that the user has permission to update this hafalan (guru can only update their santri's hafalan)
    const token = req.headers.get('cookie')?.split('auth_token=')[1]?.split(';')[0];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mysecretkey") as any;
    const userId = decoded.id;

    // Get the hafalan to check ownership
    const existingHafalan = await prisma.hafalan.findUnique({
      where: { id: Number(id) },
      include: {
        santri: {
          include: {
            HalaqahSantri: {
              include: {
                halaqah: true
              }
            }
          }
        }
      }
    });

    if (!existingHafalan) {
      return NextResponse.json({ error: 'Hafalan not found' }, { status: 404 });
    }

    // Check if user is the guru of this santri's halaqah
    const isAuthorized = existingHafalan.santri.HalaqahSantri.some((hs: any) => hs.halaqah.guruId === userId);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized to update this hafalan' }, { status: 403 });
    }

    const hafalan = await prisma.hafalan.update({
      where: { id: Number(id) },
      data: {
        santriId: Number(santriId),
        surat,
        ayatMulai: Number(ayatMulai),
        ayatSelesai: Number(ayatSelesai),
        status,
        tanggal
      },
      include: {
        santri: true
      }
    });

    return NextResponse.json(hafalan);
  } catch (error: any) {
    console.error('PUT /api/hafalan/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update hafalan', detail: error.message }, { status: 500 });
  }
}

// DELETE hafalan
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Hafalan ID is required' }, { status: 400 });
    }

    await prisma.hafalan.delete({ where: { id: Number(id) } });

    return NextResponse.json({ message: 'Hafalan deleted' });
  } catch (error: any) {
    console.error('DELETE /api/hafalan/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete hafalan', detail: error.message }, { status: 500 });
  }
}