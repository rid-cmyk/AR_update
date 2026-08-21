import { ApiResponse, withAuth } from "@/lib/api-helpers";
import { NextRequest } from "next/server";
import { UserService, UserServiceError } from '@/lib/services/user.service';

export async function POST(request: NextRequest) {
  const { user, error } = await withAuth(request);
  if (!user || error) return ApiResponse.unauthorized(error || 'Unauthorized');
  try {
    const { passCode, excludeUserId } = await request.json();
    const result = await UserService.checkPasscode(passCode, excludeUserId);
    return ApiResponse.success(result);
  } catch (error) {
    if (error instanceof UserServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Error checking passcode:', error);
    return ApiResponse.error('Failed to check passcode', 500);
  }
}
