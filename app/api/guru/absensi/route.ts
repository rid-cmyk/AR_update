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

    // Dukung dua format: objek tunggal { santriId, jadwalId, tanggal, status }
    // atau array bulk [ { santriId, jadwalId, tanggal, status }, ... ] (dipakai mobile)
    const entries: any[] = Array.isArray(body) ? body : [body];
    if (entries.length === 0) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const jadwalCache: Record<number, any> = {};

    const results = await prisma.$transaction(async (tx) => {
      const saved = [];
      
      for (const entry of entries) {
        const { santriId, jadwalId, tanggal, status } = entry;

        // Validation
        if (!santriId || !jadwalId || !tanggal || !status) {
          throw new Error('Data tidak lengkap. santriId, jadwalId, tanggal, dan status harus diisi.');
        }

        if (!['masuk', 'izin', 'alpha', 'sakit'].includes(status)) {
          throw new Error('Status harus masuk, izin, sakit, atau alpha');
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
          throw new Error('Tidak dapat mengisi absensi untuk tanggal masa depan');
        }

        const jId = parseInt(jadwalId);
        let jadwal = jadwalCache[jId];
        
        if (!jadwal) {
          jadwal = await tx.jadwal.findFirst({
            where: {
              id: jId,
              hari: hari as any,
              isActive: true,
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
          jadwalCache[jId] = jadwal;
        } else {
          // If cached, verify the santri is still in the halaqah
          const isSantriInHalaqah = await tx.halaqahSantri.findFirst({
            where: { halaqahId: jadwal.halaqahId, santriId: parseInt(santriId) }
          });
          if (!isSantriInHalaqah) jadwal.halaqah.santri = [];
          else jadwal.halaqah.santri = [isSantriInHalaqah];
        }

        if (!jadwal) {
          throw new Error(`Jadwal tidak ditemukan, tidak aktif, atau tidak sesuai dengan hari ${hari}`);
        }

        // Validasi waktu: hanya bisa absen pada hari yang sama atau dalam rentang waktu yang wajar
        const currentTime = new Date();
        const jadwalDate = new Date(tanggal);
        
        if (targetDate.getTime() === today.getTime()) {
          const jamMulai = new Date(jadwalDate);
          const [jamMulaiHour, jamMulaiMinute] = jadwal.jamMulai.toTimeString().slice(0, 5).split(':');
          jamMulai.setHours(parseInt(jamMulaiHour), parseInt(jamMulaiMinute), 0, 0);
          
          const jamSelesai = new Date(jadwalDate);
          const [jamSelesaiHour, jamSelesaiMinute] = jadwal.jamSelesai.toTimeString().slice(0, 5).split(':');
          jamSelesai.setHours(parseInt(jamSelesaiHour), parseInt(jamSelesaiMinute), 0, 0);
          
          const toleransiMulai = new Date(jamMulai.getTime() - 30 * 60 * 1000);
          const toleransiSelesai = new Date(jamSelesai.getTime() + 2 * 60 * 60 * 1000);
          
          if (currentTime < toleransiMulai || currentTime > toleransiSelesai) {
            throw new Error(`Absensi hanya dapat diisi pada rentang waktu ${jadwal.jamMulai.toTimeString().slice(0, 5)} - ${jadwal.jamSelesai.toTimeString().slice(0, 5)}`);
          }
        }

        if ((jadwal as any).halaqah.santri.length === 0) {
          throw new Error('Santri tidak terdaftar di halaqah ini');
        }

        const existingAbsensi = await tx.absensi.findFirst({
          where: {
            santriId: parseInt(santriId),
            jadwalId: jId,
            tanggal: {
              gte: new Date(tanggal + 'T00:00:00.000Z'),
              lt: new Date(tanggal + 'T23:59:59.999Z')
            }
          }
        });

        let absensi;
        const includeOptions = {
          santri: { select: { id: true, namaLengkap: true, username: true } },
          jadwal: { include: { halaqah: { select: { id: true, namaHalaqah: true } } } }
        };

        if (existingAbsensi) {
          absensi = await tx.absensi.update({
            where: { id: existingAbsensi.id },
            data: { status: status as StatusAbsensi },
            include: includeOptions
          });
        } else {
          absensi = await tx.absensi.create({
            data: {
              santriId: parseInt(santriId),
              jadwalId: jId,
              tanggal: new Date(tanggal),
              status: status as StatusAbsensi
            },
            include: includeOptions
          });
        }

        saved.push(absensi);
      }
      return saved;
    }, {
      maxWait: 5000,
      timeout: 20000
    });

    // Log activity
    await prisma.auditLog.create({
      data: {
        action: 'BULK_ABSENSI',
        keterangan: `Guru ${user.namaLengkap} mencatat ${results.length} absensi`,
        userId: userId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Absensi berhasil disimpan',
      data: Array.isArray(body) ? results : results[0]
    });

  } catch (error: any) {
    console.error('Error saving absensi:', error);
    
    // Map known validation errors to proper status codes
    const msg = error?.message || '';
    if (msg.includes('Data tidak lengkap') || 
        msg.includes('Status harus') || 
        msg.includes('Tidak dapat mengisi') || 
        msg.includes('Absensi hanya dapat')) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    if (msg.includes('Jadwal tidak ditemukan') || msg.includes('Santri tidak terdaftar')) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
