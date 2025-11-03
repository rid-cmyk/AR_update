import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import prisma from '@/lib/database/prisma';

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };

    // Verify user role is super-admin (only super-admin can manage roles)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: { select: { name: true } } }
    });

    if (!user || user.role.name !== 'super_admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all roles and generate dynamic permissions
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { users: true }
        }
      }
    });

    // Generate dynamic permissions for each role
    const dynamicPermissions: Record<string, any> = {};

    roles.forEach((role, index) => {
      const roleName = role.name.toLowerCase();
      const level = roleName === 'super_admin' ? 6 : 
                   roleName === 'admin' ? 5 : 
                   roleName === 'guru' ? 4 : 
                   roleName === 'santri' ? 3 : 
                   roleName === 'ortu' ? 2 : 
                   roleName === 'yayasan' ? 1 : 
                   Math.max(1, 6 - index); // Dynamic level for new roles

      dynamicPermissions[roleName] = {
        level: level,
        allowedRoutes: [
          roleName,
          `${roleName}/profil`,
          // Super admin gets access to all routes
          ...(roleName === 'super_admin' ? ['admin', 'guru', 'santri', 'ortu', 'yayasan', 'users', 'settings'] : []),
          // Admin gets access to most routes except super-admin
          ...(roleName === 'admin' ? ['guru', 'santri', 'ortu', 'yayasan'] : [])
        ],
        dashboard: `/${roleName}/dashboard`,
        userCount: role._count.users
      };
    });

    return NextResponse.json({
      permissions: dynamicPermissions,
      roles: roles,
      message: "Dynamic role permissions generated successfully"
    });

  } catch (error) {
    console.error("Error fetching role permissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from JWT token
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };

    // Verify user role is super-admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: { select: { name: true } } }
    });

    if (!user || user.role.name !== 'super_admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roleName, level } = await request.json();

    if (!roleName) {
      return NextResponse.json({ error: "Role name is required" }, { status: 400 });
    }

    // Create new role in database
    const newRole = await prisma.role.create({
      data: {
        name: roleName.toLowerCase().replace(/\s+/g, '_')
      }
    });

    // Generate permission for new role
    const newPermission = {
      level: level || 1,
      allowedRoutes: [newRole.name, `${newRole.name}/profil`],
      dashboard: `/${newRole.name}/dashboard`,
      userCount: 0
    };

    return NextResponse.json({
      role: newRole,
      permission: newPermission,
      message: "New role created successfully"
    });

  } catch (error) {
    console.error("Error creating role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}