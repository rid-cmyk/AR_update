import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';

// GET jadwal untuk santri
export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    // Ensure user is santri
    if (user.role.name !== 'santri') {
      return ApiResponse.forbidden('Access denied');
    }

    const jadwal = await prisma.jadwal.findMany({
      where: {
        halaqah: {
          santri: {
            some: {
              santriId: user.id
            }
          }
        }
      },
      include: {
        halaqah: {
          include: {
            guru: {
              select: {
                id: true,
                namaLengkap: true
              }
            },
            santri: {
              include: {
                santri: {
                  select: {
                    id: true,
                    namaLengkap: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { hari: 'asc' },
        { jamMulai: 'asc' }
      ]
    });

    const formatted = jadwal.map(j => ({
      id: j.id,
      hari: j.hari,
      jamMulai: j.jamMulai,
      jamSelesai: j.jamSelesai,
      halaqah: {
        id: j.halaqah.id,
        namaHalaqah: j.halaqah.namaHalaqah,
        guru: j.halaqah.guru,
        jumlahSantri: j.halaqah.santri.length
      }
    }));

    console.log(`Santri ${user.namaLengkap} has ${formatted.length} jadwal`);
    return NextResponse.json(formatted);

  } catch (error) {
    console.error('GET /api/santri/jadwal error:', error);
    return NextResponse.json({ error: 'Failed to fetch jadwal' }, { status: 500 });
  }
}