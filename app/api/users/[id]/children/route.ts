import { ApiResponse, withAuth } from "@/lib/api-helpers";
import { NextRequest } from "next/server";
import { UserService, UserServiceError } from '@/lib/services/user.service';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user: authUser, error } = await withAuth(request);
  if (!authUser || error) return ApiResponse.unauthorized(error || 'Unauthorized');
  try {
    const { id } = await params;
    const result = await UserService.getChildren(parseInt(id), authUser);
    return ApiResponse.success(result);
  } catch (error) {
    if (error instanceof UserServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Error fetching user children:', error);
    return ApiResponse.error('Failed to fetch user children', 500);
  }
}
