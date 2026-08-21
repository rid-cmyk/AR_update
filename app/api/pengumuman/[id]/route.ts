import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { PengumumanService } from '@/lib/services/pengumuman.service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);
    const resolvedParams = await params;
    const data = await PengumumanService.getById(user, parseInt(resolvedParams.id));
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error.message === 'Pengumuman not found') return ApiResponse.notFound(error.message);
    if (error.message === 'Access denied') return ApiResponse.forbidden(error.message);
    if (error.message === 'Invalid pengumuman ID') return ApiResponse.error(error.message, 400);
    return ApiResponse.error('Failed to fetch pengumuman', 500);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);
    const body = await request.json();
    const resolvedParams = await params;
    const data = await PengumumanService.update(user, parseInt(resolvedParams.id), body);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error.message === 'Pengumuman not found') return ApiResponse.notFound(error.message);
    if (error.message === 'Access denied') return ApiResponse.forbidden(error.message);
    if (error.message.includes('harus') || error.message.includes('Invalid') || error.message.includes('tidak valid')) return ApiResponse.error(error.message, 400);
    return ApiResponse.error('Failed to update pengumuman', 500);
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
    const data = await PengumumanService.delete(user, parseInt(resolvedParams.id));
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error.message === 'Pengumuman not found') return ApiResponse.notFound(error.message);
    if (error.message === 'Access denied') return ApiResponse.forbidden(error.message);
    if (error.message === 'Invalid pengumuman ID') return ApiResponse.error(error.message, 400);
    return ApiResponse.error('Failed to delete pengumuman', 500);
  }
}
