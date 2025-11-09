import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// GET - Ambil summary absensi anak
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

    if (!user || user.role.name !== 'ortu') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const anakId = searchParams.get('anakId');

    if (!anakId) {
      return NextResponse.json({ error: 'anakId is required' }, { status: 400 });
    }

    // Verify this anak belongs to this orang tua
    const orangTuaSantri = await prisma.orangTuaSantri.findFirst({
      where: {
        orangTuaId: userId,
        santriId: parseInt(anakId)
      }
    });

    if (!orangTuaSantri) {
      return NextResponse.json({ error: 'Access denied - not your child' }, { status: 403 });
    }

    // Get absensi data
    const absensiData = await prisma.absensi.findMany({
      where: {
        santriId: parseInt(anakId)
      },
      include: {
        jadwal: {
          include: {
            halaqah: {
              select: {
                namaHalaqah: true
              }
            }
          }
        }
      },
      orderBy: {
        tanggal: 'desc'
      },
      take: 10
    });

    // Calculate statistics
    const totalHadir = absensiData.filter(a => a.status === 'masuk').length;
    const totalIzin = absensiData.filter(a => a.status === 'izin').length;
    const totalAlpha = absensiData.filter(a => a.status === 'alpha').length;

    // Format recent absensi
    const recentAbsensi = absensiData.map(absensi => ({
      id: absensi.id,
      tanggal: absensi.tanggal.toISOString(),
      status: absensi.status,
      jadwal: {
        hari: absensi.jadwal.hari,
        jamMulai: absensi.jadwal.jamMulai.toTimeString().slice(0, 5),
        jamSelesai: absensi.jadwal.jamSelesai.toTimeString().slice(0, 5),
        halaqah: {
          namaHalaqah: absensi.jadwal.halaqah.namaHalaqah
        }
      }
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalHadir,
        totalIzin,
        totalAlpha,
        recentAbsensi
      }
    });

  } catch (error) {
    console.error('Error fetching absensi summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

