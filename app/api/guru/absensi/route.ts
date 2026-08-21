import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { AbsensiService } from '@/lib/services/absensi.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['guru']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');

    const { searchParams } = new URL(request.url);
    const tanggal = searchParams.get('tanggal');
    const result = await AbsensiService.listForGuru(user, { tanggal: tanggal || '' });
    return ApiResponse.success(result);

  } catch (error) {
    console.error('Error fetching absensi:', error);
    return ApiResponse.serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['guru']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');

    const body = await request.json();
    const result = await AbsensiService.create(user, body);
    return ApiResponse.success({
      message: 'Absensi berhasil disimpan',
      data: result.data,
    });

  } catch (error: any) {
    console.error('Error saving absensi:', error);
    const msg = error?.message || '';
    if (msg.includes('Data tidak lengkap') || msg.includes('Status harus') || msg.includes('Tidak dapat mengisi') || msg.includes('Absensi hanya dapat')) {
      return ApiResponse.error(msg, 400);
    }
    if (msg.includes('Jadwal tidak ditemukan') || msg.includes('Santri tidak terdaftar')) {
      return ApiResponse.error(msg, 403);
    }
    return ApiResponse.serverError();
  }
}
