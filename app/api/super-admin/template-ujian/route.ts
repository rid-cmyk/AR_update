import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { TemplateUjianService, TemplateUjianServiceError } from '@/lib/services/template-ujian.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const { searchParams } = new URL(request.url);
    const filters = {
      jenisUjian: searchParams.get('jenisUjian') || undefined,
      tahunAjaranId: searchParams.get('tahunAjaranId') ? parseInt(searchParams.get('tahunAjaranId')!) : undefined
    };

    const data = await TemplateUjianService.list(user, filters);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof TemplateUjianServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Gagal mengambil data template ujian');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const body = await request.json();
    const data = await TemplateUjianService.create(user, body);
    return ApiResponse.success(data, 201);
  } catch (error: any) {
    if (error instanceof TemplateUjianServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Gagal membuat template ujian');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return ApiResponse.error('ID template wajib diisi', 400);

    const data = await TemplateUjianService.delete(user, parseInt(id));
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof TemplateUjianServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Gagal menghapus template ujian');
  }
}
