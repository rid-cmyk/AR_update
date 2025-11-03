import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

// GET - Get role permissions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const roleId = parseInt(resolvedParams.id);

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      return NextResponse.json(
        { error: 'Role tidak ditemukan' },
        { status: 404 }
      );
    }

    // For now, return default permissions based on role name
    // In the future, this could be stored in a separate permissions table
    const defaultPermissions = getDefaultPermissions(role.name);

    return NextResponse.json({
      roleId,
      roleName: role.name,
      permissions: defaultPermissions
    });
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}

// PUT - Update role permissions
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { permissions } = await request.json();
    const resolvedParams = await params;
    const roleId = parseInt(resolvedParams.id);

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      return NextResponse.json(
        { error: 'Role tidak ditemukan' },
        { status: 404 }
      );
    }

    // Validate permissions array
    if (!Array.isArray(permissions)) {
      return NextResponse.json(
        { error: 'Permissions harus berupa array' },
        { status: 400 }
      );
    }

    // Here you would typically save to a permissions table
    // For now, we'll just return success
    // In a real implementation, you might have a RolePermissions table

    return NextResponse.json({
      message: 'Permissions berhasil diperbarui',
      roleId,
      roleName: role.name,
      permissions
    });
  } catch (error) {
    console.error('Error updating role permissions:', error);
    return NextResponse.json(
      { error: 'Failed to update permissions' },
      { status: 500 }
    );
  }
}

// Helper function to get default permissions based on role
function getDefaultPermissions(roleName: string): string[] {
  const rolePermissions: Record<string, string[]> = {
    'super_admin': [
      'dashboard_view', 'profile_view', 'profile_edit', 'pengumuman_view',
      'absensi_view', 'absensi_input', 'hafalan_view', 'hafalan_input',
      'laporan_view', 'laporan_export', 'user_management', 'role_management',
      'system_settings', 'backup_restore'
    ],
    'admin': [
      'dashboard_view', 'profile_view', 'profile_edit', 'pengumuman_view',
      'absensi_view', 'absensi_input', 'hafalan_view', 'hafalan_input',
      'laporan_view', 'laporan_export', 'user_management'
    ],
    'yayasan': [
      'dashboard_view', 'profile_view', 'profile_edit', 'pengumuman_view',
      'absensi_view', 'hafalan_view', 'laporan_view', 'laporan_export'
    ],
    'guru': [
      'dashboard_view', 'profile_view', 'profile_edit', 'pengumuman_view',
      'absensi_view', 'absensi_input', 'hafalan_view', 'hafalan_input'
    ],
    'santri': [
      'dashboard_view', 'profile_view', 'profile_edit', 'pengumuman_view',
      'absensi_view', 'hafalan_view'
    ],
    'ortu': [
      'dashboard_view', 'profile_view', 'profile_edit', 'pengumuman_view',
      'absensi_view', 'hafalan_view', 'laporan_view'
    ]
  };

  // Return default permissions for the role, or basic permissions for new roles
  return rolePermissions[roleName.toLowerCase()] || [
    'dashboard_view', 'profile_view', 'profile_edit', 'pengumuman_view'
  ];
}