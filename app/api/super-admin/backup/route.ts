import { NextRequest } from "next/server";
import { ApiResponse, withAuth } from "@/lib/api-helpers";
import { DatabaseService, DatabaseServiceError } from '@/lib/services/database.service';

export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request, ["super_admin"]);
    if (error || !user) return ApiResponse.unauthorized();
    const result = await DatabaseService.getBackupStats();
    return ApiResponse.success(result);
  } catch (error) {
    if (error instanceof DatabaseServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error("Backup API error:", error);
    return ApiResponse.serverError("Gagal memuat data backup");
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await withAuth(request, ["super_admin"]);
    if (error || !user) return ApiResponse.unauthorized();
    const result = await DatabaseService.createBackup(user, request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip"), request.headers.get("user-agent"));
    return ApiResponse.success(result);
  } catch (error) {
    if (error instanceof DatabaseServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error("Backup create error:", error);
    return ApiResponse.serverError("Gagal membuat backup");
  }
}
