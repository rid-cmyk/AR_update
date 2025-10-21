import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from '@/lib/database/prisma';
import { loginSchema } from '@/lib/validations';

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { passCode } = loginSchema.parse(body);

    // Find user by passCode
    const user = await prisma.user.findFirst({
      where: { passCode: passCode },
      include: {
        role: {
          select: { name: true }
        }
      }
    });

    if (!user) {
      console.log('Login failed: Invalid passcode:', passCode);
      return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
    }

    console.log('Login successful for user:', user.namaLengkap, 'Role:', user.role.name);

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        namaLengkap: user.namaLengkap,
        username: user.username,
        role: user.role.name,
        foto: user.foto
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set HTTP-only cookie
    const response = NextResponse.json({
      user: {
        id: user.id,
        namaLengkap: user.namaLengkap,
        username: user.username,
        role: user.role.name,
        foto: user.foto
      },
      message: "Login successful"
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    // Log login activity
    await prisma.auditLog.create({
      data: {
        action: 'LOGIN',
        keterangan: `User ${user.namaLengkap} logged in`,
        userId: user.id
      }
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: "Validation failed", details: (error as any).errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}