import { NextRequest } from 'next/server'
import { ApiResponse, withAuth } from "@/lib/api-helpers"
import { SystemSettingService } from '@/lib/services/system-setting.service'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin'])
    if (!user || error) return ApiResponse.unauthorized(error || "Unauthorized")

    const kriteria = await SystemSettingService.getMhqKriteria()
    return ApiResponse.success(kriteria)
  } catch (error: any) {
    if (error?.name === 'SystemSettingServiceError') return ApiResponse.error(error.message, error.statusCode)
    return ApiResponse.serverError('Internal server error')
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin'])
    if (!user || error) return ApiResponse.unauthorized(error || "Unauthorized")

    const body = await request.json()
    const result = await SystemSettingService.saveMhqKriteria(body.kriteria)
    return ApiResponse.success(result)
  } catch (error: any) {
    if (error?.name === 'SystemSettingServiceError') return ApiResponse.error(error.message, error.statusCode)
    return ApiResponse.serverError('Internal server error')
  }
}
