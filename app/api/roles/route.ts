import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getDefaultPermissionsForNewRole, syncRolePermissions } from "@/lib/permissions";

const prisma = new PrismaClient();

// GET - Fetch all roles
export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

// POST - Create new role
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    // Validate input
    if (!name || name.trim().length < 3) {
      return NextResponse.json(
        { error: 'Nama role harus diisi minimal 3 karakter' },
        { status: 400 }
      );
    }

    // Check if role already exists
    const existingRole = await prisma.role.findUnique({
      where: { name: name.trim() }
    });

    if (existingRole) {
      return NextResponse.json(
        { error: 'Role dengan nama tersebut sudah ada' },
        { status: 400 }
      );
    }

    // Create new role
    const newRole = await prisma.role.create({
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

    // Auto-assign default permissions untuk role baru
    const defaultPermissions = getDefaultPermissionsForNewRole();
    await syncRolePermissions(newRole.name, defaultPermissions);

    return NextResponse.json(newRole, { status: 201 });
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    );
  }
}