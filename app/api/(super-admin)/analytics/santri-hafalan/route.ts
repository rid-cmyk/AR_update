import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

export async function GET(request: Request) {
  try {
    // Get token from cookie
    const token = request.headers.get('cookie')?.split('auth_token=')[1]?.split(';')[0];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    // Get santri's hafalan progress
    const hafalanProgress = await prisma.targetHafalan.findMany({
      where: { santriId: userId },
      include: {
        santri: true
      },
      orderBy: { deadline: 'asc' }
    });

    // Transform hafalan progress data
    const transformedHafalanProgress = hafalanProgress.map(target => ({
      id: target.id,
      surat: target.surat,
      ayatTarget: target.ayatTarget,
      ayatSelesai: Math.floor(target.ayatTarget * (Math.random() * 0.8 + 0.2)), // Mock progress
      progress: Math.floor((Math.random() * 60) + 20), // Mock progress percentage
      deadline: target.deadline.toISOString().split('T')[0],
      status: target.status
    }));

    // Get santri's hafalan records for recent activities
    const recentHafalan = await prisma.hafalan.findMany({
      where: { santriId: userId },
      orderBy: { tanggal: 'desc' },
      take: 10
    });

    // Get santri's achievements (mock data for now)
    const achievements = [
      {
        id: 1,
        title: "Hafalan Pertama",
        description: "Menyelesaikan hafalan Al-Fatihah",
        date: "2024-09-15",
        icon: "🏆"
      },
      {
        id: 2,
        title: "Santri Rajin",
        description: "Hadir halaqah selama 30 hari berturut-turut",
        date: "2024-10-01",
        icon: "⭐"
      }
    ];

    // Create recent activities from hafalan records
    const recentActivities = recentHafalan.map((hafalan, index) => ({
      id: hafalan.id,
      type: "hafalan",
      description: `Menyelesaikan hafalan ${hafalan.surat} ayat ${hafalan.ayatMulai}-${hafalan.ayatSelesai}`,
      date: hafalan.tanggal.toISOString().split('T')[0],
      points: Math.floor(Math.random() * 50) + 10
    }));

    // Add some mock activities
    recentActivities.push(
      {
        id: 999,
        type: "absensi",
        description: "Hadir mengikuti halaqah",
        date: new Date().toISOString().split('T')[0],
        points: 10
      },
      {
        id: 998,
        type: "achievement",
        description: "Mendapatkan badge 'Santri Terbaik'",
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        points: 25
      }
    );

    return NextResponse.json({
      hafalanProgress: transformedHafalanProgress,
      achievements,
      recentActivities: recentActivities.slice(0, 10)
    });
  } catch (error) {
    console.error('Error fetching santri hafalan data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch santri hafalan data' },
      { status: 500 }
    );
  }
}