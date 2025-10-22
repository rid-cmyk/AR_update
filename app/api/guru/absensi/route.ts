import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// GET - Ambil data absensi untuk guru
export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.id;

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user || user.role.name !== 'guru') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const tanggal = searchParams.get('tanggal');
    const halaqahId = searchParams.get('halaqahId');

    if (!tanggal) {
      return NextResponse.json({ error: 'Tanggal harus diisi' }, { status: 400 });
    }

    // Get guru's halaqah
    let halaqahIds: number[] = [];
    
    if (halaqahId) {
      // Verify halaqah belongs to guru
      const halaqah = await prisma.halaqah.findFirst({
        where: {
          id: parseInt(halaqahId),
          guruId: userId
        }
      });
      
      if (!halaqah) {
        return NextResponse.json({ error: 'Halaqah tidak ditemukan atau bukan milik Anda' }, { status: 403 });
      }
      
      halaqahIds = [halaqah.id];
    } else {
      // Get all guru's halaqah
      const halaqahs = await prisma.halaqah.findMany({
        where: { guruId: userId },
        select: { id: true }
      });
      halaqahIds = halaqahs.map(h => h.id);
    }

    if (halaqahIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          jadwals: [],
          absensi: [],
          summary: {
            totalJadwal: 0,
            totalSantri: 0,
            hadir: 0,
            izin: 0,
            alpha: 0
          }
        }
      });
    }

    // Parse tanggal
    const targetDate = new Date(tanggal);
    const dayNames = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    const hari = dayNames[targetDate.getDay()];

    // Get jadwal for this day
    const jadwals = await prisma.jadwal.findMany({
      where: {
        halaqahId: { in: halaqahIds },
        hari: hari
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
                    namaLengkap: true,
                    username: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        jamMulai: 'asc'
      }
    });

    if (jadwals.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          jadwals: [],
          absensi: [],
          summary: {
            totalJadwal: 0,
            totalSantri: 0,
            hadir: 0,
            izin: 0,
            alpha: 0
          }
        }
      });
    }

    // Get existing absensi for this date
    const existingAbsensi = await prisma.absensi.findMany({
      where: {
        jadwalId: { in: jadwals.map(j => j.id) },
        tanggal: {
          gte: new Date(tanggal + 'T00:00:00.000Z'),
          lt: new Date(tanggal + 'T23:59:59.999Z')
        }
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
              select: {
                id: true,
                namaHalaqah: true
              }
            }
          }
        }
      }
    });

    // Create complete absensi data with all santri
    const completeAbsensi: any[] = [];
    let totalSantri = 0;
    let hadir = 0;
    let izin = 0;
    let alpha = 0;

    for (const jadwal of jadwals) {
      for (const halaqahSantri of jadwal.halaqah.santri) {
        totalSantri++;
        
        const existingRecord = existingAbsensi.find(
          a => a.santriId === halaqahSantri.santriId && a.jadwalId === jadwal.id
        );

        if (existingRecord) {
          completeAbsensi.push(existingRecord);
          
          // Count status
          switch (existingRecord.status) {
            case 'masuk': hadir++; break;
            case 'izin': izin++; break;
            case 'alpha': alpha++; break;
          }
        } else {
          // Create placeholder for missing absensi
          const placeholder = {
            id: null,
            santriId: halaqahSantri.santriId,
            jadwalId: jadwal.id,
            tanggal: new Date(tanggal),
            status: null,
            santri: halaqahSantri.santri,
            jadwal: {
              id: jadwal.id,
              hari: jadwal.hari,
              jamMulai: jadwal.jamMulai,
              jamSelesai: jadwal.jamSelesai,
              halaqah: {
                id: jadwal.halaqah.id,
                namaHalaqah: jadwal.halaqah.namaHalaqah
              }
            }
          };
          completeAbsensi.push(placeholder);
        }
      }
    }

    // Format jadwal response
    const formattedJadwals = jadwals.map(jadwal => ({
      id: jadwal.id,
      hari: jadwal.hari,
      jamMulai: jadwal.jamMulai.toTimeString().slice(0, 5),
      jamSelesai: jadwal.jamSelesai.toTimeString().slice(0, 5),
      halaqah: {
        id: jadwal.halaqah.id,
        namaHalaqah: jadwal.halaqah.namaHalaqah,
        guru: jadwal.halaqah.guru,
        jumlahSantri: jadwal.halaqah.santri.length
      }
    }));

    return NextResponse.json({
      success: true,
      data: {
        tanggal: tanggal,
        hari: hari,
        jadwals: formattedJadwals,
        absensi: completeAbsensi,
        summary: {
          totalJadwal: jadwals.length,
          totalSantri: totalSantri,
          hadir: hadir,
          izin: izin,
          alpha: alpha,
          belumAbsen: totalSantri - hadir - izin - alpha
        }
      }
    });

  } catch (error) {
    console.error('Error fetching absensi:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Simpan/update absensi
export async function POST(request: NextRequest) {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.id;

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user || user.role.name !== 'guru') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { santriId, jadwalId, tanggal, status } = body;

    // Validation
    if (!santriId || !jadwalId || !tanggal || !status) {
      return NextResponse.json({ 
        error: 'Data tidak lengkap. santriId, jadwalId, tanggal, dan status harus diisi.' 
      }, { status: 400 });
    }

    if (!['masuk', 'izin', 'alpha'].includes(status)) {
      return NextResponse.json({ 
        error: 'Status harus masuk, izin, atau alpha' 
      }, { status: 400 });
    }

    // Verify jadwal belongs to guru
    const jadwal = await prisma.jadwal.findFirst({
      where: {
        id: parseInt(jadwalId),
        halaqah: {
          guruId: userId
        }
      },
      include: {
        halaqah: {
          include: {
            santri: {
              where: {
                santriId: parseInt(santriId)
              }
            }
          }
        }
      }
    });

    if (!jadwal) {
      return NextResponse.json({ 
        error: 'Jadwal tidak ditemukan atau bukan milik Anda' 
      }, { status: 403 });
    }

    // Verify santri is in this halaqah
    if (jadwal.halaqah.santri.length === 0) {
      return NextResponse.json({ 
        error: 'Santri tidak terdaftar di halaqah ini' 
      }, { status: 403 });
    }

    // Check if absensi already exists
    const existingAbsensi = await prisma.absensi.findFirst({
      where: {
        santriId: parseInt(santriId),
        jadwalId: parseInt(jadwalId),
        tanggal: {
          gte: new Date(tanggal + 'T00:00:00.000Z'),
          lt: new Date(tanggal + 'T23:59:59.999Z')
        }
      }
    });

    let absensi;

    if (existingAbsensi) {
      // Update existing absensi
      absensi = await prisma.absensi.update({
        where: { id: existingAbsensi.id },
        data: { 
          status: status as any,
          updatedAt: new Date()
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
                select: {
                  id: true,
                  namaHalaqah: true
                }
              }
            }
          }
        }
      });
    } else {
      // Create new absensi
      absensi = await prisma.absensi.create({
        data: {
          santriId: parseInt(santriId),
          jadwalId: parseInt(jadwalId),
          tanggal: new Date(tanggal),
          status: status as any
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
                select: {
                  id: true,
                  namaHalaqah: true
                }
              }
            }
          }
        }
      });
    }

    // Log activity
    await prisma.auditLog.create({
      data: {
        action: existingAbsensi ? 'UPDATE_ABSENSI' : 'CREATE_ABSENSI',
        keterangan: `Guru ${user.namaLengkap} ${existingAbsensi ? 'mengubah' : 'mencatat'} absensi ${absensi.santri.namaLengkap} - ${status}`,
        userId: userId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Absensi berhasil disimpan',
      data: absensi
    });

  } catch (error) {
    console.error('Error saving absensi:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}