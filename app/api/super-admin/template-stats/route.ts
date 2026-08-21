import { NextRequest } from "next/server";
import { ApiResponse, withAuth } from "@/lib/api-helpers";
import { TemplateUjianService } from '@/lib/services/template-ujian.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized();

    const stats = await TemplateUjianService.getTemplateStats();
    return ApiResponse.success(stats);
  } catch (error: any) {
    return ApiResponse.serverError("Failed to fetch template stats");
  }
}
