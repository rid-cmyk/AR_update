import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { SantriDataService, SantriDataServiceError } from '@/lib/services/santri-data.service';

export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');

    const data = await SantriDataService.getHafalan(user);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof SantriDataServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Error fetching santri hafalan:', error);
    return ApiResponse.serverError('Gagal mengambil data hafalan santri');
  }
}
