import { NextRequest } from "next/server";
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { UserService, UserServiceError } from '@/lib/services/user.service';
import { canEditOthersPasscode } from "@/lib/permissions";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user: currentUser, error: authError } = await withAuth(request, ['super_admin']);
    if (authError || !currentUser) return ApiResponse.unauthorized(authError || 'Unauthorized');
    const { passCode } = await request.json();
    const { id } = await params;
    const updatedUser = await UserService.updatePasscode(parseInt(id), passCode);
    return ApiResponse.success({ message: 'Passcode berhasil diperbarui', user: updatedUser });
  } catch (error) {
    if (error instanceof UserServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Error updating passcode:', error);
    return ApiResponse.error('Failed to update passcode', 500);
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user: currentUser, error: authError } = await withAuth(request, ['super_admin']);
    if (authError || !currentUser) return ApiResponse.unauthorized(authError || 'Unauthorized');
    const { id } = await params;
    const result = await UserService.getPasscode(parseInt(id), currentUser);
    return ApiResponse.success(result);
  } catch (error) {
    if (error instanceof UserServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Error fetching user passcode:', error);
    return ApiResponse.error('Failed to fetch user passcode', 500);
  }
}
