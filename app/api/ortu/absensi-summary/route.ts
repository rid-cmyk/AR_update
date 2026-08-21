import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { OrtuService, OrtuServiceError } from '@/lib/services/ortu.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['ortu']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');

    const { searchParams } = new URL(request.url);
    const anakId = searchParams.get('anakId');

    const data = await OrtuService.getAbsensiSummary(user, anakId);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof OrtuServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Error fetching absensi summary:', error);
    return ApiResponse.serverError('Internal server error');
  }
}
