import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { KonversiService, KonversiServiceError } from '@/lib/services/konversi.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');

    const { searchParams } = new URL(request.url);
    const santriId = searchParams.get('santriId');

    const data = await KonversiService.getProgressJuz(user, santriId);

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('Error in progress-juz API:', error);
    if (error instanceof KonversiServiceError) return ApiResponse.error(error.message, error.statusCode);
    if (error?.name === 'JsonWebTokenError') return ApiResponse.unauthorized('Token tidak valid');
    return ApiResponse.serverError('Terjadi kesalahan server');
  }
}
