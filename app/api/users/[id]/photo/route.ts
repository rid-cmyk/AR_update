import { ApiResponse, withAuth } from "@/lib/api-helpers";
import { NextRequest } from "next/server";
import { UserService, UserServiceError } from '@/lib/services/user.service';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await withAuth(request);
  if (!user || error) return ApiResponse.unauthorized(error || 'Unauthorized');
  try {
    const { foto } = await request.json();
    const { id } = await params;
    const updatedUser = await UserService.updatePhoto(parseInt(id), foto, user);
    return ApiResponse.success({ message: 'Foto berhasil diperbarui', user: updatedUser });
  } catch (error) {
    if (error instanceof UserServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('Error updating photo:', error);
    return ApiResponse.error('Failed to update photo', 500);
  }
}
