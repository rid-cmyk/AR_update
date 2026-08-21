import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { PengumumanService } from '@/lib/services/pengumuman.service';

export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    const data = await PengumumanService.getUnreadLatest(user, limit);
    return ApiResponse.success(data);
  } catch (error: any) {
    return ApiResponse.error('Failed to fetch latest pengumuman', 500);
  }
}
