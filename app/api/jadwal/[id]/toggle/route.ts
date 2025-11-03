import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';

// PUT - Toggle status aktif/nonaktif jadwal
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error);
    }

    // Hanya admin dan super-admin yang bisa toggle jadwal
    if (!['admin', 'super_admin'].includes(user.role.name)) {
      return ApiResponse.forbidden('Access denied');
    }

    const resolvedParams = await params;
    const jadwalId = parseInt(resolvedParams.id);
    
    if (isNaN(jadwalId)) {
      return ApiResponse.error('Invalid jadwal ID', 400);
    }

    // Get current jadwal
    const currentJadwal = await prisma.jadwal.findUnique({
      where: { id: jadwalId },
      include: {
        halaqah: {
          select: {
            namaHalaqah: true
          }
        }
      }
    });

    if (!currentJadwal) {
      return ApiResponse.notFound('Jadwal not found');
    }

    // Toggle status
    const updatedJadwal = await prisma.jadwal.update({
      where: { id: jadwalId },
      data: {
        isActive: !currentJadwal.isActive
      },
      include: {
        halaqah: {
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
                    namaLengkap: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Log activity
    await prisma.auditLog.create({
      data: {
        action: 'TOGGLE_JADWAL_STATUS',
        keterangan: `${user.namaLengkap} ${updatedJadwal.isActive ? 'mengaktifkan' : 'menonaktifkan'} jadwal ${updatedJadwal.halaqah.namaHalaqah} - ${updatedJadwal.hari}`,
        userId: user.id
      }
    });

    const formatted = {
      id: updatedJadwal.id,
      hari: updatedJadwal.hari,
      jamMulai: updatedJadwal.jamMulai,
      jamSelesai: updatedJadwal.jamSelesai,
      isTemplate: updatedJadwal.isTemplate,
      tanggalMulai: updatedJadwal.tanggalMulai,
      tanggalSelesai: updatedJadwal.tanggalSelesai,
      isActive: updatedJadwal.isActive,
      halaqah: {
        id: updatedJadwal.halaqah.id,
        namaHalaqah: updatedJadwal.halaqah.namaHalaqah,
        guru: updatedJadwal.halaqah.guru,
        jumlahSantri: updatedJadwal.halaqah.santri.length
      }
    };

    return NextResponse.json({
      message: `Jadwal berhasil ${updatedJadwal.isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
      data: formatted
    });

  } catch (error: any) {
    console.error('PUT /api/jadwal/[id]/toggle error:', error);
    return ApiResponse.serverError('Failed to toggle jadwal status');
  }
}