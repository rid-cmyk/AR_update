import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { withApiCache, cachedJsonResponse } from '@/lib/api-cache';
import { PengumumanService } from '@/lib/services/pengumuman.service';
import { parsePagination } from '@/lib/services/validation.service';

export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const targetAudience = searchParams.get('targetAudience') || undefined;

    const cacheKey = `pengumuman:role-${user.role.name}:user-${user.id}:page-${pagination.page}:limit-${pagination.limit}:aud-${targetAudience || 'all'}`;

    const result = await withApiCache(cacheKey, 60_000, async () => {
      return await PengumumanService.listMultiRole(user, pagination, targetAudience);
    });

    return cachedJsonResponse(result, 200, 30, 120);
  } catch (error) {
    console.error('GET /api/pengumuman error:', error);
    return ApiResponse.error('Failed to fetch pengumuman', 500);
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    const body = await request.json();
    const result = await PengumumanService.create(user, body);
    return ApiResponse.success(result);

  } catch (error: any) {
    console.error('POST /api/pengumuman error:', error);
    if (error.message?.includes('Access denied')) {
      return ApiResponse.forbidden(error.message);
    }
    if (error.message?.includes('harus diisi') || error.message?.includes('harus dipilih') || error.message?.includes('tidak valid')) {
      return ApiResponse.error(error.message, 400);
    }
    return ApiResponse.error('Failed to create pengumuman', 500);
  }
}
