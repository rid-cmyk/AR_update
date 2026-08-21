import { NextRequest } from 'next/server'
import { ApiResponse, withAuth } from '@/lib/api-helpers'
import { parsePagination, hafalanCreateSchema, parseBodyWithSchema } from '@/lib/services/validation.service'
import { HafalanService } from '@/lib/services/hafalan.service'

export async function GET(request: NextRequest) {
  try {
    const { user: authUser, error } = await withAuth(request, ['guru'])
    if (error || !authUser) {
      return ApiResponse.unauthorized();
    }

    const { searchParams } = new URL(request.url)
    const pagination = parsePagination(searchParams)
    const filters = {
      santriName: searchParams.get('santriName') || undefined,
      surat: searchParams.get('surat') || undefined,
      status: searchParams.get('status') || undefined,
    }

    const result = await HafalanService.listForGuru(authUser, filters, pagination)
    return ApiResponse.success(result.data)

  } catch (error) {
    console.error('Error fetching hafalan:', error)
    return ApiResponse.serverError('Gagal mengambil data hafalan')
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user: authUser, error } = await withAuth(request, ['guru'])
    if (error || !authUser) {
      return ApiResponse.unauthorized();
    }

    const body = await request.json()
    const parsed = parseBodyWithSchema(hafalanCreateSchema, body)
    if (!parsed.ok) {
      return ApiResponse.error(parsed.message, 400)
    }
    const hafalan = await HafalanService.create(authUser, parsed.data)
    return ApiResponse.success(hafalan)

  } catch (error: any) {
    console.error('Error creating hafalan:', error)
    if (error.message?.includes('tidak lengkap')) {
      return ApiResponse.error(error.message, 400)
    }
    if (error.message?.includes('Akses ditolak')) {
      return ApiResponse.error(error.message, 403)
    }
    return ApiResponse.serverError('Gagal menambahkan hafalan')
  }
}
