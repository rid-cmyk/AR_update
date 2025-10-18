/* eslint-disable @typescript-eslint/no-unused-vars */
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    const body = await request.json();

    // Validate required fields
    if (!body.oldPassword || !body.newPassword) {
      return NextResponse.json({
        error: 'Password lama dan password baru wajib diisi'
      }, { status: 400 });
    }

    if (body.newPassword.length < 6) {
      return NextResponse.json({
        error: 'Password baru minimal 6 karakter'
      }, { status: 400 });
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(body.oldPassword, user.password);
    if (!isOldPasswordValid) {
      return NextResponse.json({
        error: 'Password lama tidak sesuai'
      }, { status: 400 });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(body.newPassword, 10);

    // Update password and passcode
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        passCode: body.newPassword, // Update passcode to match new password
      },
    });

    return NextResponse.json({
      message: 'Password berhasil diubah. Passcode Anda sekarang sama dengan password baru.'
    });
  } catch (error: any) {
    console.error('PATCH /api/profile/password error:', error);
    return NextResponse.json({
      error: 'Failed to update password',
      detail: error.message
    }, { status: 500 });
  }
}