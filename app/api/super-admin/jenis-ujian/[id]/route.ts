import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { JenisUjianService, JenisUjianServiceError } from '@/lib/services/jenis-ujian.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['super_admin', 'guru']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const { id } = await params;
    const data = await JenisUjianService.getById(user, parseInt(id));
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof JenisUjianServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Failed to fetch jenis ujian');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const { id } = await params;
    const body = await request.json();
    const data = await JenisUjianService.update(user, parseInt(id), body);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof JenisUjianServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Failed to update jenis ujian');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const { id } = await params;
    const data = await JenisUjianService.delete(user, parseInt(id));
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof JenisUjianServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Failed to delete jenis ujian');
  }
}
