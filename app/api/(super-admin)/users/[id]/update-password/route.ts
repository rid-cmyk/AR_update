import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Helper function to get user from token
async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    return await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: { select: { name: true } } }
    });
  } catch {
    return null;
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Get current user from token
    const currentUser = await getUserFromToken(req);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Users can only update their own password, or super-admin/admin can update anyone's
    const targetUserId = parseInt(id);
    const canUpdate = currentUser.id === targetUserId ||
                      ['super-admin', 'admin'].includes(currentUser.role.name);

    if (!canUpdate) {
      return NextResponse.json({ error: 'You can only update your own password' }, { status: 403 });
    }

    const body = await req.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!newPassword || !confirmPassword) {
      return NextResponse.json({ error: "New password and confirmation are required" }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "New password and confirmation don't match" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
    }

    // Get the target user
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, password: true }
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If user is updating their own password, verify current password
    if (currentUser.id === targetUserId) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required" }, { status: 400 });
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, targetUser.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Prepare update data
    const updateData: any = {
      password: hashedNewPassword,
      passCode: newPassword // Always update passcode to match new password
    };

    // Update password and passcode
    await prisma.user.update({
      where: { id: targetUserId },
      data: updateData
    });

    return NextResponse.json({
      message: "Password updated successfully",
      note: "Your passcode has been updated to match your new password"
    });
  } catch (error: any) {
    console.error("PUT /api/users/[id]/update-password error:", error);
    return NextResponse.json({ error: "Failed to update password", detail: error.message }, { status: 500 });
  }
}