import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { NextRequest } from "next/server";
import { UserService, UserServiceError } from '@/lib/services/user.service';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);
    if (isNaN(userId)) return ApiResponse.error('Invalid user ID', 400);
    UserService.validateOwnershipAccess(userId, user);
    const result = await UserService.getAssignedSantris(userId);
    return ApiResponse.success(result);
  } catch (error) {
    if (error instanceof UserServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Error fetching assigned santris:', error);
    return ApiResponse.serverError('Failed to fetch assigned santris');
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);
    if (!['super_admin'].includes(user.role.name)) return ApiResponse.forbidden('Access denied');
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);
    if (isNaN(userId)) return ApiResponse.error('Invalid user ID', 400);
    const body = await request.json();
    const result = await UserService.updateAssignedSantris(userId, body.assignedSantris);
    return ApiResponse.success(result);
  } catch (error) {
    if (error instanceof UserServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Error updating assigned santris:', error);
    return ApiResponse.serverError('Failed to update assigned santris');
  }
}
