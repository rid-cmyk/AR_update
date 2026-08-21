import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { TahunAkademikService, TahunAkademikServiceError } from '@/lib/services/tahun-akademik.service';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');
    const { id } = await params;
    const body = await request.json();
    const result = await TahunAkademikService.update(parseInt(id), body);
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof TahunAkademikServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('Error updating tahun ajaran:', err);
    return ApiResponse.serverError();
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');
    const { id } = await params;
    const result = await TahunAkademikService.delete(parseInt(id));
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof TahunAkademikServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('Error deleting tahun ajaran:', err);
    return ApiResponse.serverError();
  }
}
