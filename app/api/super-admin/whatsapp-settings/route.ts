import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { SystemSettingService, SystemSettingServiceError } from '@/lib/services/system-setting.service';

export async function GET(request: NextRequest) {
  try {
    const settings = await SystemSettingService.getStoredSettings();
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) {
      return NextResponse.json({
        whatsappNumber: settings.whatsappNumber,
        whatsappMessageHelp: settings.whatsappMessageHelp,
      });
    }
    return ApiResponse.success(settings);
  } catch (error) {
    console.error("Error fetching admin settings:", error);
    return ApiResponse.serverError("Failed to fetch admin settings");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');

    const body = await request.json();
    const settings = await SystemSettingService.updateSettings(user, body);
    return ApiResponse.success({ settings });
  } catch (error: any) {
    if (error instanceof SystemSettingServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error("Error updating admin settings:", error);
    return ApiResponse.serverError("Failed to update admin settings");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');

    const settings = await SystemSettingService.resetSettings(user);
    return ApiResponse.success({ message: "Settings berhasil direset ke default", settings });
  } catch (error: any) {
    if (error instanceof SystemSettingServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error("Error resetting admin settings:", error);
    return ApiResponse.serverError("Failed to reset admin settings");
  }
}
