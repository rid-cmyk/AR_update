import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

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

    // Get pengumuman for guru (semua + guru)
    const pengumuman = await prisma.pengumuman.findMany({
      where: {
        AND: [
          {
            OR: [
              { targetAudience: 'semua' },
              { targetAudience: 'guru' }
            ]
          },
          {
            // Only show active announcements (not expired)
            OR: [
              { tanggalKadaluarsa: null },
              { tanggalKadaluarsa: { gte: new Date() } }
            ]
          }
        ]
      },
      include: {
        creator: {
          select: {
            namaLengkap: true
          }
        },
        dibacaOleh: {
          where: {
            userId: userId
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ 
      success: true,
      data: pengumuman
    });

  } catch (error) {
    console.error('Error fetching guru pengumuman:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

