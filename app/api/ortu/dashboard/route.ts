import { NextRequest } from "next/server";
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { OrtuService, OrtuServiceError } from '@/lib/services/ortu.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['ortu']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');

    const data = await OrtuService.getDashboardStats(user);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof OrtuServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('GET /api/ortu/dashboard error:', error);
    return ApiResponse.error('Gagal mengambil data dashboard', 500);
  }
}
