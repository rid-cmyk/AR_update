import { NextRequest } from 'next/server'
import { ApiResponse, withAuth } from '@/lib/api-helpers'
import { UjianService } from '@/lib/services/ujian.service'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['super_admin'])
    if (!user || error) return ApiResponse.unauthorized(error || 'Unauthorized')

    const { id } = await params
    const body = await request.json()
    const ujian = await UjianService.verify(parseInt(id), user, body)
    return ApiResponse.success(ujian)
  } catch (error: any) {
    console.error('Error verifying ujian:', error)
    if (error.message?.includes('tidak ditemukan')) return ApiResponse.notFound(error.message)
    return ApiResponse.serverError()
  }
}
