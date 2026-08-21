import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { TahunAkademikService, TahunAkademikServiceError } from '@/lib/services/tahun-akademik.service';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');
    const { id } = await params;
    const result = await TahunAkademikService.setActive(parseInt(id));
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof TahunAkademikServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('Error activating tahun akademik:', err);
    return ApiResponse.serverError();
  }
}
