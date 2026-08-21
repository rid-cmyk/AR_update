import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { SemesterService, SemesterServiceError } from '@/lib/services/semester.service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized();

    const id = parseInt((await params).id);
    const body = await request.json();

    const updated = await SemesterService.updateSemester(id, body, user);
    return ApiResponse.success(updated);
  } catch (error: any) {
    if (error instanceof SemesterServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Update semester error:', error);
    return ApiResponse.serverError('Gagal mengupdate semester');
  }
}
