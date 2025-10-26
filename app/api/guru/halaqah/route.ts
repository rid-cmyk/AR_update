import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// GET - Ambil daftar halaqah yang diampu guru (own halaqah only)
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

    // Get guru's own halaqah only
    const halaqahs = await prisma.halaqah.findMany({
      where: { guruId: userId },
      include: {
        guru: {
          select: {
            id: true,
            namaLengkap: true
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
        }
      },
      orderBy: {
        namaHalaqah: 'asc'
      }
    });

    // Format response
    const formattedHalaqahs = halaqahs.map(h => ({
      id: h.id,
      namaHalaqah: h.namaHalaqah,
      guru: h.guru,
      jumlahSantri: h.santri.length,
      santri: h.santri.map(s => s.santri)
    }));

    return NextResponse.json({
      success: true,
      data: formattedHalaqahs
    });

  } catch (error) {
    console.error('Error fetching guru halaqah:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}