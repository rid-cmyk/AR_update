import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { TahunAkademikService, TahunAkademikServiceError } from '@/lib/services/tahun-akademik.service';

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized();
    const body = await request.json();
    const result = await TahunAkademikService.autoGenerate(user, body.startYear, body.endYear, body.autoSetActive);
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof TahunAkademikServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('Auto-generate tahun akademik error:', err);
    return ApiResponse.serverError('Gagal generate tahun akademik');
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized();
    const { searchParams } = new URL(request.url);
    const startYear = parseInt(searchParams.get('startYear') || '2024');
    const endYear = parseInt(searchParams.get('endYear') || '2025');
    const result = await TahunAkademikService.previewAutoGenerate(startYear, endYear);
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof TahunAkademikServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('Preview tahun akademik error:', err);
    return ApiResponse.serverError('Gagal preview tahun akademik');
  }
}
