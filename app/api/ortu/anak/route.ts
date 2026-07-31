import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';



// GET - Ambil daftar anak untuk orang tua
export async function GET() {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = verifyToken<Record<string, unknown>>(token);
    const userId = decoded.id as number;

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user || user.role.name !== 'ortu') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get anak-anak dari orang tua ini
    const orangTuaSantri = await prisma.orangTuaSantri.findMany({
      where: {
        orangTuaId: userId
      },
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true,
            foto: true
          }
        }
      }
    });

    // Get halaqah info for all anak in one bulk query (avoiding N+1 queries)
    const santriIds = orangTuaSantri.map(ots => ots.santriId);
    const allHalaqahSantri = await prisma.halaqahSantri.findMany({
      where: {
        santriId: { in: santriIds }
      },
      include: {
        halaqah: {
          include: {
            guru: {
              select: {
                id: true,
                namaLengkap: true
              }
            }
          }
        }
      }
    });

    const halaqahMap = new Map(allHalaqahSantri.map(hs => [hs.santriId, hs]));

    const anakWithHalaqah = orangTuaSantri.map(ots => {
      const halaqahSantri = halaqahMap.get(ots.santriId);
      return {
        ...ots.santri,
        halaqah: halaqahSantri ? {
          id: halaqahSantri.halaqah.id,
          namaHalaqah: halaqahSantri.halaqah.namaHalaqah,
          guru: halaqahSantri.halaqah.guru
        } : null
      };
    });

    return NextResponse.json({
      success: true,
      data: anakWithHalaqah
    });

  } catch (error) {
    console.error('Error fetching anak list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
  }
}

