import { NextRequest } from 'next/server'
import { withAuth, ApiResponse } from '@/lib/api-helpers'
import { AnalyticsService, AnalyticsServiceError } from '@/lib/services/analytics.service'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin', 'yayasan']);
    if (error || !user) return error === 'Insufficient permissions' ? ApiResponse.forbidden(error) : ApiResponse.unauthorized(error || 'Unauthorized');
    const { searchParams } = new URL(request.url)
    const result = await AnalyticsService.getTahfidzReports(searchParams.get('semester') || 'S1', searchParams.get('tahunAjaran') || '2024/2025');
    return ApiResponse.success(result)
  } catch (error) {
    if (error instanceof AnalyticsServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Error generating tahfidz reports:', error)
    return ApiResponse.serverError('Gagal mengambil data laporan tahfidz')
  }
}
