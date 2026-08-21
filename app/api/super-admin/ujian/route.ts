import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from "@/lib/api-helpers";
import { UjianService, UjianServiceError } from '@/lib/services/ujian.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (!user || error) return ApiResponse.unauthorized(error || "Unauthorized");

    const data = await UjianService.getAllForAdmin(user);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof UjianServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Error fetching ujian for verification:', error);
    return ApiResponse.serverError();
  }
}
