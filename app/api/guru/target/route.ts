import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { parsePagination } from '@/lib/services/validation.service';
import { TargetService } from '@/lib/services/target.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['guru']);
    if (error || !user) return ApiResponse.unauthorized();

    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const filters = {
      santriId: searchParams.get('santriId') || undefined,
      santriName: searchParams.get('santriName') || undefined,
      surat: searchParams.get('surat') || undefined,
      status: searchParams.get('status') || undefined,
    };

    const result = await TargetService.listForGuru(user, filters, pagination);
    return ApiResponse.success(result);

  } catch (error) {
    console.error('Error fetching target hafalan:', error);
    return ApiResponse.serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['guru']);
    if (error || !user) return ApiResponse.unauthorized();

    const body = await request.json();
    const target = await TargetService.create(user, body);
    return ApiResponse.success(target);

  } catch (error: any) {
    console.error('Error creating target hafalan:', error);
    if (error.message?.includes('tidak lengkap') || error.message?.includes('sudah ada')) {
      return ApiResponse.error(error.message, 400);
    }
    if (error.message?.includes('tidak ada dalam halaqah') || error.message?.includes('Akses ditolak')) {
      return ApiResponse.error(error.message, 403);
    }
    return ApiResponse.serverError();
  }
}
