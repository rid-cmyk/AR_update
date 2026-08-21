import { NextRequest } from "next/server";
import { ApiResponse, withAuth } from "@/lib/api-helpers";
import { GuruSantriService } from '@/lib/services/guru-santri.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['yayasan']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');

    const result = await GuruSantriService.getHalaqahGuruForYayasan();
    return ApiResponse.success(result);
  } catch (error: any) {
    return ApiResponse.serverError('Internal server error');
  }
}
