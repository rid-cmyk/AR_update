import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { TemplateUjianService, TemplateUjianServiceError } from '@/lib/services/template-ujian.service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, komponenId: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const { komponenId } = await params;
    const body = await request.json();
    const data = await TemplateUjianService.updateKomponen(user, parseInt(komponenId), body);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof TemplateUjianServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Gagal mengubah komponen');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, komponenId: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const { komponenId } = await params;
    const data = await TemplateUjianService.deleteKomponen(user, parseInt(komponenId));
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof TemplateUjianServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Gagal menghapus komponen');
  }
}
