import { NextRequest } from 'next/server'
import { ApiResponse, withAuth } from '@/lib/api-helpers'
import { UjianService } from '@/lib/services/ujian.service'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['guru', 'super_admin']);
    if (error || !user) {
      return error === 'Insufficient permissions'
        ? ApiResponse.forbidden(error)
        : ApiResponse.unauthorized();
    }

    const { searchParams } = new URL(request.url)
    const result = await UjianService.getLaporan(user, {
      periode: searchParams.get('periode') || undefined,
      jenisUjian: searchParams.get('jenisUjian') || undefined,
      halaqah: searchParams.get('halaqah') || undefined,
      format: searchParams.get('format') || undefined,
    });

    return ApiResponse.success(result)
  } catch (error) {
    console.error('Error generating laporan ujian:', error)
    return ApiResponse.serverError('Gagal mengambil laporan ujian')
  }
}
