import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET all jadwal
export async function GET() {
  try {
    const jadwal = await prisma.jadwal.findMany({
      include: {
        halaqah: {
          include: {
            guru: true
          }
        }
      },
      orderBy: { jamMulai: 'asc' }
    });

    return NextResponse.json(jadwal);
  } catch (error) {
    console.error('GET /api/jadwal error:', error);
    return NextResponse.json({ error: 'Failed to fetch jadwal' }, { status: 500 });
  }
}

// CREATE jadwal
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { hari, waktuMulai, waktuSelesai, halaqahId, materi } = body;

    console.log('Received jadwal data:', body);

    if (!hari || !waktuMulai || !waktuSelesai || !halaqahId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check for conflicts
    const conflict = await prisma.jadwal.findFirst({
      where: {
        hari: hari as any, // Cast to Hari enum
        halaqahId: Number(halaqahId),
        OR: [
          {
            AND: [
              { jamMulai: { lte: new Date(`1970-01-01T${waktuMulai}:00Z`) } },
              { jamSelesai: { gt: new Date(`1970-01-01T${waktuMulai}:00Z`) } }
            ]
          },
          {
            AND: [
              { jamMulai: { lt: new Date(`1970-01-01T${waktuSelesai}:00Z`) } },
              { jamSelesai: { gte: new Date(`1970-01-01T${waktuSelesai}:00Z`) } }
            ]
          }
        ]
      }
    });

    if (conflict) {
      return NextResponse.json({ error: 'Jadwal bentrok dengan jadwal lain' }, { status: 400 });
    }

    const jadwal = await prisma.jadwal.create({
      data: {
        hari: hari as any, // Cast to Hari enum
        jamMulai: new Date(`1970-01-01T${waktuMulai}:00Z`),
        jamSelesai: new Date(`1970-01-01T${waktuSelesai}:00Z`),
        halaqahId: Number(halaqahId)
      },
      include: {
        halaqah: {
          include: {
            guru: true
          }
        }
      }
    });

    return NextResponse.json(jadwal);
  } catch (error: any) {
    console.error('POST /api/jadwal error:', error);
    return NextResponse.json({
      error: 'Failed to create jadwal',
      details: error.message
    }, { status: 500 });
  }
}