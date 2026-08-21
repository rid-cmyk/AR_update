import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { TemplateUjianService, TemplateUjianServiceError } from '@/lib/services/template-ujian.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const resolvedParams = await params;
    const data = await TemplateUjianService.getById(user, parseInt(resolvedParams.id));
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof TemplateUjianServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Gagal mengambil detail template ujian');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const resolvedParams = await params;
    const data = await TemplateUjianService.delete(user, parseInt(resolvedParams.id));
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof TemplateUjianServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Gagal menghapus template ujian');
  }
}
