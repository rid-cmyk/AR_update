import { NextRequest } from "next/server";
import { withAuth, ApiResponse } from '@/lib/api-helpers';
import { AnalyticsService, AnalyticsServiceError } from '@/lib/services/analytics.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin', 'yayasan']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');
    const result = await AnalyticsService.getDashboard();
    return ApiResponse.success(result);
  } catch (error) {
    if (error instanceof AnalyticsServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error("Error fetching admin dashboard data:", error);
    return ApiResponse.serverError('Internal server error');
  }
}
