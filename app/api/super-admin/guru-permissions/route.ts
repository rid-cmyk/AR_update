import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { GuruPermissionService, GuruPermissionServiceError } from '@/lib/services/guru-permission.service';

export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const { searchParams } = new URL(request.url);
    const guruId = searchParams.get('guruId');
    const filters = { guruId: guruId ? parseInt(guruId) : undefined };

    const data = await GuruPermissionService.list(user, filters);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof GuruPermissionServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Failed to fetch guru permissions');
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const body = await request.json();
    const data = await GuruPermissionService.upsert(user, body);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof GuruPermissionServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Failed to create/update guru permission');
  }
}
