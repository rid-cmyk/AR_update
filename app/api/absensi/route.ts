import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { AbsensiService } from '@/lib/services/absensi.service';

export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    const { searchParams } = new URL(request.url);
    const absensi = await AbsensiService.listMultiRole(user, {
      halaqahId: searchParams.get('halaqahId'),
      tanggal: searchParams.get('tanggal') || '',
    });

    return ApiResponse.success(absensi);
  } catch (error) {
    console.error('GET /api/absensi error:', error);
    return ApiResponse.serverError('Failed to fetch absensi');
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    const body = await request.json();
    const result = await AbsensiService.create(user, body);
    return ApiResponse.success(result);
  } catch (error: any) {
    console.error('POST /api/absensi error:', error);
    const msg = error?.message || '';
    if (msg.includes('Data tidak lengkap') || msg.includes('Status harus') || msg.includes('Tidak dapat mengisi') || msg.includes('Absensi hanya dapat')) {
      return ApiResponse.error(msg, 400);
    }
    if (msg.includes('Jadwal tidak ditemukan') || msg.includes('Santri tidak terdaftar')) {
      return ApiResponse.error(msg, 403);
    }
    return ApiResponse.serverError('Failed to save absensi');
  }
}
