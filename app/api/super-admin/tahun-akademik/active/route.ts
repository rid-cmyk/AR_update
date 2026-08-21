import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { TahunAkademikService, TahunAkademikServiceError } from '@/lib/services/tahun-akademik.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized();
    const result = await TahunAkademikService.getActive();
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof TahunAkademikServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('Get active tahun akademik error:', err);
    return ApiResponse.serverError('Gagal mendapatkan tahun akademik aktif');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized();
    const body = await request.json();
    if (!body.tahunAjaranId) return ApiResponse.error('tahunAjaranId harus diisi', 400);
    const result = await TahunAkademikService.setActive(body.tahunAjaranId);
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof TahunAkademikServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('Set active tahun akademik error:', err);
    return ApiResponse.serverError('Gagal mengaktifkan tahun akademik');
  }
}
