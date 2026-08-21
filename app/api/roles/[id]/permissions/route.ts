import { NextRequest } from "next/server";
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { RoleService, UserServiceError } from '@/lib/services/user.service';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return error === 'Insufficient permissions' ? ApiResponse.forbidden(error) : ApiResponse.unauthorized(error || 'Unauthorized');
    const resolvedParams = await params;
    const result = await RoleService.getRolePermissions(parseInt(resolvedParams.id));
    return ApiResponse.success(result);
  } catch (error) {
    if (error instanceof UserServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Error fetching role permissions:', error);
    return ApiResponse.error('Failed to fetch permissions', 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { permissions } = await request.json();
    const resolvedParams = await params;
    const result = await RoleService.updateRolePermissions(parseInt(resolvedParams.id), permissions);
    return ApiResponse.success(result);
  } catch (error) {
    if (error instanceof UserServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Error updating role permissions:', error);
    return ApiResponse.error('Failed to update permissions', 500);
  }
}
