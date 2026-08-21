import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { HafalanService, HafalanServiceError } from '@/lib/services/hafalan.service';
import { notifyHafalan } from '@/lib/services/whatsapp-notifier';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');

    const { searchParams } = new URL(request.url);
    const filters = {
      halaqahId: searchParams.get('halaqahId'),
      santriId: searchParams.get('santriId'),
      tanggal: searchParams.get('tanggal')
    };

    const data = await HafalanService.listHafalan(user, filters);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof HafalanServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('GET /api/hafalan error:', error);
    return ApiResponse.serverError('Failed to fetch hafalan');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');

    const body = await request.json();
    const hafalan = await HafalanService.createHafalan(user, body);

    notifyHafalan(
      hafalan.santriId,
      hafalan.status as 'ziyadah' | 'murojaah',
      {
        namaSurat: hafalan.surat,
        ayatAwal: hafalan.ayatMulai,
        ayatAkhir: hafalan.ayatSelesai,
        namaGuru: user.namaLengkap,
      }
    ).catch(console.error);

    return ApiResponse.success(hafalan, 201);
  } catch (error: any) {
    if (error instanceof HafalanServiceError) return ApiResponse.error(error.message, error.statusCode);
    console.error('POST /api/hafalan error:', error);
    return ApiResponse.serverError('Failed to create hafalan');
  }
}
