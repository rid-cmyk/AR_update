import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { withApiCache, cachedJsonResponse } from '@/lib/api-cache';
import { RaportService } from '@/lib/services/raport.service';

export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request, ['guru', 'super_admin', 'yayasan']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');
    const { searchParams } = new URL(request.url);
    const halaqahId = searchParams.get('halaqahId');
    const semester = searchParams.get('semester');
    const tahunAjaran = searchParams.get('tahunAjaran');

    if (!halaqahId || !semester || !tahunAjaran) {
      return ApiResponse.error('halaqahId, semester, tahunAjaran are required', 400);
    }

    const cacheKey = `raport:${halaqahId}:${semester}:${tahunAjaran}`;
    const raportData = await withApiCache(cacheKey, 300_000, async () => {
      return await RaportService.fetchRaportData(Number(halaqahId), semester, tahunAjaran);
    });

    return cachedJsonResponse(raportData, 200, 300, 600);
  } catch (error) {
    console.error('GET /api/raport error:', error);
    return ApiResponse.error('Failed to fetch raport', 500);
  }
}
