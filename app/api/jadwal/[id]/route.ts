import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';

// GET jadwal by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error);
    }

    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid jadwal ID' }, { status: 400 });
    }

    let whereClause: any = { id };

    // Filter berdasarkan role user
    if (user.role.name === 'guru') {
      whereClause.halaqah = {
        guruId: user.id
      };
    } else if (user.role.name === 'santri') {
      whereClause.halaqah = {
        santri: {
          some: {
            santriId: user.id
          }
        }
      };
    }

    const jadwal = await prisma.jadwal.findFirst({
      where: whereClause,
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

    if (!jadwal) {
      return NextResponse.json({ error: 'Jadwal not found' }, { status: 404 });
    }

    const formatted = {
      id: jadwal.id,
      hari: jadwal.hari,
      jamMulai: jadwal.jamMulai,
      jamSelesai: jadwal.jamSelesai,
      halaqah: {
        id: jadwal.halaqah.id,
        namaHalaqah: jadwal.halaqah.namaHalaqah,
        guru: jadwal.halaqah.guru,
        jumlahSantri: jadwal.halaqah.santri.length
      }
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('GET /api/jadwal/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch jadwal' }, { status: 500 });
  }
}

// UPDATE jadwal
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error);
    }

    // Hanya admin dan super-admin yang bisa update jadwal
    if (!['admin', 'super-admin'].includes(user.role.name)) {
      return ApiResponse.forbidden('Access denied');
    }

    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid jadwal ID' }, { status: 400 });
    }

    const body = await request.json();
    const { hari, jamMulai, jamSelesai, halaqahId } = body;

    console.log('Updating jadwal:', id, body);

    if (!hari || !jamMulai || !jamSelesai || !halaqahId) {
      return NextResponse.json({ 
        error: 'Hari, jam mulai, jam selesai, dan halaqah harus diisi' 
      }, { status: 400 });
    }

    // Check if jadwal exists
    const existingJadwal = await prisma.jadwal.findUnique({
      where: { id }
    });

    if (!existingJadwal) {
      return NextResponse.json({ error: 'Jadwal not found' }, { status: 404 });
    }

    // Validasi halaqah exists
    const halaqah = await prisma.halaqah.findUnique({
      where: { id: parseInt(halaqahId) }
    });

    if (!halaqah) {
      return NextResponse.json({ error: 'Halaqah tidak ditemukan' }, { status: 404 });
    }

    // Validasi waktu
    const mulai = new Date(`2000-01-01T${jamMulai}`);
    const selesai = new Date(`2000-01-01T${jamSelesai}`);

    if (mulai >= selesai) {
      return NextResponse.json({ 
        error: 'Jam mulai harus lebih awal dari jam selesai' 
      }, { status: 400 });
    }

    // Check for conflicting schedules (excluding current jadwal) - fixed logic
    const conflictingJadwal = await prisma.jadwal.findFirst({
      where: {
        id: { not: id },
        hari: hari,
        halaqahId: parseInt(halaqahId),
        OR: [
          // Case 1: New schedule starts during existing schedule
          {
            AND: [
              { jamMulai: { lte: mulai } },
              { jamSelesai: { gt: mulai } }
            ]
          },
          // Case 2: New schedule ends during existing schedule
          {
            AND: [
              { jamMulai: { lt: selesai } },
              { jamSelesai: { gte: selesai } }
            ]
          },
          // Case 3: New schedule completely contains existing schedule
          {
            AND: [
              { jamMulai: { gte: mulai } },
              { jamSelesai: { lte: selesai } }
            ]
          }
        ]
      },
      include: {
        halaqah: {
          select: {
            namaHalaqah: true
          }
        }
      }
    });

    if (conflictingJadwal) {
      return NextResponse.json({ 
        error: `Jadwal bentrok dengan jadwal ${conflictingJadwal.halaqah.namaHalaqah} pada hari ${hari} jam ${conflictingJadwal.jamMulai.toTimeString().slice(0,5)}-${conflictingJadwal.jamSelesai.toTimeString().slice(0,5)}` 
      }, { status: 400 });
    }

    // Update jadwal
    const updatedJadwal = await prisma.jadwal.update({
      where: { id },
      data: {
        hari: hari,
        jamMulai: new Date(`2000-01-01T${jamMulai}`),
        jamSelesai: new Date(`2000-01-01T${jamSelesai}`),
        halaqahId: parseInt(halaqahId)
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

    const formatted = {
      id: updatedJadwal.id,
      hari: updatedJadwal.hari,
      jamMulai: updatedJadwal.jamMulai,
      jamSelesai: updatedJadwal.jamSelesai,
      halaqah: {
        id: updatedJadwal.halaqah.id,
        namaHalaqah: updatedJadwal.halaqah.namaHalaqah,
        guru: updatedJadwal.halaqah.guru,
        jumlahSantri: updatedJadwal.halaqah.santri.length
      }
    };

    console.log('Jadwal updated successfully:', formatted.id);
    return NextResponse.json(formatted);

  } catch (error: any) {
    console.error('PUT /api/jadwal/[id] error:', error);
    return NextResponse.json({
      error: 'Failed to update jadwal',
      details: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}

// DELETE jadwal
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error);
    }

    // Hanya admin dan super-admin yang bisa delete jadwal
    if (!['admin', 'super-admin'].includes(user.role.name)) {
      return ApiResponse.forbidden('Access denied');
    }

    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid jadwal ID' }, { status: 400 });
    }

    // Check if jadwal exists
    const existingJadwal = await prisma.jadwal.findUnique({
      where: { id },
      include: {
        absensi: true
      }
    });

    if (!existingJadwal) {
      return NextResponse.json({ error: 'Jadwal not found' }, { status: 404 });
    }

    // Check if jadwal has related absensi records
    if (existingJadwal.absensi.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete jadwal with existing absensi records' 
      }, { status: 400 });
    }

    // Delete jadwal
    await prisma.jadwal.delete({
      where: { id }
    });

    console.log('Jadwal deleted successfully:', id);
    return NextResponse.json({ 
      message: 'Jadwal berhasil dihapus',
      deletedId: id 
    });

  } catch (error: any) {
    console.error('DELETE /api/jadwal/[id] error:', error);
    return NextResponse.json({
      error: 'Failed to delete jadwal',
      details: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}