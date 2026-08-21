import { NextRequest } from 'next/server'
import { ApiResponse, withAuth } from '@/lib/api-helpers'
import { UjianService } from '@/lib/services/ujian.service'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: authUser } = await withAuth(request, ['guru'])
    if (!authUser) return ApiResponse.unauthorized()

    const { id } = await params
    const body = await request.json()
    const ujian = await UjianService.update(parseInt(id), authUser, body)
    return ApiResponse.success(ujian)
  } catch (error: any) {
    console.error('Error updating ujian:', error)
    if (error.message?.includes('tidak ditemukan')) return ApiResponse.notFound(error.message)
    if (error.message?.includes('Forbidden')) return ApiResponse.error(error.message, 403)
    return ApiResponse.serverError()
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: authUser } = await withAuth(request, ['guru'])
    if (!authUser) return ApiResponse.unauthorized()

    const { id } = await params
    const result = await UjianService.delete(parseInt(id), authUser)
    return ApiResponse.success(result)
  } catch (error: any) {
    console.error('Error deleting ujian:', error)
    if (error.message?.includes('tidak ditemukan')) return ApiResponse.notFound(error.message)
    if (error.message?.includes('Forbidden')) return ApiResponse.error(error.message, 403)
    return ApiResponse.serverError()
  }
}
