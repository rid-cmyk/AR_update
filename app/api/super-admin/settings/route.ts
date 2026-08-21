import { NextRequest } from "next/server";
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { SystemSettingService, SystemSettingServiceError } from '@/lib/services/system-setting.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fetchStats = searchParams.get('stats') === 'true';
    const result = await SystemSettingService.getAppSettings(fetchStats);
    return ApiResponse.success(result);
  } catch (error: any) {
    if (error instanceof SystemSettingServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Failed to fetch settings');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await withAuth(request, ['super_admin']);
    if (authError || !user) return ApiResponse.unauthorized(authError || 'Unauthorized');

    const body = await request.json();
    const result = await SystemSettingService.saveAppSettings(body);
    return ApiResponse.success(result);
  } catch (error: any) {
    if (error instanceof SystemSettingServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.serverError('Failed to update settings');
  }
}
