import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// GET - Ambil progress hafalan anak
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

    // Get hafalan data
    const hafalanData = await prisma.hafalan.findMany({
      where: {
        santriId: parseInt(anakId)
      },
      orderBy: {
        tanggal: 'desc'
      },
      take: 10
    });

    // Calculate statistics
    const totalAyat = hafalanData.reduce((sum, hafalan) => {
      return sum + (hafalan.ayatSelesai - hafalan.ayatMulai + 1);
    }, 0);

    const ziyadahCount = hafalanData.filter(h => h.status === 'ziyadah').length;
    const totalSurat = new Set(hafalanData.map(h => h.surat)).size;

    // Simple progress calculation (you can enhance this)
    const progress = Math.min(Math.round((totalAyat / 6236) * 100), 100); // 6236 is total ayat in Quran

    return NextResponse.json({
      success: true,
      data: {
        totalSurat,
        totalAyat,
        progress,
        ziyadahCount,
        recentHafalan: hafalanData
      }
    });

  } catch (error) {
    console.error('Error fetching hafalan progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

