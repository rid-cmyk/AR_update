import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { TemplateUjianService, TemplateUjianServiceError } from '@/lib/services/template-ujian.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const { id } = await params;
    const body = await request.json();
    const data = await TemplateUjianService.addKomponen(user, parseInt(id), body);
    return ApiResponse.success(data, 201);
  } catch (error: any) {
    if (error instanceof TemplateUjianServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Gagal menambah komponen');
  }
}
