import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { GuruPermissionService, GuruPermissionServiceError } from '@/lib/services/guru-permission.service';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const { id } = await params;
    const body = await request.json();
    const data = await GuruPermissionService.update(user, parseInt(id), body);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof GuruPermissionServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Failed to update guru permission');
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const { id } = await params;
    const data = await GuruPermissionService.delete(user, parseInt(id));
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof GuruPermissionServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Failed to delete guru permission');
  }
}
