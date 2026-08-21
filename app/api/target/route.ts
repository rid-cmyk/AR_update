import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { TargetService } from '@/lib/services/target.service';

export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    const { searchParams } = new URL(request.url);
    const halaqahId = searchParams.get('halaqahId') ? Number(searchParams.get('halaqahId')) : undefined;
    const targets = await TargetService.listMultiRole(user, halaqahId);
    return ApiResponse.success(targets);

  } catch (error) {
    console.error('GET /api/target error:', error);
    return ApiResponse.serverError('Failed to fetch targets');
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await withAuth(request, ['super_admin', 'guru']);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    const body = await request.json();
    const target = await TargetService.createMultiRole(user, body);
    return ApiResponse.success(target, 201);

  } catch (error: any) {
    console.error('POST /api/target error:', error);
    if (error.message?.includes('Missing') || error.message?.includes('tidak terdaftar')) {
      return ApiResponse.error(error.message, 400);
    }
    if (error.message?.includes('tidak memiliki akses')) {
      return ApiResponse.error(error.message, 403);
    }
    return ApiResponse.error('Failed to create target', 500);
  }
}
