import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { PengumumanService } from '@/lib/services/pengumuman.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const data = await PengumumanService.listMultiRole(user, { page, limit });
    return ApiResponse.success(data);
  } catch (error: any) {
    console.error('Error fetching pengumuman:', error);
    return ApiResponse.error('Internal server error', 500);
  }
}
