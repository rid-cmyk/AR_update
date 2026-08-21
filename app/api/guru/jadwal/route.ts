import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { JadwalService, JadwalServiceError } from '@/lib/services/jadwal.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['guru']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');
    if (user.role.name !== 'guru') return ApiResponse.forbidden('Access denied');
    const { searchParams } = new URL(request.url);
    const result = await JadwalService.listForGuru(user, searchParams.get('halaqahId') || undefined);
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof JadwalServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('GET /api/guru/jadwal error:', err);
    return ApiResponse.serverError('Failed to fetch jadwal');
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['guru']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');
    if (user.role.name !== 'guru') return ApiResponse.forbidden('Access denied');
    const body = await request.json();
    const result = await JadwalService.updateForGuru(user, body);
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof JadwalServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('PUT /api/guru/jadwal error:', err);
    return ApiResponse.serverError('Failed to update jadwal');
  }
}
