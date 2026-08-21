import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { TahunAkademikService, TahunAkademikServiceError } from '@/lib/services/tahun-akademik.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');
    const result = await TahunAkademikService.list();
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof TahunAkademikServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('Error fetching tahun ajaran:', err);
    return ApiResponse.serverError('Gagal mengambil data tahun akademik');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');
    const body = await request.json();
    const result = await TahunAkademikService.create(user, body);
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof TahunAkademikServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('Error creating tahun ajaran:', err);
    return ApiResponse.serverError('Gagal membuat tahun akademik');
  }
}
