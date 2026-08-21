import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { NotifikasiService, NotifikasiServiceError } from '@/lib/services/notifikasi.service';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);
    const { id } = await params;
    const body = await request.json();
    const result = await NotifikasiService.markAsRead(id, user, body.action);
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof NotifikasiServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('PATCH /api/notifikasi/[id] error:', err);
    return ApiResponse.error('Failed to update notification', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);
    const { id } = await params;
    const result = await NotifikasiService.delete(id, user);
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof NotifikasiServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('DELETE /api/notifikasi/[id] error:', err);
    return ApiResponse.error('Failed to delete notification', 500);
  }
}
