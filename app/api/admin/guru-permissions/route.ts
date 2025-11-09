import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';

// GET - Ambil semua guru permissions
export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    // Hanya admin dan super-admin yang bisa akses
    if (!['admin', 'super_admin'].includes(user.role.name)) {
      return ApiResponse.forbidden('Access denied');
    }

    const { searchParams } = new URL(request.url);
    const guruId = searchParams.get('guruId');

    const whereClause: any = {};
    
    if (guruId) {
      whereClause.guruId = parseInt(guruId);
    }

    const permissions = await prisma.guruPermission.findMany({
      where: whereClause,
      include: {
        guru: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        },
        halaqah: {
          select: {
            id: true,
            namaHalaqah: true,
            guru: {
              select: {
                namaLengkap: true
              }
            }
          }
        }
      },
      orderBy: [
        { guru: { namaLengkap: 'asc' } },
        { halaqah: { namaHalaqah: 'asc' } }
      ]
    });

    return NextResponse.json({
      success: true,
      data: permissions
    });

  } catch (error: any) {
    console.error('GET /api/admin/guru-permissions error:', error);
    return ApiResponse.serverError('Failed to fetch guru permissions');
  }
}

// POST - Buat atau update guru permission
export async function POST(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    // Hanya admin dan super-admin yang bisa membuat permission
    if (!['admin', 'super_admin'].includes(user.role.name)) {
      return ApiResponse.forbidden('Access denied');
    }

    const body = await request.json();
    const { 
      guruId, 
      halaqahId, 
      canAbsensi = true, 
      canHafalan = false, 
      canTarget = false,
      isActive = true
    } = body;

    if (!guruId || !halaqahId) {
      return ApiResponse.error('guruId dan halaqahId harus diisi', 400);
    }

    // Validasi guru exists dan role guru
    const guru = await prisma.user.findUnique({
      where: { id: parseInt(guruId) },
      include: { role: true }
    });

    if (!guru) {
      return ApiResponse.notFound('Guru tidak ditemukan');
    }

    if (guru.role.name !== 'guru') {
      return ApiResponse.error('User bukan guru', 400);
    }

    // Validasi halaqah exists
    const halaqah = await prisma.halaqah.findUnique({
      where: { id: parseInt(halaqahId) }
    });

    if (!halaqah) {
      return ApiResponse.notFound('Halaqah tidak ditemukan');
    }

    // Cek apakah guru sudah punya permission untuk halaqah ini
    const existingPermission = await prisma.guruPermission.findUnique({
      where: {
        guruId_halaqahId: {
          guruId: parseInt(guruId),
          halaqahId: parseInt(halaqahId)
        }
      }
    });

    let permission;

    if (existingPermission) {
      // Update existing permission
      permission = await prisma.guruPermission.update({
        where: { id: existingPermission.id },
        data: {
          canAbsensi,
          canHafalan,
          canTarget,
          isActive
        },
        include: {
          guru: {
            select: {
              id: true,
              namaLengkap: true,
              username: true
            }
          },
          halaqah: {
            select: {
              id: true,
              namaHalaqah: true
            }
          }
        }
      });
    } else {
      // Create new permission
      permission = await prisma.guruPermission.create({
        data: {
          guruId: parseInt(guruId),
          halaqahId: parseInt(halaqahId),
          canAbsensi,
          canHafalan,
          canTarget,
          isActive,
          createdBy: user.id
        },
        include: {
          guru: {
            select: {
              id: true,
              namaLengkap: true,
              username: true
            }
          },
          halaqah: {
            select: {
              id: true,
              namaHalaqah: true
            }
          }
        }
      });
    }

    // Log activity
    await prisma.auditLog.create({
      data: {
        action: existingPermission ? 'UPDATE_GURU_PERMISSION' : 'CREATE_GURU_PERMISSION',
        keterangan: `${user.namaLengkap} ${existingPermission ? 'mengupdate' : 'memberikan'} permission ${guru.namaLengkap} untuk halaqah ${halaqah.namaHalaqah}`,
        userId: user.id
      }
    });

    return NextResponse.json({
      success: true,
      message: `Permission berhasil ${existingPermission ? 'diupdate' : 'dibuat'}`,
      data: permission
    });

  } catch (error: any) {
    console.error('POST /api/admin/guru-permissions error:', error);
    return ApiResponse.serverError('Failed to create/update guru permission');
  }
}

