import { NextRequest } from 'next/server'
import { ApiResponse, withAuth } from "@/lib/api-helpers"
import { UjianService } from '@/lib/services/ujian.service'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['guru'])
    if (!user || error) return ApiResponse.unauthorized()

    const { id } = await params
    const body = await request.json()
    const result = await UjianService.updateRemedial(parseInt(id), user, body)
    return ApiResponse.success(result)
  } catch (error: any) {
    console.error('Error updating remedial ujian:', error)
    if (error.message?.includes('tidak ditemukan')) return ApiResponse.notFound(error.message)
    return ApiResponse.serverError()
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['guru'])
    if (!user || error) return ApiResponse.unauthorized()

    const { id } = await params
    let body: any = {};
    try { body = await request.json(); } catch {}

    const result = await UjianService.createRemedial(parseInt(id), user, body)
    return ApiResponse.success(result, 201)
  } catch (error: any) {
    console.error('Error creating remedial ujian:', error)
    if (error.message?.includes('tidak ditemukan')) return ApiResponse.notFound(error.message)
    if (error.message?.includes('Tidak ada juz')) return ApiResponse.error(error.message, 400)
    return ApiResponse.serverError()
  }
}
