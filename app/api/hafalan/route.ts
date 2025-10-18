import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { StatusHafalan } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

// GET hafalan - with optional filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const halaqahId = searchParams.get('halaqahId');
    const santriId = searchParams.get('santriId');
    const tanggal = searchParams.get('tanggal');

    // Get token to identify user
    const token = request.headers.get('cookie')?.split('auth_token=')[1]?.split(';')[0];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    const where: Record<string, any> = {};

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { namaLengkap: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let santriIds: number[] = [];

    if (halaqahId) {
      // Get santri IDs from halaqah
      const halaqahSantri = await prisma.halaqahSantri.findMany({
        where: { halaqahId: Number(halaqahId) },
        select: { santriId: true }
      });
      santriIds = halaqahSantri.map(hs => hs.santriId);
    } else {
      // Build where clause for halaqah
      let whereClause: any = { guruId: userId };
      if (user.namaLengkap === "Nur Fathoni") {
        whereClause = {
          OR: [
            { guruId: userId },
            { namaHalaqah: "Umar" }
          ]
        };
      }

      // Get all santri from user's halaqah
      const userHalaqah = await prisma.halaqah.findMany({
        where: whereClause,
        include: {
          santri: {
            select: { santriId: true }
          }
        }
      });
      santriIds = userHalaqah.flatMap(h => h.santri.map(hs => hs.santriId));
    }

    where.santriId = { in: santriIds };

    if (santriId) {
      where.santriId = Number(santriId);
    }

    if (tanggal) {
      where.tanggal = {
        gte: new Date(tanggal + ' 00:00:00'),
        lt: new Date(tanggal + ' 23:59:59')
      };
    }

    const hafalan = await prisma.hafalan.findMany({
      where,
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        }
      },
      orderBy: { tanggal: 'desc' }
    });

    return NextResponse.json(hafalan);
  } catch (error) {
    console.error('GET /api/hafalan error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hafalan' },
      { status: 500 }
    );
  }
}

// CREATE hafalan
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { santriId, surat, ayatMulai, ayatSelesai, jenis, halaqahId, tanggal } = body;

    console.log('Creating hafalan:', body);

    if (!santriId || !surat || !ayatMulai || !ayatSelesai || !jenis || !tanggal) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify that santri belongs to the halaqah (if halaqahId provided)
    if (halaqahId) {
      const halaqahSantri = await prisma.halaqahSantri.findFirst({
        where: {
          halaqahId: Number(halaqahId),
          santriId: Number(santriId)
        }
      });

      if (!halaqahSantri) {
        return NextResponse.json(
          { error: 'Santri tidak terdaftar di halaqah ini' },
          { status: 400 }
        );
      }
    }

    // Create hafalan record
    const hafalan = await prisma.hafalan.create({
      data: {
        santriId: Number(santriId),
        surat,
        ayatMulai: Number(ayatMulai),
        ayatSelesai: Number(ayatSelesai),
        status: jenis === 'ziyadah' ? StatusHafalan.ziyadah : StatusHafalan.murojaah,
        tanggal: new Date(tanggal)
      },
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        }
      }
    });

    return NextResponse.json(hafalan);
  } catch (error: any) {
    console.error('POST /api/hafalan error:', error);
    return NextResponse.json({
      error: 'Failed to create hafalan',
      details: error.message
    }, { status: 500 });
  }
}