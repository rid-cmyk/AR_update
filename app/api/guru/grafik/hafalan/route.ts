import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { GrafikService, GrafikServiceError } from '@/lib/services/grafik.service';

export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request, ['guru']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const { searchParams } = new URL(request.url);
    const halaqahId = searchParams.get('halaqahId');
    const days = parseInt(searchParams.get('days') || '7');

    if (!halaqahId) return ApiResponse.error('Halaqah ID is required', 400);

    const data = await GrafikService.getHafalanChart(user, parseInt(halaqahId), days);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof GrafikServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Failed to fetch hafalan chart data');
  }
}
