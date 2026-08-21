import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { PengumumanService } from '@/lib/services/pengumuman.service';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);
    const resolvedParams = await params;
    const data = await PengumumanService.markAsRead(user.id, parseInt(resolvedParams.id));
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error.message === 'Invalid ID') return ApiResponse.error(error.message, 400);
    return ApiResponse.error('Failed to mark pengumuman as read', 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);
    const resolvedParams = await params;
    const data = await PengumumanService.markAsUnread(user.id, parseInt(resolvedParams.id));
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error.message === 'Invalid ID') return ApiResponse.error(error.message, 400);
    return ApiResponse.error('Failed to mark pengumuman as unread', 500);
  }
}
