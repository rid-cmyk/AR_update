import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { OrtuService, OrtuServiceError } from '@/lib/services/ortu.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['ortu']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');

    const { searchParams } = new URL(request.url);
    const anakId = searchParams.get('anakId');

    const targets = await OrtuService.getTarget(user, anakId);
    return ApiResponse.success(targets);
  } catch (error: any) {
    if (error instanceof OrtuServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Error fetching target hafalan:', error);
    return ApiResponse.serverError('Internal server error');
  }
}
