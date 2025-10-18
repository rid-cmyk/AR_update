import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Helper function to get user from token
async function getUserFromToken(request: NextRequest) {
  const token = request.headers.get('cookie')?.split('auth_token=')[1]?.split(';')[0];

  if (!token) return null;

  try {
    const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: { select: { name: true } } }
    });
  } catch {
    return null;
  }
}

// GET single announcement
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
    }

    const announcement = await prisma.pengumuman.findUnique({
      where: { id: parseInt(id) },
      include: {
        creator: {
          select: { id: true, namaLengkap: true, role: { select: { name: true } } }
        },
        dibacaOleh: {
          select: { userId: true, dibacaPada: true }
        }
      }
    });

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    return NextResponse.json(announcement);
  } catch (error: any) {
    console.error('GET /api/pengumuman/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch announcement' }, { status: 500 });
  }
}

// UPDATE pengumuman
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
    }

    // Check authorization
    const user = await getUserFromToken(req);
    if (!user || !['guru', 'admin', 'super-admin'].includes(user.role.name)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { judul, isi, tanggalKadaluarsa, targetAudience } = body;

    if (!judul || !isi) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const announcement = await prisma.pengumuman.update({
      where: { id: parseInt(id) },
      data: {
        judul: judul.trim(),
        isi: isi.trim(),
        tanggalKadaluarsa: tanggalKadaluarsa ? new Date(tanggalKadaluarsa) : null,
        targetAudience: targetAudience || 'semua'
      },
      include: {
        creator: {
          select: { id: true, namaLengkap: true, role: { select: { name: true } } }
        }
      }
    });

    return NextResponse.json(announcement);
  } catch (error: any) {
    console.error('PUT /api/pengumuman/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update announcement', details: error.message }, { status: 500 });
  }
}

// DELETE pengumuman
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
    }

    // Check authorization
    const user = await getUserFromToken(req);
    if (!user || !['guru', 'admin', 'super-admin'].includes(user.role.name)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.pengumuman.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ message: 'Announcement deleted successfully' });
  } catch (error: any) {
    console.error('DELETE /api/pengumuman/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete announcement', details: error.message }, { status: 500 });
  }
}

// POST mark as read
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
    }

    // Get user from token
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if announcement exists
    const announcement = await prisma.pengumuman.findUnique({
      where: { id: parseInt(id) }
    });

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    // Mark as read (upsert to avoid duplicates)
    await prisma.pengumumanRead.upsert({
      where: {
        pengumumanId_userId: {
          pengumumanId: parseInt(id),
          userId: user.id
        }
      },
      update: {
        dibacaPada: new Date()
      },
      create: {
        pengumumanId: parseInt(id),
        userId: user.id,
        dibacaPada: new Date()
      }
    });

    return NextResponse.json({ message: 'Marked as read' });
  } catch (error: any) {
    console.error('POST /api/pengumuman/[id]/read error:', error);
    return NextResponse.json({ error: 'Failed to mark as read', details: error.message }, { status: 500 });
  }
}