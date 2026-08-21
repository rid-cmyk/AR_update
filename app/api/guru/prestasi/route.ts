import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { PrestasiService, PrestasiServiceError } from '@/lib/services/prestasi.service';

export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request, ['guru']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const { searchParams } = new URL(request.url);
    const halaqahId = searchParams.get('halaqahId') ? parseInt(searchParams.get('halaqahId')!) : undefined;

    const data = await PrestasiService.list(user, halaqahId);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof PrestasiServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Failed to fetch prestasi');
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await withAuth(request, ['guru']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const body = await request.json();
    const data = await PrestasiService.create(user, body);
    return ApiResponse.success(data, 201);
  } catch (error: any) {
    if (error instanceof PrestasiServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Failed to create prestasi');
  }
}
