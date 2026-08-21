import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { TargetService, TargetServiceError } from '@/lib/services/target.service';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request, ['super_admin', 'guru']);
    if (error || !user) return error === 'Insufficient permissions' ? ApiResponse.forbidden(error) : ApiResponse.unauthorized(error || 'Unauthorized');
    const { id } = await params;
    const body = await request.json();
    const updated = await TargetService.updateMultiRole(parseInt(id), user, body);
    return ApiResponse.success(updated);
  } catch (err) {
    if (err instanceof TargetServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('PUT /api/target/[id] error:', err);
    return ApiResponse.error('Failed to update target', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request, ['super_admin', 'guru']);
    if (error || !user) return error === 'Insufficient permissions' ? ApiResponse.forbidden(error) : ApiResponse.unauthorized(error || 'Unauthorized');
    const { id } = await params;
    const result = await TargetService.deleteMultiRole(parseInt(id), user);
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof TargetServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('DELETE /api/target/[id] error:', err);
    return ApiResponse.error('Failed to delete target', 500);
  }
}
