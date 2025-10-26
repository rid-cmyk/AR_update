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

    if (!user || user.role.name !== 'santri') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const surat = searchParams.get('surat');

    const whereClause: any = {
      santriId: userId
    };

    // Filter by status if specified
    if (status && ['ziyadah', 'murojaah'].includes(status)) {
      whereClause.status = status;
    }

    // Filter by surat if specified
    if (surat) {
      whereClause.surat = {
        contains: surat,
        mode: 'insensitive'
      };
    }

    const skip = (page - 1) * limit;

    const [hafalan, total] = await Promise.all([
      prisma.hafalan.findMany({
        where: whereClause,
        orderBy: {
          tanggal: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.hafalan.count({ where: whereClause })
    ]);

    // Get statistics
    const stats = await prisma.hafalan.groupBy({
      by: ['status'],
      where: { santriId: userId },
      _count: {
        id: true
      }
    });

    const statistics = {
      total: total,
      ziyadah: stats.find(s => s.status === 'ziyadah')?._count.id || 0,
      murojaah: stats.find(s => s.status === 'murojaah')?._count.id || 0
    };

    return NextResponse.json({
      success: true,
      data: hafalan,
      statistics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching santri hafalan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}