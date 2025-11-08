import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { canEditOthersPasscode } from "@/lib/permissions";

const prisma = new PrismaClient();

// PUT - Update user passcode
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { passCode } = await request.json();
    const { id } = await params;
    const userId = parseInt(id);

    // Validate passcode
    if (!passCode) {
      return NextResponse.json(
        { error: 'Passcode harus diisi' },
        { status: 400 }
      );
    }

    // Validate passcode format (6-10 alphanumeric characters)
    if (passCode.length < 6 || passCode.length > 10 || !/^[a-zA-Z0-9]+$/.test(passCode)) {
      return NextResponse.json(
        { error: 'Passcode harus 6-10 karakter (huruf/angka, tanpa spasi atau simbol)' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Authorization check - only super_admin can edit other users' passcodes
    // In a real implementation, you would get the current user's role from session/JWT
    const currentUserRole = 'super_admin'; // This should come from authentication
    
    if (!canEditOthersPasscode(currentUserRole)) {
      return NextResponse.json(
        { error: 'Hanya Super Admin yang dapat mengedit passcode pengguna lain' },
        { status: 403 }
      );
    }
    
    // Update passcode
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        passCode: passCode
      },
      select: {
        id: true,
        username: true,
        namaLengkap: true,
        passCode: true,
        role: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Passcode berhasil diperbarui',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating passcode:', error);
    return NextResponse.json(
      { error: 'Failed to update passcode' },
      { status: 500 }
    );
  }
}

// GET - Get user passcode (for authorized users only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        namaLengkap: true,
        passCode: true,
        role: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Authorization check - only super_admin can view other users' passcodes
    const currentUserRole = 'super_admin'; // This should come from authentication
    
    if (!canEditOthersPasscode(currentUserRole)) {
      return NextResponse.json(
        { error: 'Hanya Super Admin yang dapat melihat passcode pengguna lain' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({
      userId: user.id,
      username: user.username,
      namaLengkap: user.namaLengkap,
      hasPasscode: !!user.passCode,
      passCode: user.passCode, // Only return if authorized
      role: user.role
    });
  } catch (error) {
    console.error('Error fetching user passcode:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user passcode' },
      { status: 500 }
    );
  }
}