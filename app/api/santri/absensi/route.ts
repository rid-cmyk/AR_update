import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// GET - Ambil data absensi santri yang diinput oleh guru
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

    if (!user || user.role.name !== 'santri') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');

    // Build where clause
    const whereClause: any = {
      santriId: userId
    };

    // Add date filter if provided
    if (startDate && endDate) {
      whereClause.tanggal = {
        gte: new Date(startDate + 'T00:00:00.000Z'),
        lte: new Date(endDate + 'T23:59:59.999Z')
      };
    } else if (startDate) {
      whereClause.tanggal = {
        gte: new Date(startDate + 'T00:00:00.000Z')
      };
    } else if (endDate) {
      whereClause.tanggal = {
        lte: new Date(endDate + 'T23:59:59.999Z')
      };
    }

    // Get absensi data
    const absensiData = await prisma.absensi.findMany({
      where: whereClause,
      include: {
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
      },
      take: limit ? parseInt(limit) : undefined
    });

    // Calculate statistics
    const totalAbsensi = absensiData.length;
    const totalHadir = absensiData.filter(a => a.status === 'masuk').length;
    const totalIzin = absensiData.filter(a => a.status === 'izin').length;
    const totalAlpha = absensiData.filter(a => a.status === 'alpha').length;
    const attendanceRate = totalAbsensi > 0 ? Math.round((totalHadir / totalAbsensi) * 100) : 0;

    // Calculate current streak (consecutive days present)
    let currentStreak = 0;
    const sortedAbsensi = absensiData.sort((a, b) => 
      new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
    );

    for (const absensi of sortedAbsensi) {
      if (absensi.status === 'masuk') {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate best streak
    let bestStreak = 0;
    let tempStreak = 0;
    
    for (const absensi of sortedAbsensi.reverse()) {
      if (absensi.status === 'masuk') {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Format response data
    const formattedAbsensi = absensiData.map(absensi => ({
      id: absensi.id,
      tanggal: absensi.tanggal.toISOString().split('T')[0],
      status: absensi.status === 'masuk' ? 'hadir' : absensi.status, // Convert 'masuk' to 'hadir' for frontend
      halaqah: absensi.jadwal.halaqah.namaHalaqah,
      guru: absensi.jadwal.halaqah.guru?.namaLengkap || 'Unknown',
      hari: absensi.jadwal.hari,
      jamMulai: absensi.jadwal.jamMulai.toTimeString().slice(0, 5),
      jamSelesai: absensi.jadwal.jamSelesai.toTimeString().slice(0, 5)
    }));

    const stats = {
      totalHadir,
      totalIzin,
      totalAlpha,
      attendanceRate,
      currentStreak,
      bestStreak,
      totalAbsensi
    };

    return NextResponse.json({
      success: true,
      data: {
        absensi: formattedAbsensi,
        stats: stats
      }
    });

  } catch (error) {
    console.error('Error fetching santri absensi:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}