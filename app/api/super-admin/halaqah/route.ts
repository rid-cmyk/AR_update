import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { HalaqahService, HalaqahServiceError } from '@/lib/services/halaqah.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (!user || error) return ApiResponse.unauthorized(error || 'Unauthorized');
    const { searchParams } = new URL(request.url);
    const tahunAjaranId = searchParams.get('tahunAjaranId') || undefined;
    const result = await HalaqahService.listForAdmin(tahunAjaranId);
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof HalaqahServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('Error fetching halaqah:', err);
    return ApiResponse.serverError('Internal server error');
  }
}
