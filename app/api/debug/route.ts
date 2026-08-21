import prisma from '@/lib/database/prisma';
import { ApiResponse, withAuth } from '@/lib/api-helpers';

export async function GET(request: Request) {
  try {
    const { user, error: authError } = await withAuth(request, ['super_admin']);
    if (authError || !user) {
      return ApiResponse.unauthorized('Unauthorized');
    }

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        namaLengkap: true,
        username: true,
        role: {
          select: { name: true }
        }
      }
    });

    // Get all halaqah
    const halaqah = await prisma.halaqah.findMany({
      include: {
        guru: {
          select: { id: true, namaLengkap: true }
        },
        santri: {
          include: {
            santri: {
              select: { id: true, namaLengkap: true }
            }
          }
        }
      }
    });

    // Get all jadwal
    const jadwal = await prisma.jadwal.findMany({
      include: {
        halaqah: {
          select: { id: true, namaHalaqah: true }
        }
      }
    });

    return ApiResponse.success({
      users,
      halaqah,
      jadwal,
      summary: {
        totalUsers: users.length,
        totalHalaqah: halaqah.length,
        totalJadwal: jadwal.length
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    return ApiResponse.error('Debug failed', 500);
  }
}