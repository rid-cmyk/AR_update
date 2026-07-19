import prisma from '@/lib/database/prisma';
import { ApiResponse, withAuth } from '@/lib/api-helpers';

export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    // Ensure user is guru
    if (user.role.name !== 'guru') {
      return ApiResponse.forbidden('Access denied');
    }

    // Get halaqah data for this guru - ensure consistent data retrieval
    const halaqahData = await prisma.halaqah.findMany({
      where: { guruId: user.id },
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
        },
        jadwal: {
          select: {
            id: true,
            hari: true,
            jamMulai: true,
            jamSelesai: true
          }
        }
      }
    });

    console.log('Halaqah data found for guru:', halaqahData.length, 'halaqah');

    // Format the data for frontend
    const formattedData = halaqahData.map((halaqah: Record<string, unknown>) => ({
      id: halaqah.id,
      namaHalaqah: halaqah.namaHalaqah,
      jumlahSantri: (halaqah.santri as unknown[]).length,
      santri: (halaqah.santri as Record<string, unknown>[]).map((hs: Record<string, unknown>) => hs.santri),
      jadwal: halaqah.jadwal
    }));

    return ApiResponse.success({
      halaqah: formattedData,
      totalHalaqah: formattedData.length,
      totalSantri: formattedData.reduce((sum: number, h: Record<string, unknown>) => sum + (h.jumlahSantri as number), 0)
    });

  } catch (error) {
    console.error('Error fetching guru dashboard data:', error);
    return ApiResponse.serverError('Failed to fetch dashboard data');
  }
}