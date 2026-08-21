import { NextRequest } from "next/server";
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { RoleService, UserServiceError } from '@/lib/services/user.service';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return error === 'Insufficient permissions' ? ApiResponse.forbidden(error) : ApiResponse.unauthorized(error || 'Unauthorized');
    const { name } = await request.json();
    const resolvedParams = await params;
    const result = await RoleService.update(parseInt(resolvedParams.id), name);
    return ApiResponse.success(result);
  } catch (error) {
    if (error instanceof UserServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Error updating role:', error);
    return ApiResponse.error('Failed to update role', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return error === 'Insufficient permissions' ? ApiResponse.forbidden(error) : ApiResponse.unauthorized(error || 'Unauthorized');
    const resolvedParams = await params;
    const result = await RoleService.delete(parseInt(resolvedParams.id));
    return ApiResponse.success(result);
  } catch (error) {
    if (error instanceof UserServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Error deleting role:', error);
    return ApiResponse.error('Failed to delete role', 500);
  }
}
