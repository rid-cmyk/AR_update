import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { withApiCache, cachedJsonResponse } from '@/lib/api-cache';
import { HalaqahService } from '@/lib/services/halaqah.service';

export async function GET(request: Request) {
  const { user, error } = await withAuth(request);
  if (!user || error) {
    return ApiResponse.unauthorized(error || 'Unauthorized');
  }
  try {
    const formatted = await withApiCache('halaqah:all', 60_000, async () => {
      return await HalaqahService.listAll();
    });

    return cachedJsonResponse(formatted, 200, 60, 300);
  } catch (error) {
    console.error('GET /api/halaqah error:', error);
    return ApiResponse.error('Failed to fetch halaqah', 500);
  }
}

export async function POST(request: Request) {
  const { user, error } = await withAuth(request);
  if (error || !user) {
    return ApiResponse.unauthorized('Unauthorized');
  }
  try {
    const body = await request.json();
    const result = await HalaqahService.create(user, body);
    return ApiResponse.success(result);
  } catch (error: any) {
    console.error('POST /api/halaqah error:', error);
    if (error.message?.includes('required') || error.message?.includes('must be selected') || error.message?.includes('sudah terdaftar')) {
      return ApiResponse.error(error.message, 400);
    }
    return ApiResponse.error('Failed to create halaqah', 500);
  }
}
