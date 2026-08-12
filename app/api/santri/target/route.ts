import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';



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
    const userId = decoded.id as number;
    const userIdNumber = typeof userId === 'string' ? parseInt(userId) : (userId as number);

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userIdNumber },
      include: { role: true }
    });

    if (!user || user.role.name !== 'santri') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const whereClause: Record<string, unknown> = {
      santriId: userIdNumber
    };

    // Filter by status if specified
    if (status && ['belum', 'proses', 'selesai'].includes(status)) {
      whereClause.status = status;
    }

    const skip = (page - 1) * limit;

    const [targets, total] = await Promise.all([
      prisma.targetHafalan.findMany({
        where: whereClause,
        orderBy: [
          { status: 'asc' }, // belum, proses, selesai
          { deadline: 'asc' }
        ],
        skip,
        take: limit
      }),
      prisma.targetHafalan.count({ where: whereClause })
    ]);

    // Get statistics
    const stats = await prisma.targetHafalan.groupBy({
      by: ['status'],
      where: { santriId: userIdNumber },
      _count: {
        id: true
      }
    });

    const statistics = {
      total: total,
      belum: (stats as any[]).find(s => s.status === 'belum')?._count?.id || 0,
      proses: (stats as any[]).find(s => s.status === 'proses')?._count?.id || 0,
      selesai: (stats as any[]).find(s => s.status === 'selesai')?._count?.id || 0
    };

    // Bulk fetch hafalan records for all surahs
    const allSurats = [...new Set(targets.map(t => t.surat))];
    const allHafalanBulk = await prisma.hafalan.findMany({
      where: {
        santriId: userIdNumber,
        surat: { in: allSurats },
        status: 'ziyadah'
      },
      select: {
        surat: true,
        ayatMulai: true,
        ayatSelesai: true
      }
    });

    const hafalanMap = new Map<string, typeof allHafalanBulk>();
    for (const h of allHafalanBulk) {
      if (!hafalanMap.has(h.surat)) hafalanMap.set(h.surat, []);
      hafalanMap.get(h.surat)!.push(h);
    }

    // Calculate progress for each target (tanpa efek samping tulis per-record di GET)
    const selesaiIds: number[] = [];
    const prosesIds: number[] = [];
    const targetsWithProgress = targets.map((target) => {
      // Get total ayat hafalan ziyadah for this surat
      const hafalanRecords = hafalanMap.get(target.surat) || [];

      // Calculate total unique ayat (avoid double counting)
      const ayatSet = new Set<number>();
      hafalanRecords.forEach(record => {
        for (let i = record.ayatMulai; i <= record.ayatSelesai; i++) {
          ayatSet.add(i);
        }
      });

      const currentAyat = ayatSet.size;
      const progress = Math.min(Math.round((currentAyat / target.ayatTarget) * 100), 100);

      // Status dihitung derived; perubahan baru dipersist batch di bawah (satu query per status)
      let newStatus = target.status;
      if (progress >= 100 && target.status !== 'selesai') {
        newStatus = 'selesai';
        selesaiIds.push(target.id);
      } else if (progress > 0 && target.status === 'belum') {
        newStatus = 'proses';
        prosesIds.push(target.id);
      }

      return {
        ...target,
        status: newStatus,
        currentAyat,
        progress
      };
    });

    // Batch persist status (hanya jika ada perubahan) — menggantikan loop update per-record
    if (selesaiIds.length > 0) {
      await prisma.targetHafalan.updateMany({
        where: { id: { in: selesaiIds } },
        data: { status: 'selesai' }
      });
    }
    if (prosesIds.length > 0) {
      await prisma.targetHafalan.updateMany({
        where: { id: { in: prosesIds } },
        data: { status: 'proses' }
      });
    }

    return NextResponse.json({
      success: true,
      data: targetsWithProgress,
      statistics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching santri target:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
  }
}

