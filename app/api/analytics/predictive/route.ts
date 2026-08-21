import { withAuth, ApiResponse } from '@/lib/api-helpers'
import { AnalyticsService, AnalyticsServiceError } from '@/lib/services/analytics.service'

export async function GET(request: Request) {
  try {
    const allowedRoles = ['super_admin', 'yayasan', 'guru', 'santri', 'ortu'];
    const { user, error } = await withAuth(request, allowedRoles);
    if (error === 'Insufficient permissions') return ApiResponse.forbidden('Forbidden: Role not allowed');
    if (error || !user) return ApiResponse.unauthorized('Unauthorized');
    if (!allowedRoles.includes(user.role.name)) return ApiResponse.forbidden('Forbidden: Role not allowed');
    const { searchParams } = new URL(request.url)
    const result = await AnalyticsService.getPredictiveAnalytics(user, searchParams.get('santriId'), searchParams.get('daysWindow'), searchParams.get('kkmThreshold'));
    return ApiResponse.success({ success: true, data: result });
  } catch (error: unknown) {
    if (error instanceof AnalyticsServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Error fetching predictive analytics:', error);
    return ApiResponse.serverError('Internal server error');
  }
}
