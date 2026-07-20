import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = verifyToken<Record<string, unknown>>(token);
    const userId = typeof decoded.id === 'string' ? parseInt(decoded.id) : (decoded.id as number);

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get pengumuman for santri
    const pengumuman = await prisma.pengumuman.findMany({
      where: {
        OR: [
          { targetAudience: 'semua' },
          { targetAudience: 'santri' }
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
    console.error('Error fetching pengumuman:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

