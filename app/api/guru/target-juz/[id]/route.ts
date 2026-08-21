import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { TargetService, TargetServiceError } from '@/lib/services/target.service';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request, ['guru']);
    if (error || !user) return ApiResponse.unauthorized();
    const { id } = await params;
    const result = await TargetService.getTargetJuz(parseInt(id), user);
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof TargetServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('Error fetching target juz:', err);
    return ApiResponse.serverError();
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request, ['guru']);
    if (error || !user) return ApiResponse.unauthorized();
    const { id } = await params;
    const body = await request.json();
    const updated = await TargetService.updateTargetJuz(parseInt(id), user, body);
    return ApiResponse.success(updated);
  } catch (err) {
    if (err instanceof TargetServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('Error updating target juz:', err);
    return ApiResponse.serverError();
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await withAuth(request, ['guru']);
    if (error || !user) return ApiResponse.unauthorized();
    const { id } = await params;
    const result = await TargetService.deleteTargetJuz(parseInt(id), user);
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof TargetServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('Error deleting target juz:', err);
    return ApiResponse.serverError();
  }
}
