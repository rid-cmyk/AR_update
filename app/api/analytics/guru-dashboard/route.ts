import { NextRequest, NextResponse } from "next/server";
import prisma from '@/lib/database/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.headers.get('cookie')?.split('auth_token=')[1]?.split(';')[0];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    // Verify user role is guru
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: { select: { name: true } } }
    });

    if (!user || user.role.name !== 'guru') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get guru's halaqah - ensure consistent data retrieval
    const halaqah = await prisma.halaqah.findMany({
      where: { guruId: userId },
      include: {
        santri: {
          include: {
            santri: {
              select: {
                id: true,
                namaLengkap: true
              }
            }
          }
        },
        jadwal: true
      }
    });

    if (halaqah.length === 0) {
      return NextResponse.json({
        overview: {
          totalSantri: 0,
          totalHafalanToday: 0,
          absensiHadir: 0,
          absensiTotal: 0,
          absensiRate: 0,
          targetTertunda: 0,
          hafalanRate: 0
        },
        halaqahInfo: null
      });
    }

    // Aggregate data from all halaqah that guru teaches
    const allSantriIds = halaqah.flatMap(h => h.santri.map(hs => hs.santriId));
    const uniqueSantriIds = [...new Set(allSantriIds)]; // Remove duplicates if any

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get hafalan data for today
    const hafalanToday = await prisma.hafalan.findMany({
      where: {
        santriId: { in: uniqueSantriIds },
        tanggal: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Get attendance data for today
    const absensiToday = await prisma.absensi.findMany({
      where: {
        santriId: { in: uniqueSantriIds },
        tanggal: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Get pending targets
    const pendingTargets = await prisma.targetHafalan.count({
      where: {
        santriId: { in: uniqueSantriIds },
        status: { in: ['belum', 'proses'] }
      }
    });

    // Calculate hafalan rate (percentage of santri who have hafalan records today)
    const hafalanRate = uniqueSantriIds.length > 0 ? Math.round((hafalanToday.length / uniqueSantriIds.length) * 100) : 0;

    // Calculate attendance rate
    const absensiHadir = absensiToday.filter(a => a.status === 'masuk').length;
    const absensiRate = absensiToday.length > 0 ? Math.round((absensiHadir / absensiToday.length) * 100) : 0;

    // Aggregate halaqah info
    const halaqahInfo = halaqah.map(h => ({
      namaHalaqah: h.namaHalaqah,
      totalSantri: h.santri.length,
      jadwal: h.jadwal
    }));

    return NextResponse.json({
      overview: {
        totalSantri: uniqueSantriIds.length,
        totalHafalanToday: hafalanToday.length,
        absensiHadir,
        absensiTotal: absensiToday.length,
        absensiRate,
        targetTertunda: pendingTargets,
        hafalanRate
      },
      halaqahInfo: halaqahInfo
    });

  } catch (error) {
    console.error("Error fetching guru dashboard data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}