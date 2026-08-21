import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { NextRequest } from 'next/server'
import { UjianService } from '@/lib/services/ujian.service'

export async function GET(request: NextRequest) {
  const { user: authUser } = await withAuth(request, ['guru']);
  if (!authUser) return ApiResponse.unauthorized();

  try {
    const data = await UjianService.listForGuru(authUser);
    return ApiResponse.success(data)
  } catch (error) {
    console.error('Error fetching guru ujian:', error)
    return ApiResponse.serverError('Gagal mengambil data ujian')
  }
}

export async function POST(request: NextRequest) {
  const { user: authUser } = await withAuth(request, ['guru']);
  if (!authUser) return ApiResponse.unauthorized();
  
  try {
    const body = await request.json()
    const savedUjian = await UjianService.createBulk(authUser, body)
    return ApiResponse.success(savedUjian)

  } catch (error: any) {
    console.error('Error creating ujian:', error)
    if (error.message?.includes('tidak lengkap') || error.message?.includes('tidak ditemukan') || error.message?.includes('tidak valid')) {
      return ApiResponse.error(error.message, 400)
    }
    if (error.message?.includes('tidak terdaftar di halaqah')) {
      return ApiResponse.error(error.message, 403)
    }
    return ApiResponse.serverError('Gagal menyimpan data ujian')
  }
}
