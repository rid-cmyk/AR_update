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

    console.log('🔍 Pengumuman Auth Check:', {
      userId: userId,
      userName: user?.namaLengkap,
      userRole: user?.role.name,
      decodedRole: decoded.role
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check for both 'ortu' and 'orang_tua' role names
    const isOrtu = user.role.name === 'ortu' || user.role.name === 'orang_tua';
    if (!isOrtu) {
      console.log('❌ Access denied - Role mismatch:', user.role.name);
      return NextResponse.json({ 
        error: 'Access denied - Only ortu can access',
        userRole: user.role.name 
      }, { status: 403 });
    }

    // Get pengumuman for orang tua (semua + ortu)
    const pengumuman = await prisma.pengumuman.findMany({
      where: {
        AND: [
          {
            OR: [
              { targetAudience: 'semua' },
              { targetAudience: 'ortu' }
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
            id: true,
            namaLengkap: true,
            role: {
              select: {
                name: true
              }
            }
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

    // Transform data to include isRead flag
    const transformedPengumuman = pengumuman.map(p => ({
      id: p.id,
      judul: p.judul,
      isi: p.isi,
      tanggal: p.tanggal.toISOString(),
      tanggalKadaluarsa: p.tanggalKadaluarsa?.toISOString(),
      targetAudience: p.targetAudience,
      creator: p.creator,
      isRead: p.dibacaOleh.length > 0,
      createdAt: p.createdAt.toISOString()
    }));

    return NextResponse.json({ 
      success: true,
      data: transformedPengumuman
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching ortu pengumuman:', error);
    
    // Return empty array instead of error to prevent UI crash
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Internal server error',
      data: []
    }, { status: 200 }); // Return 200 with empty data instead of 500
  } finally {
    await prisma.$disconnect();
  }
}