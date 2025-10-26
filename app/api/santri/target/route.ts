import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const whereClause: any = {
      santriId: userId
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
      where: { santriId: userId },
      _count: {
        id: true
      }
    });

    const statistics = {
      total: total,
      belum: stats.find(s => s.status === 'belum')?._count.id || 0,
      proses: stats.find(s => s.status === 'proses')?._count.id || 0,
      selesai: stats.find(s => s.status === 'selesai')?._count.id || 0
    };

    // Calculate progress for each target with better logic
    const targetsWithProgress = await Promise.all(
      targets.map(async (target) => {
        // Get total ayat hafalan ziyadah for this surat
        const hafalanRecords = await prisma.hafalan.findMany({
          where: {
            santriId: userId,
            surat: target.surat,
            status: 'ziyadah'
          },
          select: {
            ayatMulai: true,
            ayatSelesai: true
          }
        });

        // Calculate total unique ayat (avoid double counting)
        const ayatSet = new Set<number>();
        hafalanRecords.forEach(record => {
          for (let i = record.ayatMulai; i <= record.ayatSelesai; i++) {
            ayatSet.add(i);
          }
        });

        const currentAyat = ayatSet.size;
        const progress = Math.min(Math.round((currentAyat / target.ayatTarget) * 100), 100);
        
        // Auto update status based on progress
        let newStatus = target.status;
        if (progress >= 100 && target.status !== 'selesai') {
          newStatus = 'selesai';
          await prisma.targetHafalan.update({
            where: { id: target.id },
            data: { status: 'selesai' }
          });
        } else if (progress > 0 && target.status === 'belum') {
          newStatus = 'proses';
          await prisma.targetHafalan.update({
            where: { id: target.id },
            data: { status: 'proses' }
          });
        }
        
        return {
          ...target,
          status: newStatus,
          currentAyat,
          progress
        };
      })
    );

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
    await prisma.$disconnect();
  }
}