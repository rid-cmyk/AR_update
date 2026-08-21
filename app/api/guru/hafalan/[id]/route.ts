import { NextRequest } from 'next/server'
import { ApiResponse, withAuth } from '@/lib/api-helpers'
import { HafalanService } from '@/lib/services/hafalan.service'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['guru', 'super_admin']);
    if (error || !user) {
      return error === 'Insufficient permissions'
        ? ApiResponse.forbidden(error)
        : ApiResponse.unauthorized();
    }

    const { id } = await params
    const body = await request.json()

    const data = await HafalanService.update(user, parseInt(id), body);
    return ApiResponse.success(data)

  } catch (error: any) {
    console.error('Error updating hafalan:', error)
    if (error.message === 'Access denied' || error.message.includes('tidak memiliki akses')) {
      return ApiResponse.error(error.message, 403);
    }
    if (error.message === 'Data tidak lengkap') {
      return ApiResponse.error(error.message, 400);
    }
    return ApiResponse.serverError('Gagal memperbarui hafalan')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['guru', 'super_admin']);
    if (error || !user) {
      return error === 'Insufficient permissions'
        ? ApiResponse.forbidden(error)
        : ApiResponse.unauthorized();
    }

    const { id } = await params

    const data = await HafalanService.delete(user, parseInt(id));
    return ApiResponse.success({ message: 'Hafalan berhasil dihapus' })

  } catch (error: any) {
    console.error('Error deleting hafalan:', error)
    if (error.message === 'Access denied' || error.message.includes('tidak memiliki akses')) {
      return ApiResponse.error(error.message, 403);
    }
    return ApiResponse.serverError('Gagal menghapus hafalan')
  }
}
