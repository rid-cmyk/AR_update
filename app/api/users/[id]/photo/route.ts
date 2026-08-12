import { getAuthUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

// PUT - Update user photo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await getAuthUser(request);
  if (!user || error) {
    return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
  }
  try {
    const { foto } = await request.json();
    const { id } = await params;
    const userId = parseInt(id);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true
      }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Authorization check — hanya user itu sendiri, super_admin, atau admin
    const currentUserRole = user.role.name;
    const isOwner = user.id === userId;

    if (!isOwner && !['super_admin', 'admin'].includes(currentUserRole)) {
      return NextResponse.json(
        { error: 'Tidak memiliki izin untuk mengubah foto user ini' },
        { status: 403 }
      );
    }
    // Admin tidak boleh mengubah foto super_admin/admin lain
    if (!isOwner && currentUserRole === 'admin' && ['super_admin', 'admin'].includes(existingUser.role.name)) {
      return NextResponse.json(
        { error: 'Admin tidak memiliki izin mengubah foto pengguna ini' },
        { status: 403 }
      );
    }
    
    // Update photo
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        foto: foto
      },
      select: {
        id: true,
        username: true,
        namaLengkap: true,
        foto: true,
        role: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Foto berhasil diperbarui',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating photo:', error);
    return NextResponse.json(
      { error: 'Failed to update photo' },
      { status: 500 }
    );
  }
}