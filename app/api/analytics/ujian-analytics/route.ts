import { NextRequest } from 'next/server'
import { withAuth, ApiResponse } from '@/lib/api-helpers'
import { AnalyticsService, AnalyticsServiceError } from '@/lib/services/analytics.service'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin', 'yayasan']);
    if (error || !user) return error === 'Insufficient permissions' ? ApiResponse.forbidden(error) : ApiResponse.unauthorized(error || 'Unauthorized');
    const { searchParams } = new URL(request.url)
    const result = await AnalyticsService.getUjianAnalytics({
      startDate: searchParams.get('startDate'), endDate: searchParams.get('endDate'),
      halaqahId: searchParams.get('halaqahId'), jenisUjian: searchParams.get('jenisUjian'), guruId: searchParams.get('guruId')
    });
    return ApiResponse.success({ success: true, data: result, message: `Analytics berhasil digenerate` })
  } catch (error) {
    if (error instanceof AnalyticsServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Error generating ujian analytics:', error)
    return ApiResponse.serverError('Gagal generate analytics ujian')
  }
}
