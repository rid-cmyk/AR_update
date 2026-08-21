import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { TargetService, TargetServiceError } from '@/lib/services/target.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['guru']);
    if (error || !user) return ApiResponse.unauthorized();
    const { searchParams } = new URL(request.url);
    const santriId = searchParams.get('santriId') ? parseInt(searchParams.get('santriId')!) : undefined;
    const result = await TargetService.listWithProgress(user, santriId);
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof TargetServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('Error fetching target hafalan:', err);
    return ApiResponse.serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['guru']);
    if (error || !user) return ApiResponse.unauthorized();
    const body = await request.json();
    const created = await TargetService.createFromHafalan(user, body);
    return ApiResponse.success(created);
  } catch (err) {
    if (err instanceof TargetServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('Error creating target hafalan:', err);
    return ApiResponse.serverError();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['guru']);
    if (error || !user) return ApiResponse.unauthorized();
    const body = await request.json();
    const updated = await TargetService.updateFromHafalan(user, body);
    return ApiResponse.success(updated);
  } catch (err) {
    if (err instanceof TargetServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('Error updating target hafalan:', err);
    return ApiResponse.serverError();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['guru']);
    if (error || !user) return ApiResponse.unauthorized();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return ApiResponse.error('ID target tidak ditemukan', 400);
    const result = await TargetService.deleteFromHafalan(user, parseInt(id));
    return ApiResponse.success(result);
  } catch (err) {
    if (err instanceof TargetServiceError) return ApiResponse.error(err.message, err.statusCode);
    console.error('Error deleting target hafalan:', err);
    return ApiResponse.serverError();
  }
}
