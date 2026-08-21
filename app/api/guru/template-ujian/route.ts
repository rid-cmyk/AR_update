import { NextRequest } from 'next/server'
import { ApiResponse, withAuth } from '@/lib/api-helpers'
import { TemplateUjianService } from '@/lib/services/template-ujian.service'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['guru', 'super_admin'])
    if (!user || error) return ApiResponse.unauthorized()

    const activeTemplates = await TemplateUjianService.listActive()
    return ApiResponse.success(activeTemplates)
  } catch (error: any) {
    if (error?.name === 'TemplateUjianServiceError') return ApiResponse.error(error.message, error.statusCode)
    return ApiResponse.serverError()
  }
}
