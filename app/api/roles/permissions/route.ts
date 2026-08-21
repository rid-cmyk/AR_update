import { NextRequest } from "next/server";
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { RoleService, UserServiceError } from '@/lib/services/user.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');
    const result = await RoleService.getPermissions();
    return ApiResponse.success({ ...result, message: "Dynamic role permissions generated successfully" });
  } catch (error) {
    if (error instanceof UserServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error("Error fetching role permissions:", error);
    return ApiResponse.serverError("Internal server error");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');
    const { roleName, level } = await request.json();
    const result = await RoleService.createWithPermissions(roleName, level);
    return ApiResponse.success({ ...result, message: "New role created successfully" });
  } catch (error) {
    if (error instanceof UserServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error("Error creating role:", error);
    return ApiResponse.serverError("Internal server error");
  }
}
