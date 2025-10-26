import prisma from '@/lib/database/prisma';
import { NextResponse } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { getGuruSantriIds } from '@/lib/auth';

// UPDATE prestasi
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    if (user.role.name !== 'guru') {
      return ApiResponse.forbidden('Access denied');
    }

    const resolvedParams = await params;
    const prestasiId = parseInt(resolvedParams.id);
    if (isNaN(prestasiId)) {
      return ApiResponse.error('Invalid prestasi ID', 400);
    }

    const body = await request.json();
    const { santriId, namaPrestasi, keterangan, kategori, tahun } = body;

    // Check if prestasi exists and belongs to guru's santri
    const existingPrestasi = await prisma.prestasi.findUnique({
      where: { id: prestasiId }
    });

    if (!existingPrestasi) {
      return ApiResponse.notFound('Prestasi not found');
    }

    const guruSantriIds = await getGuruSantriIds(user.id);
    if (!guruSantriIds.includes(existingPrestasi.santriId)) {
      return ApiResponse.forbidden('Access denied');
    }

    // Update prestasi
    const updatedPrestasi = await prisma.prestasi.update({
      where: { id: prestasiId },
      data: {
        ...(santriId && { santriId: Number(santriId) }),
        ...(namaPrestasi && { namaPrestasi }),
        ...(keterangan !== undefined && { keterangan }),
        ...(kategori !== undefined && { kategori }),
        ...(tahun && { tahun: Number(tahun) })
      },
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        }
      }
    });

    return ApiResponse.success(updatedPrestasi);
  } catch (error) {
    console.error('PUT /api/guru/prestasi/[id] error:', error);
    return ApiResponse.serverError('Failed to update prestasi');
  }
}

// PATCH prestasi (for validation)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    if (user.role.name !== 'guru') {
      return ApiResponse.forbidden('Access denied');
    }

    const resolvedParams = await params;
    const prestasiId = parseInt(resolvedParams.id);
    if (isNaN(prestasiId)) {
      return ApiResponse.error('Invalid prestasi ID', 400);
    }

    const body = await request.json();
    const { validated } = body;

    if (validated === undefined) {
      return ApiResponse.error('Validated field is required', 400);
    }

    // Check if prestasi exists and belongs to guru's santri
    const existingPrestasi = await prisma.prestasi.findUnique({
      where: { id: prestasiId }
    });

    if (!existingPrestasi) {
      return ApiResponse.notFound('Prestasi not found');
    }

    const guruSantriIds = await getGuruSantriIds(user.id);
    if (!guruSantriIds.includes(existingPrestasi.santriId)) {
      return ApiResponse.forbidden('Access denied');
    }

    // Update validation status
    const updatedPrestasi = await prisma.prestasi.update({
      where: { id: prestasiId },
      data: { validated: Boolean(validated) },
      include: {
        santri: {
          select: {
            id: true,
            namaLengkap: true,
            username: true
          }
        }
      }
    });

    // Create notification for santri
    if (validated) {
      await prisma.notifikasi.create({
        data: {
          pesan: `Prestasi "${existingPrestasi.namaPrestasi}" telah divalidasi oleh guru`,
          type: 'rapot',
          refId: prestasiId,
          userId: existingPrestasi.santriId
        }
      });
    }

    return ApiResponse.success(updatedPrestasi);
  } catch (error) {
    console.error('PATCH /api/guru/prestasi/[id] error:', error);
    return ApiResponse.serverError('Failed to update prestasi validation');
  }
}

// DELETE prestasi
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    if (user.role.name !== 'guru') {
      return ApiResponse.forbidden('Access denied');
    }

    const resolvedParams = await params;
    const prestasiId = parseInt(resolvedParams.id);
    if (isNaN(prestasiId)) {
      return ApiResponse.error('Invalid prestasi ID', 400);
    }

    // Check if prestasi exists and belongs to guru's santri
    const existingPrestasi = await prisma.prestasi.findUnique({
      where: { id: prestasiId }
    });

    if (!existingPrestasi) {
      return ApiResponse.notFound('Prestasi not found');
    }

    const guruSantriIds = await getGuruSantriIds(user.id);
    if (!guruSantriIds.includes(existingPrestasi.santriId)) {
      return ApiResponse.forbidden('Access denied');
    }

    // Delete prestasi
    await prisma.prestasi.delete({
      where: { id: prestasiId }
    });

    return ApiResponse.success({ message: 'Prestasi deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/guru/prestasi/[id] error:', error);
    return ApiResponse.serverError('Failed to delete prestasi');
  }
}
