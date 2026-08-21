import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { TargetService, TargetServiceError } from '@/lib/services/target.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['santri']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || undefined;
    const result = await TargetService.listForSantri(user, { page, limit }, status);
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof TargetServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('Error fetching santri target:', err);
    return ApiResponse.serverError('Internal server error');
  }
}
