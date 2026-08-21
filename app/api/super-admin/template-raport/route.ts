import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { TemplateRaportService, TemplateRaportServiceError } from '@/lib/services/template-raport.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const { searchParams } = new URL(request.url);
    const filters = {
      tahunAjaranId: searchParams.get('tahunAjaranId') ? parseInt(searchParams.get('tahunAjaranId')!) : undefined
    };

    const data = await TemplateRaportService.list(user, filters);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof TemplateRaportServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Gagal mengambil data template raport');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const body = await request.json();
    const data = await TemplateRaportService.create(user, body);
    return ApiResponse.success(data, 201);
  } catch (error: any) {
    if (error instanceof TemplateRaportServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Gagal membuat template raport');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return ApiResponse.error('ID template wajib diisi', 400);

    const data = await TemplateRaportService.delete(user, parseInt(id));
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof TemplateRaportServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Gagal menghapus template raport');
  }
}
