import { NextRequest } from 'next/server'
import { withAuth, ApiResponse } from '@/lib/api-helpers'
import { AnalyticsService, AnalyticsServiceError } from '@/lib/services/analytics.service'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin', 'yayasan']);
    if (error || !user) return error === 'Insufficient permissions' ? ApiResponse.forbidden(error) : ApiResponse.unauthorized(error || 'Unauthorized');
    const { searchParams } = new URL(request.url)
    const result = await AnalyticsService.getSantriDetail(searchParams.get('santriId') || '');
    return ApiResponse.success(result);
  } catch (error) {
    if (error instanceof AnalyticsServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('❌ Santri detail error:', error);
    return ApiResponse.serverError('Failed to fetch santri details');
  }
}
