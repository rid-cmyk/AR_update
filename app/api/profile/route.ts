import { NextRequest, NextResponse } from "next/server";
import prisma from '@/lib/database/prisma';
import { cookies } from "next/headers";
import { signToken, verifyToken } from '@/lib/jwt';

// GET - Fetch user profile with complete data
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken<Record<string, unknown>>(token);
    const userId = typeof decoded.id === 'string' ? parseInt(decoded.id) : (decoded.id as number);

    // Get complete user data from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: {
          select: { name: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        namaLengkap: user.namaLengkap,
        username: user.username,
        email: user.email,
        foto: user.foto,
        alamat: user.alamat,
        noTlp: user.noTlp,
        role: (user as any).role.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken<Record<string, unknown>>(token);
    const userId = typeof decoded.id === 'string' ? parseInt(decoded.id) : (decoded.id as number);

    const body = await request.json();
    const { namaLengkap, username, email, foto, alamat, noTlp, passCode } = body;

    // Validate required fields
    if (!namaLengkap || !username) {
      return NextResponse.json(
        { error: "Nama lengkap dan username wajib diisi" },
        { status: 400 }
      );
    }

    // Check if username is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        username: username,
        NOT: { id: userId }
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username sudah digunakan oleh user lain" },
        { status: 400 }
      );
    }

    // Update user profile
    const updateData: any = {
      namaLengkap,
      email,
      foto,
      alamat,
      noTlp,
      updatedAt: new Date()
    };

    // Update username and passCode if provided
    if (username) {
      updateData.username = username;
      updateData.passCode = passCode || username; // Use passCode if provided, otherwise use username
      updateData.password = username; // Also update password to match
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { role: {
          select: { name: true }
        }
      }
    });

    // Create new JWT token with updated data
    const newToken = signToken({
      id: updatedUser.id,
      namaLengkap: updatedUser.namaLengkap,
      username: updatedUser.username,
      role: (updatedUser as any).role.name,
      foto: updatedUser.foto
    });

    // Log profile update activity
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_PROFILE',
        keterangan: `User ${updatedUser.namaLengkap} updated profile`,
        userId: updatedUser.id
      }
    });

    // Set updated HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: "Profil berhasil diperbarui",
      user: {
        id: updatedUser.id,
        namaLengkap: updatedUser.namaLengkap,
        username: updatedUser.username,
        email: updatedUser.email,
        foto: updatedUser.foto,
        alamat: updatedUser.alamat,
        noTlp: updatedUser.noTlp,
        role: (updatedUser as any).role.name
      }
    });

    response.cookies.set('auth_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return response;

  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui profil" },
      { status: 500 }
    );
  }
}