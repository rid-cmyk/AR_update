import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';

// GET jadwal untuk guru
export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error);
    }

    // Ensure user is guru
    if (user.role.name !== 'guru') {
      return ApiResponse.forbidden('Access denied');
    }

    const { searchParams } = new URL(request.url);
    const halaqahId = searchParams.get('halaqahId');

    let whereClause: any = {
      halaqah: {
        guruId: user.id
      }
    };

    // Filter berdasarkan halaqahId jika disediakan
    if (halaqahId) {
      whereClause.halaqahId = parseInt(halaqahId);
    }

    const jadwal = await prisma.jadwal.findMany({
      where: whereClause,
      include: {
        halaqah: {
          include: {
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
      },
      orderBy: [
        { hari: 'asc' },
        { jamMulai: 'asc' }
      ]
    });

    const formatted = jadwal.map(j => ({
      id: j.id,
      hari: j.hari,
      jamMulai: j.jamMulai,
      jamSelesai: j.jamSelesai,
      halaqah: {
        id: j.halaqah.id,
        namaHalaqah: j.halaqah.namaHalaqah,
        jumlahSantri: j.halaqah.santri.length,
        santri: j.halaqah.santri.map(hs => hs.santri)
      }
    }));

    console.log(`Guru ${user.namaLengkap} has ${formatted.length} jadwal`);
    return NextResponse.json(formatted);

  } catch (error) {
    console.error('GET /api/guru/jadwal error:', error);
    return NextResponse.json({ error: 'Failed to fetch jadwal' }, { status: 500 });
  }
}

// UPDATE jadwal (limited access for guru - hanya bisa update jam)
export async function PUT(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error);
    }

    // Ensure user is guru
    if (user.role.name !== 'guru') {
      return ApiResponse.forbidden('Access denied');
    }

    const body = await request.json();
    const { jadwalId, jamMulai, jamSelesai } = body;

    if (!jadwalId || !jamMulai || !jamSelesai) {
      return NextResponse.json({ 
        error: 'Jadwal ID, jam mulai, dan jam selesai harus diisi' 
      }, { status: 400 });
    }

    // Verify that this jadwal belongs to the current guru
    const jadwal = await prisma.jadwal.findFirst({
      where: {
        id: parseInt(jadwalId),
        halaqah: {
          guruId: user.id
        }
      }
    });

    if (!jadwal) {
      return NextResponse.json({ error: 'Jadwal not found or access denied' }, { status: 404 });
    }

    // Validasi waktu
    const mulai = new Date(`2000-01-01T${jamMulai}`);
    const selesai = new Date(`2000-01-01T${jamSelesai}`);

    if (mulai >= selesai) {
      return NextResponse.json({ 
        error: 'Jam mulai harus lebih awal dari jam selesai' 
      }, { status: 400 });
    }

    // Update jadwal
    const updatedJadwal = await prisma.jadwal.update({
      where: { id: parseInt(jadwalId) },
      data: {
        jamMulai: new Date(`2000-01-01T${jamMulai}`),
        jamSelesai: new Date(`2000-01-01T${jamSelesai}`)
      },
      include: {
        halaqah: {
          include: {
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
        jumlahSantri: updatedJadwal.halaqah.santri.length,
        santri: updatedJadwal.halaqah.santri.map(hs => hs.santri)
      }
    };

    console.log('Jadwal updated by guru:', formatted.id);
    return NextResponse.json(formatted);

  } catch (error: any) {
    console.error('PUT /api/guru/jadwal error:', error);
    return NextResponse.json({
      error: 'Failed to update jadwal',
      details: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}