import { NextRequest } from 'next/server'
import { ApiResponse, withAuth } from "@/lib/api-helpers"
import { UjianService } from '@/lib/services/ujian.service'

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['guru'])
    if (!user || error) return ApiResponse.unauthorized()

    const body = await request.json()
    const ujian = await UjianService.createDetailed(user, body)
    return ApiResponse.success(ujian, 201)
  } catch (error: any) {
    console.error('Error creating detailed ujian:', error)
    if (error.message?.includes('tidak lengkap')) return ApiResponse.error(error.message, 400)
    if (error.message?.includes('tidak ditemukan')) return ApiResponse.notFound(error.message)
    if (error.message?.includes('tidak memiliki akses')) return ApiResponse.error(error.message, 403)
    return ApiResponse.serverError()
  }
}
