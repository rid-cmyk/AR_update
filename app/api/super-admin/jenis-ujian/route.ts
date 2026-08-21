import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { JenisUjianService, JenisUjianServiceError } from '@/lib/services/jenis-ujian.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin', 'guru']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const data = await JenisUjianService.list(user);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof JenisUjianServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Failed to fetch jenis ujian');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const body = await request.json();
    const data = await JenisUjianService.create(user, body);
    return ApiResponse.success(data, 201);
  } catch (error: any) {
    if (error instanceof JenisUjianServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Failed to create jenis ujian');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return ApiResponse.error('ID jenis ujian wajib diisi', 400);

    const data = await JenisUjianService.delete(user, parseInt(id));
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof JenisUjianServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Gagal menghapus jenis ujian');
  }
}
