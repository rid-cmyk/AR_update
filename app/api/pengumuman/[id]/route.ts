import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';

// GET pengumuman by ID
export async function GET(
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

    const pengumuman = await prisma.pengumuman.findUnique({
      where: { id },
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
            userId: user.id
          },
          select: {
            dibacaPada: true
          }
        },
        _count: {
          select: {
            dibacaOleh: true
          }
        }
      }
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

    // Mark as read if not already read
    if (pengumuman.dibacaOleh.length === 0) {
      await prisma.pengumumanRead.create({
        data: {
          pengumumanId: id,
          userId: user.id
        }
      });
    }

    const formatted = {
      id: pengumuman.id,
      judul: pengumuman.judul,
      isi: pengumuman.isi,
      tanggal: pengumuman.tanggal,
      tanggalKadaluarsa: pengumuman.tanggalKadaluarsa,
      targetAudience: pengumuman.targetAudience,
      creator: pengumuman.creator,
      isRead: pengumuman.dibacaOleh.length > 0,
      readCount: pengumuman._count.dibacaOleh,
      createdAt: pengumuman.createdAt,
      updatedAt: pengumuman.updatedAt
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('GET /api/pengumuman/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch pengumuman' }, { status: 500 });
  }
}

// UPDATE pengumuman
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error);
    }

    // Hanya admin dan super-admin yang bisa update pengumuman
    if (!['admin', 'super_admin'].includes(user.role.name)) {
      return ApiResponse.forbidden('Access denied');
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid pengumuman ID' }, { status: 400 });
    }

    const body = await request.json();
    const { judul, isi, targetAudience, tanggalKadaluarsa } = body;

    console.log('Updating pengumuman:', id, body);

    if (!judul || !isi) {
      return NextResponse.json({ 
        error: 'Judul dan isi pengumuman harus diisi' 
      }, { status: 400 });
    }

    if (!targetAudience) {
      return NextResponse.json({ 
        error: 'Target audience harus dipilih' 
      }, { status: 400 });
    }

    // Check if pengumuman exists
    const existingPengumuman = await prisma.pengumuman.findUnique({
      where: { id }
    });

    if (!existingPengumuman) {
      return NextResponse.json({ error: 'Pengumuman not found' }, { status: 404 });
    }

    // Validasi targetAudience
    const validTargets = ['semua', 'guru', 'santri', 'ortu', 'admin'];
    if (!validTargets.includes(targetAudience)) {
      return NextResponse.json({ 
        error: 'Target audience tidak valid' 
      }, { status: 400 });
    }

    // Update pengumuman
    const updatedPengumuman = await prisma.pengumuman.update({
      where: { id },
      data: {
        judul,
        isi,
        targetAudience: targetAudience as any,
        tanggalKadaluarsa: tanggalKadaluarsa ? new Date(tanggalKadaluarsa) : null,
        updatedAt: new Date()
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
        _count: {
          select: {
            dibacaOleh: true
          }
        }
      }
    });

    const formatted = {
      id: updatedPengumuman.id,
      judul: updatedPengumuman.judul,
      isi: updatedPengumuman.isi,
      tanggal: updatedPengumuman.tanggal,
      tanggalKadaluarsa: updatedPengumuman.tanggalKadaluarsa,
      targetAudience: updatedPengumuman.targetAudience,
      creator: updatedPengumuman.creator,
      isRead: false,
      readCount: updatedPengumuman._count.dibacaOleh,
      createdAt: updatedPengumuman.createdAt,
      updatedAt: updatedPengumuman.updatedAt
    };

    console.log('Pengumuman updated successfully:', formatted.id);
    return NextResponse.json(formatted);

  } catch (error: any) {
    console.error('PUT /api/pengumuman/[id] error:', error);
    return NextResponse.json({
      error: 'Failed to update pengumuman',
      details: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}

// DELETE pengumuman
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error);
    }

    // Hanya admin dan super-admin yang bisa delete pengumuman
    if (!['admin', 'super_admin'].includes(user.role.name)) {
      return ApiResponse.forbidden('Access denied');
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid pengumuman ID' }, { status: 400 });
    }

    // Check if pengumuman exists
    const existingPengumuman = await prisma.pengumuman.findUnique({
      where: { id }
    });

    if (!existingPengumuman) {
      return NextResponse.json({ error: 'Pengumuman not found' }, { status: 404 });
    }

    // Enhanced delete with notification cleanup
    await prisma.$transaction(async (tx) => {
      // Delete related notifications first
      const deletedNotifications = await tx.notifikasi.deleteMany({
        where: {
          type: 'pengumuman',
          refId: id
        }
      });

      // Delete pengumuman (cascade will handle PengumumanRead records)
      await tx.pengumuman.delete({
        where: { id }
      });

      console.log(`Deleted pengumuman ${id} and ${deletedNotifications.count} related notifications`);
    });

    console.log('Pengumuman and related notifications deleted successfully:', id);
    return NextResponse.json({ 
      message: 'Pengumuman dan notifikasi terkait berhasil dihapus',
      deletedId: id 
    });

  } catch (error: any) {
    console.error('DELETE /api/pengumuman/[id] error:', error);
    return NextResponse.json({
      error: 'Failed to delete pengumuman',
      details: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}