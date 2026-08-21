import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { JadwalService, JadwalServiceError } from '@/lib/services/jadwal.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');
    const { searchParams } = new URL(request.url);
    const result = await JadwalService.list(user, {
      halaqahId: searchParams.get('halaqahId') || undefined,
      isTemplate: searchParams.get('isTemplate') || undefined,
      isActive: searchParams.get('isActive') || undefined
    });
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof JadwalServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('GET /api/jadwal error:', err);
    return ApiResponse.error('Failed to fetch jadwal', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');
    if (!['super_admin'].includes(user.role.name)) return ApiResponse.forbidden('Access denied');
    const body = await request.json();
    const result = await JadwalService.create(user, body);
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof JadwalServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('POST /api/jadwal error:', err);
    return ApiResponse.error('Failed to create jadwal', 500);
  }
}
