import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET absensi records for santri
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const santriId = searchParams.get('santriId');
    const bulan = searchParams.get('bulan');
    const tahun = searchParams.get('tahun');

    let whereClause: any = {};

    if (santriId) {
      whereClause.santriId = parseInt(santriId);
    }

    if (bulan && tahun) {
      const startDate = new Date(parseInt(tahun), parseInt(bulan) - 1, 1);
      const endDate = new Date(parseInt(tahun), parseInt(bulan), 0);
      
      whereClause.tanggal = {
        gte: startDate,
        lte: endDate
      };
    }

    const absensi = await prisma.absensi.findMany({
      where: whereClause,
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        },
        jadwal: {
          include: {
            halaqah: {
              include: {
                guru: {
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
      orderBy: {
        tanggal: 'desc'
      }
    });

    return NextResponse.json(absensi);
  } catch (error) {
    console.error('GET /api/santri/absensi error:', error);
    return NextResponse.json({ error: 'Failed to fetch absensi data' }, { status: 500 });
  }
}

// POST new absensi record (for manual entry)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      santriId, 
      jadwalId, 
      tanggal, 
      status, 
      waktuDatang, 
      waktuPulang, 
      keterangan 
    } = body;

    if (!santriId || !jadwalId || !tanggal || !status) {
      return NextResponse.json({ 
        error: 'Missing required fields: santriId, jadwalId, tanggal, status' 
      }, { status: 400 });
    }

    // Validate status
    if (!['hadir', 'tidak_hadir', 'izin', 'sakit'].includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be one of: hadir, tidak_hadir, izin, sakit' 
      }, { status: 400 });
    }

    // Check if absensi already exists for this date
    const existingAbsensi = await prisma.absensi.findFirst({
      where: {
        santriId: parseInt(santriId),
        jadwalId: parseInt(jadwalId),
        tanggal: new Date(tanggal)
      }
    });

    if (existingAbsensi) {
      return NextResponse.json({ 
        error: 'Absensi for this date already exists' 
      }, { status: 400 });
    }

    const absensi = await prisma.absensi.create({
      data: {
        santriId: parseInt(santriId),
        jadwalId: parseInt(jadwalId),
        tanggal: new Date(tanggal),
        status: status as 'hadir' | 'tidak_hadir' | 'izin' | 'sakit',
        waktuDatang: waktuDatang ? new Date(`1970-01-01T${waktuDatang}:00Z`) : null,
        waktuPulang: waktuPulang ? new Date(`1970-01-01T${waktuPulang}:00Z`) : null,
        keterangan: keterangan || null
      },
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        },
        jadwal: {
          include: {
            halaqah: {
              include: {
                guru: {
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

    return NextResponse.json(absensi, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/santri/absensi error:', error);
    return NextResponse.json({
      error: 'Failed to create absensi record',
      details: error.message
    }, { status: 500 });
  }
}