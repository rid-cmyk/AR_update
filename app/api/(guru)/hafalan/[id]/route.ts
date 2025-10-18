import prisma from '@/lib/prisma';
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