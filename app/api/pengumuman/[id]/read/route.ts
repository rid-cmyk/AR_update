import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';

// POST - Mark pengumuman as read
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error);
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid pengumuman ID' }, { status: 400 });
    }

    // Check if pengumuman exists and user has access
    const pengumuman = await prisma.pengumuman.findUnique({
      where: { id }
    });

    if (!pengumuman) {
      return NextResponse.json({ error: 'Pengumuman not found' }, { status: 404 });
    }

    // Check if user has access to this announcement
    const hasAccess = 
      ['admin', 'super_admin'].includes(user.role.name) ||
      pengumuman.targetAudience === 'semua' ||
      pengumuman.targetAudience === user.role.name;

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if already read
    const existingRead = await prisma.pengumumanRead.findUnique({
      where: {
        pengumumanId_userId: {
          pengumumanId: id,
          userId: user.id
        }
      }
    });

    if (existingRead) {
      return NextResponse.json({ 
        message: 'Pengumuman sudah dibaca sebelumnya',
        readAt: existingRead.dibacaPada
      });
    }

    // Mark as read
    const readRecord = await prisma.pengumumanRead.create({
      data: {
        pengumumanId: id,
        userId: user.id
      }
    });

    console.log(`User ${user.id} marked pengumuman ${id} as read`);
    return NextResponse.json({ 
      message: 'Pengumuman berhasil ditandai sebagai dibaca',
      readAt: readRecord.dibacaPada
    });

  } catch (error: any) {
    console.error('POST /api/pengumuman/[id]/read error:', error);
    return NextResponse.json({
      error: 'Failed to mark pengumuman as read',
      details: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}

// DELETE - Mark pengumuman as unread
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error);
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid pengumuman ID' }, { status: 400 });
    }

    // Delete read record
    await prisma.pengumumanRead.deleteMany({
      where: {
        pengumumanId: id,
        userId: user.id
      }
    });

    console.log(`User ${user.id} marked pengumuman ${id} as unread`);
    return NextResponse.json({ 
      message: 'Pengumuman berhasil ditandai sebagai belum dibaca'
    });

  } catch (error: any) {
    console.error('DELETE /api/pengumuman/[id]/read error:', error);
    return NextResponse.json({
      error: 'Failed to mark pengumuman as unread',
      details: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}