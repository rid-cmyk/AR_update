import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { JadwalService, JadwalServiceError } from '@/lib/services/jadwal.service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);
    
    const resolvedParams = await params;
    const data = await JadwalService.getById(user, parseInt(resolvedParams.id));
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof JadwalServiceError) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    return ApiResponse.error('Failed to fetch jadwal', 500);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);
    
    const body = await request.json();
    const resolvedParams = await params;
    const data = await JadwalService.update(user, parseInt(resolvedParams.id), body);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof JadwalServiceError) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    return ApiResponse.error('Failed to update jadwal', 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);
    
    const resolvedParams = await params;
    const data = await JadwalService.delete(user, parseInt(resolvedParams.id));
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof JadwalServiceError) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    return ApiResponse.error('Failed to delete jadwal', 500);
  }
}
