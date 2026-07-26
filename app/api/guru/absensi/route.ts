import { prisma } from '@/lib/database/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { StatusAbsensi } from '@prisma/client';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { getGuruAbsensiData } from '@/lib/services/absensi';

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
    const decoded = verifyToken<Record<string, unknown>>(token);
    const userId = typeof decoded.id === 'string' ? parseInt(decoded.id) : (decoded.id as number);

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user || (user as any).role?.name !== 'guru') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const tanggal = searchParams.get('tanggal');
    if (!tanggal) {
      return NextResponse.json({ error: 'Tanggal harus diisi' }, { status: 400 });
    }
    
    // Parse tanggal dan validasi
    const targetDate = new Date(tanggal);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    
    if (targetDate > today) {
      return NextResponse.json({
        error: 'Tidak dapat mengisi absensi untuk tanggal masa depan'
      }, { status: 400 });
    }

    const absensiData = await getGuruAbsensiData(userId, tanggal);

    return NextResponse.json({
      success: true,
      data: {
        tanggal: tanggal,
        jadwals: absensiData.jadwals,
        absensi: absensiData.absensi,
        summary: absensiData.summary
      }
    });

  } catch (error) {
    console.error('Error fetching absensi:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
    const decoded = verifyToken<Record<string, unknown>>(token);
    const userId = typeof decoded.id === 'string' ? parseInt(decoded.id) : (decoded.id as number);

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user || (user as any).role?.name !== 'guru') {
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

    // Validasi tanggal dan waktu
    const targetDate = new Date(tanggal);
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const hari = dayNames[targetDate.getDay()];

    // Validasi: tidak bisa absen untuk tanggal masa depan
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    
    if (targetDate > today) {
      return NextResponse.json({
        error: 'Tidak dapat mengisi absensi untuk tanggal masa depan'
      }, { status: 400 });
    }

    // Verify jadwal belongs to guru's own halaqah dan sesuai hari
    const jadwal = await prisma.jadwal.findFirst({
      where: {
        id: parseInt(jadwalId),
        hari: hari as any, // Validasi hari harus sesuai
        isActive: true, // Jadwal harus aktif
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
        error: `Jadwal tidak ditemukan, tidak aktif, atau tidak sesuai dengan hari ${hari}` 
      }, { status: 403 });
    }

    // Validasi waktu: hanya bisa absen pada hari yang sama atau dalam rentang waktu yang wajar
    const currentTime = new Date();
    const jadwalDate = new Date(tanggal);
    
    // Jika absen untuk hari ini, validasi waktu
    if (targetDate.getTime() === today.getTime()) {
      const jamMulai = new Date(jadwalDate);
      const [jamMulaiHour, jamMulaiMinute] = jadwal.jamMulai.toTimeString().slice(0, 5).split(':');
      jamMulai.setHours(parseInt(jamMulaiHour), parseInt(jamMulaiMinute), 0, 0);
      
      const jamSelesai = new Date(jadwalDate);
      const [jamSelesaiHour, jamSelesaiMinute] = jadwal.jamSelesai.toTimeString().slice(0, 5).split(':');
      jamSelesai.setHours(parseInt(jamSelesaiHour), parseInt(jamSelesaiMinute), 0, 0);
      
      // Beri toleransi 30 menit sebelum jadwal mulai dan 2 jam setelah jadwal selesai
      const toleransiMulai = new Date(jamMulai.getTime() - 30 * 60 * 1000); // 30 menit sebelum
      const toleransiSelesai = new Date(jamSelesai.getTime() + 2 * 60 * 60 * 1000); // 2 jam setelah
      
      if (currentTime < toleransiMulai || currentTime > toleransiSelesai) {
        return NextResponse.json({
          error: `Absensi hanya dapat diisi pada rentang waktu ${jadwal.jamMulai.toTimeString().slice(0, 5)} - ${jadwal.jamSelesai.toTimeString().slice(0, 5)} (dengan toleransi 30 menit sebelum dan 2 jam setelah)`
        }, { status: 400 });
      }
    }

    // Verify santri is in this halaqah
    if ((jadwal as any).halaqah.santri.length === 0) {
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
          status: status as StatusAbsensi
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
          status: status as StatusAbsensi
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
        keterangan: `Guru ${user.namaLengkap} ${existingAbsensi ? 'mengubah' : 'mencatat'} absensi ${(absensi as any).santri?.namaLengkap || absensi.santriId} - ${status}`,
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
  }
}
