import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// GET - Ambil daftar anak untuk orang tua
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

    // Get halaqah info for each anak
    const anakWithHalaqah = await Promise.all(
      orangTuaSantri.map(async (ots) => {
        const halaqahSantri = await prisma.halaqahSantri.findFirst({
          where: {
            santriId: ots.santriId
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

        return {
          ...ots.santri,
          halaqah: halaqahSantri ? {
            id: halaqahSantri.halaqah.id,
            namaHalaqah: halaqahSantri.halaqah.namaHalaqah,
            guru: halaqahSantri.halaqah.guru
          } : null
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: anakWithHalaqah
    });

  } catch (error) {
    console.error('Error fetching anak list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

