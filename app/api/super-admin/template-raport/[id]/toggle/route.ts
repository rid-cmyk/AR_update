import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { TemplateRaportService, TemplateRaportServiceError } from '@/lib/services/template-raport.service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const { id } = await params;
    const data = await TemplateRaportService.toggleActive(user, parseInt(id));
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof TemplateRaportServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Gagal mengubah status template');
  }
}
