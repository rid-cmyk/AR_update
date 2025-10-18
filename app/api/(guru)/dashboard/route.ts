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

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { namaLengkap: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build where clause - Show halaqah where user is assigned as guru
    const whereClause = { guruId: userId };

    console.log('Current user ID:', userId, 'Name:', user.namaLengkap);
    console.log('Where clause:', { guruId: userId });
    console.log('UserId type:', typeof userId);

    console.log('User:', user.namaLengkap, 'UserId:', userId);
    console.log('Where clause:', JSON.stringify(whereClause, null, 2));

    // Get halaqah data for this guru
    const halaqahData = await prisma.halaqah.findMany({
      where: whereClause,
      include: {
        santri: {
          include: {
            santri: {
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

    console.log('Halaqah data found:', halaqahData.length, 'halaqah');
    halaqahData.forEach(h => {
      console.log('Halaqah:', h.namaHalaqah, 'ID:', h.id, 'Guru ID:', h.guruId);
    });

    // If no halaqah found, try alternative approach
    if (halaqahData.length === 0) {
      console.log('No halaqah found with where clause, trying alternative query...');

      // Try direct SQL-like query to debug
      const allHalaqah = await prisma.halaqah.findMany({
        select: { id: true, namaHalaqah: true, guruId: true }
      });

      console.log('All halaqah in database:', allHalaqah.map(h => ({
        id: h.id,
        namaHalaqah: h.namaHalaqah,
        guruId: h.guruId,
        guruIdType: typeof h.guruId
      })));

      // Filter manually to see if there's a type mismatch
      const manualFilter = allHalaqah.filter(h => h.guruId === userId);
      console.log('Manual filter result:', manualFilter);

      // If manual filter works, use it as fallback
      if (manualFilter.length > 0) {
        console.log('Using manual filter as fallback...');
        const fallbackData = await prisma.halaqah.findMany({
          where: {
            id: { in: manualFilter.map(h => h.id) }
          },
          include: {
            santri: {
              include: {
                santri: {
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

        console.log('Fallback query successful, found:', fallbackData.length, 'halaqah');
        // Use fallback data
        halaqahData.push(...fallbackData);
      }
    }

    // Format the data for frontend
    const formattedData = halaqahData.map(halaqah => ({
      id: halaqah.id,
      namaHalaqah: halaqah.namaHalaqah,
      jumlahSantri: halaqah.santri.length,
      santri: halaqah.santri.map(hs => hs.santri)
    }));

    return NextResponse.json({
      halaqah: formattedData,
      totalHalaqah: formattedData.length,
      totalSantri: formattedData.reduce((sum, h) => sum + h.jumlahSantri, 0)
    });

  } catch (error) {
    console.error('Error fetching guru dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}