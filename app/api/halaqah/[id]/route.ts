import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { HalaqahService, HalaqahServiceError } from '@/lib/services/halaqah.service';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request);
    if (!user || error) return ApiResponse.unauthorized(error || 'Unauthorized');
    const { id } = await params;
    const result = await HalaqahService.getById(parseInt(id));
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof HalaqahServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('GET /api/halaqah/[id] error:', err);
    return ApiResponse.error('Failed to fetch halaqah', 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized('Unauthorized');
    const { id } = await params;
    const body = await request.json();
    const result = await HalaqahService.updateById(parseInt(id), user, body);
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof HalaqahServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('PUT /api/halaqah/[id] error:', err);
    return ApiResponse.error('Failed to update halaqah', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) return ApiResponse.unauthorized('Unauthorized');
    const { id } = await params;
    const result = await HalaqahService.deleteById(parseInt(id), user);
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof HalaqahServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('DELETE /api/halaqah/[id] error:', err);
    return ApiResponse.error('Failed to delete halaqah', 500);
  }
}
