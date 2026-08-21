import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { PrestasiService, PrestasiServiceError } from '@/lib/services/prestasi.service';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['guru']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const { id } = await params;
    const body = await request.json();
    const data = await PrestasiService.update(user, parseInt(id), body);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof PrestasiServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Failed to update prestasi');
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['guru']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const { id } = await params;
    const body = await request.json();
    const data = await PrestasiService.validate(user, parseInt(id), body.validated);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof PrestasiServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Failed to update prestasi validation');
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['guru']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const { id } = await params;
    const data = await PrestasiService.delete(user, parseInt(id));
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof PrestasiServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Failed to delete prestasi');
  }
}
