import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { SantriDataService } from '@/lib/services/santri-data.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['santri']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');

    const halaqahInfo = await SantriDataService.getHalaqahInfo(user as any);
    return ApiResponse.success(halaqahInfo);
  } catch (error: any) {
    if (error?.name === 'SantriDataServiceError') return ApiResponse.error(error.message, error.statusCode)
    return ApiResponse.serverError('Internal server error');
  }
}
