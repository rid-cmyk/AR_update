import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { DashboardService, DashboardServiceError } from '@/lib/services/dashboard.service';

export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request, ['guru']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');

    const data = await DashboardService.getGuruDashboard(user);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof DashboardServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Error fetching guru dashboard data:', error);
    return ApiResponse.serverError('Failed to fetch dashboard data');
  }
}
