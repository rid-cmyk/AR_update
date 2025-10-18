import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const halaqahId = searchParams.get('halaqahId');
    const tanggal = searchParams.get('tanggal');

    if (!tanggal) {
      return NextResponse.json({ error: 'tanggal is required' }, { status: 400 });
    }

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

    let jadwalIds: number[] = [];

    if (halaqahId) {
      // Get jadwal for this halaqah on this date
      const jadwal = await prisma.jadwal.findFirst({
        where: {
          halaqahId: Number(halaqahId),
          jamMulai: {
            gte: new Date(tanggal + ' 00:00:00'),
            lt: new Date(tanggal + ' 23:59:59')
          }
        }
      });
      if (jadwal) jadwalIds = [jadwal.id];
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

      // Get all jadwal for user's halaqah on this date
      const userHalaqah = await prisma.halaqah.findMany({
        where: whereClause,
        select: { id: true }
      });
      const halaqahIds = userHalaqah.map(h => h.id);

      const jadwals = await prisma.jadwal.findMany({
        where: {
          halaqahId: { in: halaqahIds },
          jamMulai: {
            gte: new Date(tanggal + ' 00:00:00'),
            lt: new Date(tanggal + ' 23:59:59')
          }
        },
        select: { id: true }
      });
      jadwalIds = jadwals.map(j => j.id);
    }

    if (jadwalIds.length === 0) {
      return NextResponse.json([]);
    }

    // Get absensi for these jadwals
    const absensi = await prisma.absensi.findMany({
      where: {
        jadwalId: { in: jadwalIds }
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

    return NextResponse.json(absensi);
  } catch (error) {
    console.error('GET /api/absensi error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch absensi' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { santriId, status, tanggal, halaqahId } = body;

    if (!santriId || !status || !tanggal || !halaqahId) {
      return NextResponse.json(
        { error: 'santriId, status, tanggal, halaqahId are required' },
        { status: 400 }
      );
    }

    // Map status
    let mappedStatus = status;
    if (status === 'masuk') mappedStatus = 'masuk';
    else if (status === 'izin') mappedStatus = 'izin';
    else if (status === 'tidak') mappedStatus = 'alpha';
    else mappedStatus = 'alpha'; // default

    // Find jadwal for this halaqah on this date
    const jadwal = await prisma.jadwal.findFirst({
      where: {
        halaqahId: Number(halaqahId),
        jamMulai: {
          gte: new Date(tanggal + ' 00:00:00'),
          lt: new Date(tanggal + ' 23:59:59')
        }
      }
    });

    if (!jadwal) {
      return NextResponse.json(
        { error: 'No jadwal found for this halaqah on this date' },
        { status: 400 }
      );
    }

    // Check if absensi already exists
    const existing = await prisma.absensi.findFirst({
      where: {
        santriId: Number(santriId),
        jadwalId: jadwal.id
      }
    });

    if (existing) {
      // Update
      const updated = await prisma.absensi.update({
        where: { id: existing.id },
        data: { status: mappedStatus as any },
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
      return NextResponse.json(updated);
    } else {
      // Create
      const absensi = await prisma.absensi.create({
        data: {
          santriId: Number(santriId),
          jadwalId: jadwal.id,
          status: mappedStatus as any,
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
      return NextResponse.json(absensi);
    }
  } catch (error) {
    console.error('POST /api/absensi error:', error);
    return NextResponse.json(
      { error: 'Failed to save absensi' },
      { status: 500 }
    );
  }
}