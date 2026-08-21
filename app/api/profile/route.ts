import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { ProfileService, ProfileServiceError } from '@/lib/services/profile.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');

    const data = await ProfileService.getProfile(user.id);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof ProfileServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error("Error fetching profile:", error);
    return ApiResponse.unauthorized("Invalid token");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');

    const body = await request.json();
    const requestInfo = {
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined
    };

    const data = await ProfileService.updateProfile(user.id, body, requestInfo);

    const response = NextResponse.json({
      success: true,
      message: data.message,
      user: data.user
    });

    response.cookies.set('auth_token', data.newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60
    });

    return response;
  } catch (error: any) {
    if (error instanceof ProfileServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error("Error updating profile:", error);
    return ApiResponse.error("Gagal memperbarui profil", 500);
  }
}
