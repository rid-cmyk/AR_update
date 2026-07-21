import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';



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
    const userId = typeof decoded.id === 'string' ? parseInt(decoded.id) : (decoded.id as number);

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user || (user as any).role.name !== 'santri') {
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
    const halaqahObj = (halaqahSantri as any).halaqah;
    const jadwalFormatted = halaqahObj.jadwal.map((j: any) => ({
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
      namaHalaqah: halaqahObj.namaHalaqah,
      guru: halaqahObj.guru?.namaLengkap || 'Unknown',
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
  }
}

