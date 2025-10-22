import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// GET - Ambil halaqah yang diampu guru
export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.id;

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user || user.role.name !== 'guru') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get halaqah yang diampu guru
    const halaqahs = await prisma.halaqah.findMany({
      where: {
        guruId: userId
      },
      include: {
        guru: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        },
        santri: {
          include: {
            santri: {
              select: {
                id: true,
                namaLengkap: true,
                username: true
              }
            }
          }
        },
        jadwal: {
          orderBy: [
            { hari: 'asc' },
            { jamMulai: 'asc' }
          ]
        }
      },
      orderBy: {
        namaHalaqah: 'asc'
      }
    });

    // Format response
    const formattedHalaqahs = halaqahs.map(halaqah => ({
      id: halaqah.id,
      namaHalaqah: halaqah.namaHalaqah,
      deskripsi: halaqah.deskripsi,
      guru: halaqah.guru,
      jumlahSantri: halaqah.santri.length,
      santri: halaqah.santri.map(hs => hs.santri),
      jadwal: halaqah.jadwal.map(j => ({
        id: j.id,
        hari: j.hari,
        jamMulai: j.jamMulai.toTimeString().slice(0, 5),
        jamSelesai: j.jamSelesai.toTimeString().slice(0, 5)
      })),
      createdAt: halaqah.createdAt,
      updatedAt: halaqah.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: formattedHalaqahs
    });

  } catch (error) {
    console.error('Error fetching halaqah:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}