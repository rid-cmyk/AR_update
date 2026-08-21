import { withAuth, ApiResponse } from '@/lib/api-helpers';
import { AnalyticsService, AnalyticsServiceError } from '@/lib/services/analytics.service';

export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request, ['guru']);
    if (error || !user) return ApiResponse.unauthorized('Unauthorized');
    const result = await AnalyticsService.getGuruDashboard(user);
    return ApiResponse.success(result);
  } catch (error) {
    if (error instanceof AnalyticsServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Error fetching guru dashboard analytics:', error);
    return ApiResponse.serverError('Gagal mengambil data dashboard');
  }
}
