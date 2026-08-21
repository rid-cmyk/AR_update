import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { withApiCache, cachedJsonResponse } from '@/lib/api-cache';
import { GuruSantriService, GuruSantriServiceError } from '@/lib/services/guru-santri.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['guru']);
    if (error || !user) return ApiResponse.unauthorized('Silakan login terlebih dahulu');

    const payload = await withApiCache('guru:santri:' + user.id, 60_000, async () => {
      const data = await GuruSantriService.getByHalaqah(user);
      if (!data) return null;

      return {
        success: true,
        data,
        message: 'Data santri dari ' + data.halaqahList.length + ' halaqah berhasil diambil'
      };
    });

    if (!payload) return ApiResponse.notFound('Anda belum mengajar di halaqah manapun');

    return cachedJsonResponse(payload, 200, 60, 300);
  } catch (error: any) {
    if (error instanceof GuruSantriServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Error fetching santri data:', error);
    return ApiResponse.serverError('Gagal mengambil data santri');
  }
}
