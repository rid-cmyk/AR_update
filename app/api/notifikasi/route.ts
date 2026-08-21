import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { NotifikasiService, NotifikasiServiceError } from '@/lib/services/notifikasi.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const result = await NotifikasiService.listForUser(user, { page, limit }, unreadOnly);
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof NotifikasiServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('GET /api/notifikasi error:', err);
    return ApiResponse.error('Failed to fetch notifikasi', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');
    if (!['super_admin'].includes(user.role.name)) return ApiResponse.forbidden('Access denied');
    const body = await request.json();
    const result = await NotifikasiService.createBulk(body);
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof NotifikasiServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('POST /api/notifikasi error:', err);
    return ApiResponse.error('Failed to create notifikasi', 500);
  }
}
