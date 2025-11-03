import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

// PUT - Update role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { name } = await request.json();
    const resolvedParams = await params;
    const roleId = parseInt(resolvedParams.id);

    // Validate input
    if (!name || name.trim().length < 3) {
      return NextResponse.json(
        { error: 'Nama role harus diisi minimal 3 karakter' },
        { status: 400 }
      );
    }

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!existingRole) {
      return NextResponse.json(
        { error: 'Role tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if new name already exists (excluding current role)
    const duplicateRole = await prisma.role.findFirst({
      where: {
        name: name.trim(),
        id: { not: roleId }
      }
    });

    if (duplicateRole) {
      return NextResponse.json(
        { error: 'Role dengan nama tersebut sudah ada' },
        { status: 400 }
      );
    }

    // Update role
    const updatedRole = await prisma.role.update({
      where: { id: roleId },
      data: {
        name: name.trim()
      },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    return NextResponse.json(updatedRole);
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}

// DELETE - Delete role
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const roleId = parseInt(resolvedParams.id);

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    if (!existingRole) {
      return NextResponse.json(
        { error: 'Role tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if role has users
    if (existingRole._count.users > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus role yang masih digunakan oleh user' },
        { status: 400 }
      );
    }

    // Prevent deletion of system roles
    const systemRoles = ['super_admin', 'admin', 'guru', 'santri', 'ortu', 'yayasan'];
    if (systemRoles.includes(existingRole.name.toLowerCase())) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus role sistem' },
        { status: 400 }
      );
    }

    // Delete role
    await prisma.role.delete({
      where: { id: roleId }
    });

    return NextResponse.json({ message: 'Role berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    );
  }
}