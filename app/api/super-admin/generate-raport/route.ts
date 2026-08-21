import { NextRequest } from 'next/server'
import { ApiResponse, withAuth } from '@/lib/api-helpers'
import { RaportService } from '@/lib/services/raport.service'

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin'])
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized')
    }

    const body = await request.json()
    const { santriId, templateRaportId, tahunAjaranId } = body

    if (!santriId || !templateRaportId || !tahunAjaranId) {
      return ApiResponse.error('Semua field harus diisi', 400)
    }

    const result = await RaportService.generateRaport({
      santriId,
      templateRaportId,
      tahunAjaranId,
      userId: user.id,
    })

    return ApiResponse.success(result, 201)
  } catch (error: any) {
    console.error('Error generating raport:', error)
    if (error.message?.includes('tidak ditemukan')) {
      return ApiResponse.notFound(error.message)
    }
    return ApiResponse.serverError('Internal server error')
  }
}
