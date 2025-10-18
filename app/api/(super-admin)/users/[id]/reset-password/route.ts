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

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Check authorization - only super-admin and admin can reset passwords
    const currentUser = await getUserFromToken(req);
    if (!currentUser || !['super-admin', 'admin'].includes(currentUser.role.name)) {
      return NextResponse.json({ error: 'Unauthorized to reset passwords' }, { status: 403 });
    }

    // Generate new passcode (6 digits)
    const newPasscode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(newPasscode, 10);

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        password: hashedPassword,
        passCode: newPasscode
      },
      select: {
        id: true,
        namaLengkap: true,
        username: true
      }
    });

    return NextResponse.json({
      message: "Password reset successfully",
      newPasscode: newPasscode,
      user: updatedUser
    });
  } catch (error: any) {
    console.error("POST /api/users/[id]/reset-password error:", error);
    return NextResponse.json({ error: "Failed to reset password", detail: error.message }, { status: 500 });
  }
}