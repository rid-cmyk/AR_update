import { ApiResponse, withAuth } from "@/lib/api-helpers";
import { withApiCache, cachedJsonResponse } from "@/lib/api-cache";
import { DashboardService, DashboardServiceError } from "@/lib/services/dashboard.service";

export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized();

    const statsData = await withApiCache("admin:dashboard-stats", 120_000, async () => {
      return await DashboardService.getAdminDashboardStats(user);
    });

    return cachedJsonResponse(statsData, 200, 60, 180);
  } catch (error: any) {
    if (error instanceof DashboardServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error("Error fetching dashboard stats:", error);
    return ApiResponse.serverError('Failed to fetch dashboard stats');
  }
}
