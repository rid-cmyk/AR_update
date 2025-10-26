import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';

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

    if (!halaqahId) {
      return ApiResponse.error('Halaqah ID is required', 400);
    }

    // Verify guru owns this halaqah
    const halaqah = await prisma.halaqah.findFirst({
      where: {
        id: Number(halaqahId),
        guruId: user.id
      },
      include: {
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
    });

    if (!halaqah) {
      return ApiResponse.forbidden('Access denied to this halaqah');
    }

    const santriIds = halaqah.santri.map(hs => hs.santriId);

    if (santriIds.length === 0) {
      return ApiResponse.success([]);
    }

    console.log('Halaqah found:', halaqah.id, 'with', halaqah.santri.length, 'santri');

    // Get all hafalan data for santri in this halaqah in one query
    const allHafalan = await prisma.hafalan.findMany({
      where: {
        santriId: { in: santriIds }
      },
      select: {
        santriId: true,
        status: true,
        ayatMulai: true,
        ayatSelesai: true,
        tanggal: true
      },
      orderBy: {
        tanggal: 'desc'
      }
    });

    console.log('Total hafalan records found:', allHafalan.length);

    // Group hafalan by santri and calculate stats
    const santriHafalanData = halaqah.santri.map((hs) => {
      const santriHafalan = allHafalan.filter(h => h.santriId === hs.santriId);
      
      let totalAyat = 0;
      let ziyadahCount = 0;
      let murojaahCount = 0;
      let lastHafalan: any = null;

      santriHafalan.forEach(hafalan => {
        const ayatCount = hafalan.ayatSelesai - hafalan.ayatMulai + 1;
        totalAyat += ayatCount;
        
        if (hafalan.status === 'ziyadah') {
          ziyadahCount++;
        } else if (hafalan.status === 'murojaah') {
          murojaahCount++;
        }

        if (!lastHafalan && hafalan.tanggal) {
          lastHafalan = hafalan.tanggal;
        }
      });

      return {
        id: hs.santri.id,
        namaLengkap: hs.santri.namaLengkap,
        username: hs.santri.username,
        totalAyat,
        ziyadahCount,
        murojaahCount,
        lastHafalan: lastHafalan ? lastHafalan.toISOString() : null
      };
    });

    // Sort by total ayat (descending)
    const sortedData = santriHafalanData.sort((a, b) => b.totalAyat - a.totalAyat);

    console.log('Top Santri Data:', sortedData); // Debug log

    return NextResponse.json({ data: sortedData });

  } catch (error) {
    console.error('GET /api/guru/grafik/top-santri error:', error);
    return NextResponse.json({ error: 'Failed to fetch top santri data' }, { status: 500 });
  }
}
