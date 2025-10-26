import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';

// GET all jadwal
export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    const { searchParams } = new URL(request.url);
    const halaqahId = searchParams.get('halaqahId');
    const isTemplate = searchParams.get('isTemplate');
    const isActive = searchParams.get('isActive');

    const whereClause: any = {};

    // Filter berdasarkan role user
    if (user.role.name === 'guru') {
      // Guru bisa melihat jadwal halaqah yang dia ampu + yang diberi permission
      const guruPermissions = await prisma.guruPermission.findMany({
        where: {
          guruId: user.id,
          isActive: true
        },
        select: {
          halaqahId: true
        }
      });

      const permittedHalaqahIds = guruPermissions.map(p => p.halaqahId);
      
      whereClause.halaqah = {
        OR: [
          { guruId: user.id }, // Halaqah sendiri
          { id: { in: permittedHalaqahIds } } // Halaqah yang diberi permission
        ]
      };
    } else if (user.role.name === 'santri') {
      // Santri hanya bisa melihat jadwal halaqah yang dia ikuti
      whereClause.halaqah = {
        santri: {
          some: {
            santriId: user.id
          }
        }
      };
    }

    // Filter berdasarkan halaqahId jika disediakan
    if (halaqahId) {
      whereClause.halaqahId = parseInt(halaqahId);
    }

    // Filter berdasarkan isTemplate
    if (isTemplate !== null) {
      whereClause.isTemplate = isTemplate === 'true';
    }

    // Filter berdasarkan isActive
    if (isActive !== null) {
      whereClause.isActive = isActive === 'true';
    }

    const jadwal = await prisma.jadwal.findMany({
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
      // Safely access new fields with fallbacks
      isTemplate: (j as any).isTemplate ?? true,
      tanggalMulai: (j as any).tanggalMulai ?? null,
      tanggalSelesai: (j as any).tanggalSelesai ?? null,
      isActive: (j as any).isActive ?? true,
      createdAt: (j as any).createdAt ?? new Date(),
      updatedAt: (j as any).updatedAt ?? new Date(),
      halaqah: {
        id: j.halaqah.id,
        namaHalaqah: j.halaqah.namaHalaqah,
        guru: j.halaqah.guru,
        jumlahSantri: j.halaqah.santri.length
      }
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('GET /api/jadwal error:', error);
    return NextResponse.json({ error: 'Failed to fetch jadwal' }, { status: 500 });
  }
}

// CREATE jadwal
export async function POST(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    // Hanya admin dan super-admin yang bisa membuat jadwal
    if (!['admin', 'super-admin'].includes(user.role.name)) {
      return ApiResponse.forbidden('Access denied');
    }

    const body = await request.json();
    const { 
      hari, 
      jamMulai, 
      jamSelesai, 
      halaqahId, 
      isTemplate = true,
      tanggalMulai,
      tanggalSelesai,
      isActive = true
    } = body;

    console.log('Creating jadwal:', body);

    if (!hari || !jamMulai || !jamSelesai || !halaqahId) {
      return NextResponse.json({ 
        error: 'Hari, jam mulai, jam selesai, dan halaqah harus diisi' 
      }, { status: 400 });
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

    // Validasi tanggal periode jika disediakan
    if (tanggalMulai && tanggalSelesai) {
      const startDate = new Date(tanggalMulai);
      const endDate = new Date(tanggalSelesai);
      
      if (startDate >= endDate) {
        return NextResponse.json({ 
          error: 'Tanggal mulai harus lebih awal dari tanggal selesai' 
        }, { status: 400 });
      }
    }

    // Check for conflicting schedules - hanya untuk template aktif
    const conflictingJadwal = await prisma.jadwal.findFirst({
      where: {
        hari: hari,
        halaqahId: parseInt(halaqahId),
        isActive: true,
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

    // Prepare data untuk create dengan validasi
    const jadwalData: any = {
      hari: hari,
      jamMulai: new Date(`2000-01-01T${jamMulai}`),
      jamSelesai: new Date(`2000-01-01T${jamSelesai}`),
      halaqahId: parseInt(halaqahId)
    };

    // Tambahkan field baru dengan default values jika tidak ada
    try {
      jadwalData.isTemplate = Boolean(isTemplate);
      jadwalData.isActive = Boolean(isActive);
      
      // Tambahkan tanggal periode jika disediakan
      if (tanggalMulai) {
        jadwalData.tanggalMulai = new Date(tanggalMulai);
      }
      if (tanggalSelesai) {
        jadwalData.tanggalSelesai = new Date(tanggalSelesai);
      }
    } catch (fieldError) {
      console.log('Warning: New fields not available, using basic jadwal creation');
      // Fallback ke basic jadwal creation jika field baru belum tersedia
    }

    // Create jadwal
    const jadwal = await prisma.jadwal.create({
      data: jadwalData,
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
      id: jadwal.id,
      hari: jadwal.hari,
      jamMulai: jadwal.jamMulai,
      jamSelesai: jadwal.jamSelesai,
      // Safely access new fields with fallbacks
      isTemplate: jadwal.isTemplate ?? true,
      tanggalMulai: jadwal.tanggalMulai ?? null,
      tanggalSelesai: jadwal.tanggalSelesai ?? null,
      isActive: jadwal.isActive ?? true,
      halaqah: {
        id: jadwal.halaqah.id,
        namaHalaqah: jadwal.halaqah.namaHalaqah,
        guru: jadwal.halaqah.guru,
        jumlahSantri: jadwal.halaqah.santri.length
      }
    };

    console.log('Jadwal created successfully:', formatted.id);
    return NextResponse.json(formatted);

  } catch (error: any) {
    console.error('POST /api/jadwal error:', error);
    return NextResponse.json({
      error: 'Failed to create jadwal',
      details: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}