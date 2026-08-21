import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { PengumumanService, PengumumanServiceError } from '@/lib/services/pengumuman.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');

    const pengumumanId = parseInt((await params).id);
    
    await PengumumanService.markAsRead(user.id, pengumumanId);
    return ApiResponse.success({ message: 'Marked as read' });

  } catch (error: any) {
    if (error instanceof PengumumanServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Error marking pengumuman as read:', error);
    return ApiResponse.serverError('Internal server error');
  }
}
