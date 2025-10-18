/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// UPDATE role
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const body = await req.json();
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json({ error: 'Role name is required' }, { status: 400 });
    }

    const trimmedName = body.name.trim();
    // Normalize role name: capitalize first letter, rest lowercase
    const normalizedName = trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1).toLowerCase();
    const roleId = Number(id);

    // Check for case-insensitive duplicate (excluding current role)
    const existingRoles = await prisma.$queryRaw<Array<{ id: number; name: string }>>`
      SELECT id, name FROM "Role" WHERE LOWER(name) = LOWER(${normalizedName}) AND id != ${roleId}
    `;
    if (existingRoles.length > 0) {
      return NextResponse.json({
        error: `Role "${normalizedName}" sudah ada. Gunakan nama lain.`
      }, { status: 400 });
    }

    const role = await prisma.role.update({
      where: { id: roleId },
      data: { name: normalizedName },
    });

    return NextResponse.json(role);
  } catch (error: any) {
    console.error('PUT /api/roles/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update role', detail: error.message }, { status: 500 });
  }
}

// DELETE role
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const roleId = Number(id);

    // First, delete all users associated with this role
    await prisma.user.deleteMany({
      where: { roleId: roleId }
    });

    // Then delete the role
    await prisma.role.delete({ where: { id: roleId } });

    return NextResponse.json({
      message: 'Role and associated users deleted successfully'
    });
  } catch (error: any) {
    console.error('DELETE /api/roles/[id] error:', error);
    return NextResponse.json({
      error: 'Failed to delete role',
      detail: error.message
    }, { status: 500 });
  }
}
