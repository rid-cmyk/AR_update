import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { SemesterService, SemesterServiceError } from '@/lib/services/semester.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized();

    const semesterId = parseInt((await params).id);
    
    const result = await SemesterService.setActiveSemester(semesterId, user);
    return ApiResponse.success(result);
  } catch (error: any) {
    if (error instanceof SemesterServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Active semester error:', error);
    return ApiResponse.serverError('Gagal mengaktifkan semester');
  }
}
