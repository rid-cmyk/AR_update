import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { HalaqahService, HalaqahServiceError } from '@/lib/services/halaqah.service';

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');
    if (!['super_admin'].includes(user.role.name)) return ApiResponse.forbidden('Access denied');
    const results = await HalaqahService.runSync();
    return ApiResponse.success({ message: 'Sync completed', results, timestamp: new Date().toISOString() });
  } catch (err) {
    if (err instanceof HalaqahServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('Error syncing halaqah data:', err);
    return ApiResponse.error('Failed to sync halaqah data', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || 'Unauthorized');
    if (!['super_admin'].includes(user.role.name)) return ApiResponse.forbidden('Access denied');
    const stats = await HalaqahService.getSyncStatus();
    return ApiResponse.success({ stats, lastSync: new Date().toISOString() });
  } catch (err) {
    if (err instanceof HalaqahServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('Error getting sync status:', err);
    return ApiResponse.error('Failed to get sync status', 500);
  }
}
