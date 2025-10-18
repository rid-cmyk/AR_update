import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const halaqahId = parseInt(params.id);
    console.log('Fetching jadwal for halaqah ID:', halaqahId);

    if (isNaN(halaqahId)) {
      return NextResponse.json({ error: 'Invalid halaqah ID' }, { status: 400 });
    }

    const jadwal = await prisma.jadwal.findMany({
      where: {
        halaqahId: halaqahId
      },
      include: {
        halaqah: {
          include: {
            guru: true
          }
        }
      },
      orderBy: [
        { hari: 'asc' },
        { jamMulai: 'asc' }
      ]
    });

    console.log('Found jadwal:', jadwal);
    return NextResponse.json(jadwal);
  } catch (error) {
    console.error('GET /api/jadwal/halaqah/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch jadwal' }, { status: 500 });
  }
}