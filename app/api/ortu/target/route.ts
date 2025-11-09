import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// GET - Ambil target hafalan anak
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

    // Get target hafalan
    const targetHafalan = await prisma.targetHafalan.findMany({
      where: {
        santriId: parseInt(anakId)
      },
      orderBy: {
        deadline: 'asc'
      }
    });

    // Calculate progress for each target
    const targetsWithProgress = await Promise.all(
      targetHafalan.map(async (target) => {
        // Get hafalan for this surat
        const hafalan = await prisma.hafalan.findMany({
          where: {
            santriId: parseInt(anakId),
            surat: target.surat,
            status: 'ziyadah'
          }
        });

        // Calculate total ayat hafal for this surat
        const totalHafal = hafalan.reduce((sum, h) => {
          return sum + (h.ayatSelesai - h.ayatMulai + 1);
        }, 0);

        // Calculate progress percentage
        const progress = Math.min(Math.round((totalHafal / target.ayatTarget) * 100), 100);

        return {
          id: target.id,
          surat: target.surat,
          ayatTarget: target.ayatTarget,
          deadline: target.deadline.toISOString(),
          status: target.status,
          progress: progress
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: targetsWithProgress
    });

  } catch (error) {
    console.error('Error fetching target hafalan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

