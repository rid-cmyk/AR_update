import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { StatusTarget } from '@prisma/client';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json();
    const { santriId, surat, ayatTarget, deadline, status } = body;

    let mappedStatus: StatusTarget = StatusTarget.belum;
    if (status === 'proses') mappedStatus = StatusTarget.proses;
    else if (status === 'selesai') mappedStatus = StatusTarget.selesai;

    const target = await prisma.targetHafalan.update({
      where: { id: Number(id) },
      data: {
        santriId: santriId ? Number(santriId) : undefined,
        surat: surat || undefined,
        ayatTarget: ayatTarget ? Number(ayatTarget) : undefined,
        deadline: deadline ? new Date(deadline) : undefined,
        status: mappedStatus
      },
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        }
      }
    });

    return NextResponse.json(target);
  } catch (error) {
    console.error('PUT /api/target/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update target' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    await prisma.targetHafalan.delete({
      where: { id: Number(id) }
    });

    return NextResponse.json({ message: 'Target deleted' });
  } catch (error) {
    console.error('DELETE /api/target/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete target' },
      { status: 500 }
    );
  }
}