import { NextRequest, NextResponse } from "next/server";
import prisma from '@/lib/prisma';

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.headers.get('cookie')?.split('auth_token=')[1]?.split(';')[0];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    // Verify user role is santri
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: { select: { name: true } } }
    });

    if (!user || user.role.name !== 'santri') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get santri's halaqah information
    const halaqahSantri = await prisma.halaqahSantri.findFirst({
      where: { santriId: userId },
      include: {
        halaqah: {
          include: {
            guru: {
              select: {
                namaLengkap: true
              }
            }
          }
        }
      }
    });

    if (!halaqahSantri) {
      return NextResponse.json({
        hafalanProgress: [],
        recentHafalan: [],
        targets: [],
        halaqahInfo: null
      });
    }

    // Get hafalan data for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const hafalanData = await prisma.hafalan.findMany({
      where: {
        santriId: userId,
        tanggal: {
          gte: sevenDaysAgo
        }
      },
      orderBy: {
        tanggal: 'asc'
      }
    });

    // Process hafalan progress data for chart
    const hafalanProgress = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayData = hafalanData.filter(h => h.tanggal.toISOString().split('T')[0] === dateStr);
      const ziyadah = dayData.filter(h => h.status === 'ziyadah').length;
      const murojaah = dayData.filter(h => h.status === 'murojaah').length;

      hafalanProgress.push({
        date: dateStr,
        ziyadah,
        murojaah,
        total: ziyadah + murojaah
      });
    }

    // Get recent hafalan (last 10 entries)
    const recentHafalanRaw = await prisma.hafalan.findMany({
      where: { santriId: userId },
      include: {
        santri: {
          select: { namaLengkap: true }
        }
      },
      orderBy: {
        tanggal: 'desc'
      },
      take: 10
    });

    const recentHafalan = recentHafalanRaw.map(h => ({
      id: h.id,
      tanggal: h.tanggal.toISOString().split('T')[0],
      jenis: h.status,
      surah: h.surat,
      ayat: `${h.ayatMulai}-${h.ayatSelesai}`,
      guru: halaqahSantri.halaqah.guru.namaLengkap
    }));

    // Get target hafalan data
    const targetData = await prisma.targetHafalan.findMany({
      where: { santriId: userId },
      orderBy: {
        deadline: 'asc'
      }
    });

    const targets = targetData.map(t => ({
      id: t.id,
      judul: `Target ${t.surat}`,
      deskripsi: `Target hafalan ${t.surat} sampai ayat ${t.ayatTarget}`,
      targetAyat: t.ayatTarget,
      currentAyat: 0, // This would need to be calculated based on actual progress
      deadline: t.deadline.toISOString().split('T')[0],
      status: t.status === 'selesai' ? 'completed' : t.status === 'proses' ? 'active' : 'active',
      kategori: 'ziyadah' // Default category
    }));

    // Calculate current ayat for targets (simplified - in real app this would be more complex)
    targets.forEach(target => {
      // This is a simplified calculation - in reality you'd track progress per target
      const targetHafalan = hafalanData.filter(h => h.surat === target.judul.replace('Target ', ''));
      target.currentAyat = targetHafalan.reduce((sum, h) => sum + (h.ayatSelesai - h.ayatMulai + 1), 0);
    });

    return NextResponse.json({
      hafalanProgress,
      recentHafalan,
      targets,
      halaqahInfo: {
        namaHalaqah: halaqahSantri.halaqah.namaHalaqah,
        guru: halaqahSantri.halaqah.guru.namaLengkap
      }
    });

  } catch (error) {
    console.error("Error fetching santri dashboard data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}