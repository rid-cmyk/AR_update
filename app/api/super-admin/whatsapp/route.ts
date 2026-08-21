import { NextRequest } from "next/server";
import { ApiResponse, withAuth } from "@/lib/api-helpers";
import { SystemSettingService, SystemSettingServiceError } from "@/lib/services/system-setting.service";

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');

    const config = await SystemSettingService.getWhatsAppConfig(user);
    return ApiResponse.success(config);
  } catch (error: any) {
    if (error instanceof SystemSettingServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error("Error fetching WhatsApp settings:", error);
    return ApiResponse.serverError("Failed to fetch WhatsApp settings");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');

    const body = await request.json();
    await SystemSettingService.updateWhatsAppConfig(user, body);

    return ApiResponse.success({ message: "WhatsApp settings saved" });
  } catch (error: any) {
    if (error instanceof SystemSettingServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error("Error updating WhatsApp settings:", error);
    return ApiResponse.serverError("Failed to update WhatsApp settings");
  }
}
