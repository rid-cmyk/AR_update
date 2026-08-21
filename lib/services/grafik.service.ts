import { prisma } from '@/lib/database/prisma';
import dayjs from 'dayjs';

export interface AuthUser {
  id: number;
  namaLengkap: string;
  role: { name: string };
}

export class GrafikServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'GrafikServiceError';
  }
}

export class GrafikService {
  static async getHafalanChart(user: AuthUser, halaqahId: number, days: number = 7) {
    if (user.role.name !== 'guru') throw new GrafikServiceError('Access denied', 403);
    if (!halaqahId) throw new GrafikServiceError('Halaqah ID is required', 400);

    const halaqah = await prisma.halaqah.findFirst({
      where: { id: halaqahId, guruId: user.id }
    });
    if (!halaqah) throw new GrafikServiceError('Access denied to this halaqah', 403);

    const halaqahSantri = await prisma.halaqahSantri.findMany({
      where: { halaqahId },
      select: { santriId: true }
    });
    const santriIds = halaqahSantri.map(hs => hs.santriId);

    if (santriIds.length === 0) {
      return { chartData: [], stats: { totalZiyadah: 0, totalMurojaah: 0, totalAyat: 0, avgPerDay: 0 } };
    }

    const endDate = dayjs();
    const startDate = endDate.subtract(days, 'day');

    const hafalanData = await prisma.hafalan.findMany({
      where: {
        santriId: { in: santriIds },
        tanggal: { gte: startDate.toDate(), lte: endDate.toDate() }
      },
      select: { tanggal: true, status: true, ayatMulai: true, ayatSelesai: true },
      orderBy: { tanggal: 'asc' }
    });

    const chartDataMap = new Map<string, { ziyadah: number; murojaah: number }>();
    for (let i = 0; i < days; i++) {
      chartDataMap.set(startDate.add(i, 'day').format('YYYY-MM-DD'), { ziyadah: 0, murojaah: 0 });
    }

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

    const chartData = Array.from(chartDataMap.entries()).map(([tanggal, data]) => ({
      tanggal, ziyadah: data.ziyadah, murojaah: data.murojaah, total: data.ziyadah + data.murojaah
    }));

    const totalAyat = totalZiyadah + totalMurojaah;
    const avgPerDay = days > 0 ? totalAyat / days : 0;

    return {
      chartData,
      stats: { totalZiyadah, totalMurojaah, totalAyat, avgPerDay: Math.round(avgPerDay * 10) / 10 }
    };
  }

  static async getTopSantri(user: AuthUser, halaqahId: number) {
    if (user.role.name !== 'guru') throw new GrafikServiceError('Access denied', 403);
    if (!halaqahId) throw new GrafikServiceError('Halaqah ID is required', 400);

    const halaqah = await prisma.halaqah.findFirst({
      where: { id: halaqahId, guruId: user.id },
      include: { santri: { include: { santri: { select: { id: true, namaLengkap: true, username: true } } } } }
    });
    if (!halaqah) throw new GrafikServiceError('Access denied to this halaqah', 403);

    const santriIds = halaqah.santri.map(hs => hs.santriId);
    if (santriIds.length === 0) return { data: [] };

    const allHafalan = await prisma.hafalan.findMany({
      where: { santriId: { in: santriIds } },
      select: { santriId: true, status: true, ayatMulai: true, ayatSelesai: true, tanggal: true },
      orderBy: { tanggal: 'desc' }
    });

    const santriHafalanData = halaqah.santri.map((hs) => {
      const santriHafalan = allHafalan.filter(h => h.santriId === hs.santriId);
      let totalAyat = 0, ziyadahCount = 0, murojaahCount = 0;
      let lastHafalan: Date | null = null;

      santriHafalan.forEach(hafalan => {
        const ayatCount = hafalan.ayatSelesai - hafalan.ayatMulai + 1;
        totalAyat += ayatCount;
        if (hafalan.status === 'ziyadah') ziyadahCount++;
        else if (hafalan.status === 'murojaah') murojaahCount++;
        if (!lastHafalan && hafalan.tanggal) lastHafalan = hafalan.tanggal;
      });

      return {
        id: hs.santri.id,
        namaLengkap: hs.santri.namaLengkap,
        username: hs.santri.username,
        totalAyat,
        ziyadahCount,
        murojaahCount,
        lastHafalan: lastHafalan ? (lastHafalan as Date).toISOString() : null
      };
    });

    return { data: santriHafalanData.sort((a, b) => b.totalAyat - a.totalAyat) };
  }
}
