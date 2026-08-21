import { NextRequest } from "next/server";
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { UserService, UserServiceError } from '@/lib/services/user.service';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user: currentUser, error: authError } = await withAuth(request, ['super_admin']);
    if (authError || !currentUser) return ApiResponse.unauthorized(authError || 'Unauthorized');
    const { id } = await params;
    const body = await request.json();
    const result = await UserService.update(parseInt(id), body);
    return ApiResponse.success(result);
  } catch (error) {
    if (error instanceof UserServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Error updating user:', error);
    return ApiResponse.error('Failed to update user', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user: currentUser, error: authError } = await withAuth(request, ['super_admin']);
    if (authError || !currentUser) return ApiResponse.unauthorized(authError || 'Unauthorized');
    const { id } = await params;
    const result = await UserService.delete(parseInt(id));
    return ApiResponse.success(result);
  } catch (error) {
    if (error instanceof UserServiceError) return ApiResponse.error(error.message, error.statusCode);
    if (error instanceof Error && error.message.includes('foreign key constraint')) return ApiResponse.error('Tidak dapat menghapus user yang masih memiliki data terkait', 400);
    console.error('Error deleting user:', error);
    return ApiResponse.error('Failed to delete user', 500);
  }
}
