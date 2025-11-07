import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

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

    if (!user || user.role.name !== 'santri') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get halaqah info for this santri
    const halaqahSantri = await prisma.halaqahSantri.findFirst({
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
            },
            jadwal: {
              orderBy: {
                hari: 'asc'
              }
            }
          }
        }
      }
    });

    if (!halaqahSantri) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'Belum ditugaskan ke halaqah'
      });
    }

    // Format jadwal
    const jadwalFormatted = halaqahSantri.halaqah.jadwal.map(j => ({
      id: j.id,
      hari: j.hari,
      waktuMulai: j.jamMulai ? new Date(j.jamMulai).toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }) : '',
      waktuSelesai: j.jamSelesai ? new Date(j.jamSelesai).toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }) : '',
      materi: null // Could be added later if needed
    }));

    const halaqahInfo = {
      namaHalaqah: halaqahSantri.halaqah.namaHalaqah,
      guru: halaqahSantri.halaqah.guru?.namaLengkap || 'Unknown',
      jadwal: jadwalFormatted,
      tahunAkademik: halaqahSantri.tahunAkademik,
      semester: halaqahSantri.semester
    };

    return NextResponse.json({
      success: true,
      data: halaqahInfo
    });

  } catch (error) {
    console.error('Error fetching santri halaqah:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}