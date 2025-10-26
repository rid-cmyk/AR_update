import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import dayjs from 'dayjs';

export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    if (user.role.name !== 'guru') {
      return ApiResponse.forbidden('Access denied');
    }

    const { searchParams } = new URL(request.url);
    const halaqahId = searchParams.get('halaqahId');
    const days = parseInt(searchParams.get('days') || '7');

    if (!halaqahId) {
      return ApiResponse.error('Halaqah ID is required', 400);
    }

    // Verify guru owns this halaqah
    const halaqah = await prisma.halaqah.findFirst({
      where: {
        id: Number(halaqahId),
        guruId: user.id
      }
    });

    if (!halaqah) {
      return ApiResponse.forbidden('Access denied to this halaqah');
    }

    // Get santri IDs from halaqah
    const halaqahSantri = await prisma.halaqahSantri.findMany({
      where: { halaqahId: Number(halaqahId) },
      select: { santriId: true }
    });

    const santriIds = halaqahSantri.map(hs => hs.santriId);

    if (santriIds.length === 0) {
      return NextResponse.json({
        chartData: [],
        stats: {
          totalZiyadah: 0,
          totalMurojaah: 0,
          totalAyat: 0,
          avgPerDay: 0
        }
      });
    }

    // Calculate date range
    const endDate = dayjs();
    const startDate = endDate.subtract(days, 'day');

    // Get hafalan data for the period
    const hafalanData = await prisma.hafalan.findMany({
      where: {
        santriId: { in: santriIds },
        tanggal: {
          gte: startDate.toDate(),
          lte: endDate.toDate()
        }
      },
      select: {
        tanggal: true,
        status: true,
        ayatMulai: true,
        ayatSelesai: true
      },
      orderBy: {
        tanggal: 'asc'
      }
    });

    // Process data for chart
    const chartDataMap = new Map<string, { ziyadah: number; murojaah: number }>();
    
    // Initialize all days in range
    for (let i = 0; i < days; i++) {
      const date = startDate.add(i, 'day').format('YYYY-MM-DD');
      chartDataMap.set(date, { ziyadah: 0, murojaah: 0 });
    }

    // Aggregate data
    let totalZiyadah = 0;
    let totalMurojaah = 0;

    hafalanData.forEach(hafalan => {
      const dateKey = dayjs(hafalan.tanggal).format('YYYY-MM-DD');
      const ayatCount = hafalan.ayatSelesai - hafalan.ayatMulai + 1;
      
      if (chartDataMap.has(dateKey)) {
        const current = chartDataMap.get(dateKey)!;
        if (hafalan.status === 'ziyadah') {
          current.ziyadah += ayatCount;
          totalZiyadah += ayatCount;
        } else {
          current.murojaah += ayatCount;
          totalMurojaah += ayatCount;
        }
      }
    });

    // Convert map to array
    const chartData = Array.from(chartDataMap.entries()).map(([tanggal, data]) => ({
      tanggal,
      ziyadah: data.ziyadah,
      murojaah: data.murojaah,
      total: data.ziyadah + data.murojaah
    }));

    const totalAyat = totalZiyadah + totalMurojaah;
    const avgPerDay = days > 0 ? totalAyat / days : 0;

    return NextResponse.json({
      chartData,
      stats: {
        totalZiyadah,
        totalMurojaah,
        totalAyat,
        avgPerDay: Math.round(avgPerDay * 10) / 10
      }
    });

  } catch (error) {
    console.error('GET /api/guru/grafik/hafalan error:', error);
    return ApiResponse.serverError('Failed to fetch hafalan chart data');
  }
}
