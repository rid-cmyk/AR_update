import { NextRequest } from "next/server";
import { ApiResponse, withAuth } from "@/lib/api-helpers";
import { DatabaseService, DatabaseServiceError } from '@/lib/services/database.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');
    const result = await DatabaseService.getInfo();
    return ApiResponse.success(result);
  } catch (error) {
    if (error instanceof DatabaseServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Error fetching database info:', error);
    return ApiResponse.error('Failed to fetch database information', 500);
  }
}
