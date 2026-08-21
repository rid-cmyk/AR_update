import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { SantriDataService, SantriDataServiceError } from '@/lib/services/santri-data.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['santri']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');

    const { searchParams } = new URL(request.url);
    const filters = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    };

    const data = await SantriDataService.getAbsensi(user, filters);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof SantriDataServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Error fetching santri absensi:', error);
    return ApiResponse.serverError('Internal server error');
  }
}
