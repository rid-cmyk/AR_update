import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

// PUT - Update user photo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Authorization check - only super_admin can edit photos for santri
    // In a real implementation, you would get the current user's role from session/JWT
    const currentUserRole = 'super_admin'; // This should come from authentication
    
    if (existingUser.role.name.toLowerCase() === 'santri' && currentUserRole !== 'super_admin') {
      return NextResponse.json(
        { error: 'Hanya Super Admin yang dapat mengedit foto santri' },
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