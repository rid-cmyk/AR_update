import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { StatusTarget } from '@prisma/client';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const halaqahId = searchParams.get('halaqahId');

    // Get token to identify user
    const token = request.headers.get('cookie')?.split('auth_token=')[1]?.split(';')[0];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

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
      let whereClause = { guruId: userId };
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

    const targets = await prisma.targetHafalan.findMany({
      where: {
        santriId: { in: santriIds }
      },
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        }
      },
      orderBy: { deadline: 'asc' }
    });

    return NextResponse.json(targets);
  } catch (error) {
    console.error('GET /api/target error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch targets' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { santriId, surat, ayatTarget, deadline, status, halaqahId } = body;

    if (!santriId || !surat || !ayatTarget || !deadline || !halaqahId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify santri belongs to halaqah
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

    let mappedStatus: StatusTarget = StatusTarget.belum;
    if (status === 'proses') mappedStatus = StatusTarget.proses;
    else if (status === 'selesai') mappedStatus = StatusTarget.selesai;

    const target = await prisma.targetHafalan.create({
      data: {
        santriId: Number(santriId),
        surat,
        ayatTarget: Number(ayatTarget),
        deadline: new Date(deadline),
        status: mappedStatus
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

    return NextResponse.json(target);
  } catch (error) {
    console.error('POST /api/target error:', error);
    return NextResponse.json(
      { error: 'Failed to create target' },
      { status: 500 }
    );
  }
}