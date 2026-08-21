import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { JadwalService, JadwalServiceError } from '@/lib/services/jadwal.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');
    if (user.role.name !== 'santri') return ApiResponse.forbidden('Access denied');
    const result = await JadwalService.listForSantri(user);
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof JadwalServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('GET /api/santri/jadwal error:', err);
    return ApiResponse.serverError('Failed to fetch jadwal');
  }
}
