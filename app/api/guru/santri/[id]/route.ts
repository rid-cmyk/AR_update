import { NextRequest } from 'next/server'
import { ApiResponse, withAuth } from '@/lib/api-helpers'
import { GuruSantriService } from '@/lib/services/guru-santri.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['guru', 'super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const { id } = await params;
    const santriId = parseInt(id);
    if (isNaN(santriId)) return ApiResponse.error('ID santri tidak valid', 400);

    const data = await GuruSantriService.getDetail(user as any, santriId);
    return ApiResponse.success({ data, message: 'Data santri berhasil diambil' });
  } catch (error: any) {
    if (error?.name === 'GuruSantriServiceError') return ApiResponse.error(error.message, error.statusCode)
    return ApiResponse.serverError('Gagal mengambil data santri')
  }
}
