import { NextRequest } from "next/server";
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { UserService, UserServiceError } from '@/lib/services/user.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await withAuth(request, ['super_admin', 'yayasan']);
    if (authError || !user) return ApiResponse.unauthorized(authError || 'Unauthorized');
    const { searchParams } = new URL(request.url);
    const result = await UserService.list(searchParams.get('role') || undefined);
    return ApiResponse.success(result);
  } catch (error) {
    if (error instanceof UserServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Error fetching users:', error);
    return ApiResponse.error('Failed to fetch users', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user: currentUser, error: authError } = await withAuth(request, ['super_admin']);
    if (authError || !currentUser) return ApiResponse.unauthorized(authError || 'Unauthorized');
    const body = await request.json();
    const result = await UserService.create(body);
    return ApiResponse.success(result, 201);
  } catch (error) {
    if (error instanceof UserServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Error creating user:', error);
    return ApiResponse.error('Failed to create user', 500);
  }
}
