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

    // Get halaqah data for this santri
    const halaqahSantriData = await prisma.halaqahSantri.findMany({
      where: {
        santriId: userId
      },
      include: {
        halaqah: {
          include: {
            guru: {
              select: {
                id: true,
                namaLengkap: true,
                username: true
              }
            }
          }
        }
      }
    });

    // Format the data for frontend
    const formattedData = halaqahSantriData.map(hs => ({
      id: hs.halaqah.id,
      namaHalaqah: hs.halaqah.namaHalaqah,
      guru: hs.halaqah.guru,
      tahunAkademik: hs.tahunAkademik,
      semester: hs.semester
    }));

    return NextResponse.json({
      halaqah: formattedData,
      totalHalaqah: formattedData.length
    });

  } catch (error) {
    console.error('Error fetching santri dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}