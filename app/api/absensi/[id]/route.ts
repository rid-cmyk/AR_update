import { ApiResponse, withAuth } from '@/lib/api-helpers'
import { AbsensiService } from '@/lib/services/absensi.service'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const { id } = await params;
    const data = await AbsensiService.delete(user, parseInt(id));
    return ApiResponse.success({ message: 'Success' });
  } catch (error: any) {
    console.error('DELETE /api/absensi/[id] error:', error);
    if (error.message === 'Forbidden' || error.message.includes('Unauthorized to delete')) {
      return ApiResponse.forbidden(error.message);
    }
    if (error.message === 'Not found') {
      return ApiResponse.notFound('Not found');
    }
    return ApiResponse.serverError('Internal Server Error');
  }
}
