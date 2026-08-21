import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { HalaqahService, HalaqahServiceError } from '@/lib/services/halaqah.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['guru']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');
    const result = await HalaqahService.listAccessible(user);
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof HalaqahServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('Error fetching accessible halaqah:', err);
    return ApiResponse.serverError();
  }
}
