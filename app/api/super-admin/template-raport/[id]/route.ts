import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { TemplateRaportService, TemplateRaportServiceError } from '@/lib/services/template-raport.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const { id } = await params;
    const data = await TemplateRaportService.getById(user, parseInt(id));
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof TemplateRaportServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Gagal mengambil data template raport');
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
    const data = await TemplateRaportService.update(user, parseInt(id), body);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof TemplateRaportServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Gagal mengupdate template raport');
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
    const data = await TemplateRaportService.delete(user, parseInt(id));
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof TemplateRaportServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Gagal menghapus template raport');
  }
}
