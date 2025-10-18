import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// GET announcements with filtering and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const targetAudience = searchParams.get('audience');
    const userId = searchParams.get('userId'); // for filtering visible announcements
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {
      // Hide expired announcements
      OR: [
        { tanggalKadaluarsa: null },
        { tanggalKadaluarsa: { gt: new Date() } }
      ]
    };

    // Search filter
    if (search) {
      where.OR = where.OR || [];
      where.OR.push(
        { judul: { contains: search, mode: 'insensitive' } },
        { isi: { contains: search, mode: 'insensitive' } }
      );
    }

    // Target audience filter (for viewing)
    if (userId && targetAudience !== 'all') {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        select: { role: { select: { name: true } } }
      });

      if (user) {
        const userRole = user.role.name;
        where.OR = where.OR || [];

        // Show announcements for user's role or 'semua'
        if (userRole === 'super-admin') {
          // Super admin sees all
        } else if (userRole === 'admin') {
          where.targetAudience = { in: ['semua', 'admin', 'guru', 'santri'] };
        } else if (userRole === 'guru') {
          where.targetAudience = { in: ['semua', 'guru'] };
        } else if (userRole === 'santri') {
          where.targetAudience = { in: ['semua', 'santri'] };
        }
      }
    }

    // Admin filter for management
    if (targetAudience && targetAudience !== 'all') {
      where.targetAudience = targetAudience;
    }

    const [pengumuman, total] = await Promise.all([
      prisma.pengumuman.findMany({
        where,
        include: {
          creator: {
            select: { id: true, namaLengkap: true, role: { select: { name: true } } }
          },
          dibacaOleh: {
            select: { userId: true, dibacaPada: true }
          }
        },
        orderBy: { tanggal: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.pengumuman.count({ where })
    ]);

    // Add read statistics
    const pengumumanWithStats = pengumuman.map(p => ({
      ...p,
      readCount: p.dibacaOleh.length,
      isRead: userId ? p.dibacaOleh.some(read => read.userId === parseInt(userId)) : false
    }));

    // Return just the array for frontend compatibility
    return NextResponse.json(pengumumanWithStats);
  } catch (error) {
    console.error('GET /api/pengumuman error:', error);
    return NextResponse.json({ error: 'Failed to fetch pengumuman' }, { status: 500 });
  }
}

// CREATE pengumuman
export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.headers.get('cookie')?.split('auth_token=')[1]?.split(';')[0];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: { select: { name: true } } }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Check if user can create announcements
    if (!['guru', 'admin', 'super-admin'].includes(user.role.name)) {
      return NextResponse.json({ error: 'Unauthorized to create announcements' }, { status: 403 });
    }

    const body = await request.json();
    const { judul, isi, tanggalKadaluarsa, targetAudience } = body;

    if (!judul || !isi) {
      return NextResponse.json({ error: 'Judul dan isi diperlukan' }, { status: 400 });
    }

    const pengumuman = await prisma.pengumuman.create({
      data: {
        judul: judul.trim(),
        isi: isi.trim(),
        tanggal: new Date(),
        tanggalKadaluarsa: tanggalKadaluarsa ? new Date(tanggalKadaluarsa) : null,
        targetAudience: targetAudience || 'all',
        createdBy: user.id
      },
      include: {
        creator: {
          select: { id: true, namaLengkap: true, role: { select: { name: true } } }
        }
      }
    });

    return NextResponse.json(pengumuman, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/pengumuman error:', error);
    return NextResponse.json({
      error: 'Failed to create pengumuman',
      details: error.message
    }, { status: 500 });
  }
}