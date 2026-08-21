import { NextRequest } from "next/server";
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { DashboardService, DashboardServiceError } from '@/lib/services/dashboard.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');

    const data = await DashboardService.getOrtuDashboard(user);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof DashboardServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error("Error fetching ortu dashboard data:", error);
    return ApiResponse.serverError("Internal server error");
  }
}
