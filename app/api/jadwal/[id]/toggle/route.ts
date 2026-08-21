import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { JadwalService, JadwalServiceError } from '@/lib/services/jadwal.service';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);
    
    const resolvedParams = await params;
    const data = await JadwalService.toggleActive(user, parseInt(resolvedParams.id));
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof JadwalServiceError) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    return ApiResponse.error('Failed to toggle jadwal', 500);
  }
}
