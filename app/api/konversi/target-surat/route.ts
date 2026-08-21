import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { KonversiService, KonversiServiceError } from '@/lib/services/konversi.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');
    const { searchParams } = new URL(request.url);
    const juzParam = searchParams.get('juz');

    if (!juzParam) return ApiResponse.error('Parameter juz diperlukan. Contoh: ?juz=1,2,3', 400);

    const data = KonversiService.getTargetSurat(juzParam);
    return ApiResponse.success({ data });
  } catch (error: any) {
    console.error('Error in target-surat API:', error);
    if (error instanceof KonversiServiceError) return ApiResponse.error(error.message, error.statusCode);
    return ApiResponse.error(error instanceof Error ? error.message : 'Terjadi kesalahan server', 400);
  }
}
