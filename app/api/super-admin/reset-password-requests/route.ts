import { NextRequest } from "next/server";
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { ForgotPasscodeService } from '@/lib/services/forgot-passcode.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await withAuth(request, ['super_admin']);
    if (authError || !user) return ApiResponse.unauthorized(authError || 'Unauthorized');

    const formattedRequests = await ForgotPasscodeService.listAll()
    return ApiResponse.success({ requests: formattedRequests })
  } catch (error: any) {
    if (error?.name === 'ForgotPasscodeServiceError') return ApiResponse.error(error.message, error.statusCode)
    return ApiResponse.serverError("Gagal mengambil data permintaan reset password");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();
    const result = await ForgotPasscodeService.create(username)
    return ApiResponse.success(result)
  } catch (error: any) {
    if (error?.name === 'ForgotPasscodeServiceError') return ApiResponse.error(error.message, error.statusCode)
    return ApiResponse.serverError("Gagal membuat permintaan reset password");
  }
}
