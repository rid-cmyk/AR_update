import { NextRequest, NextResponse } from "next/server";
import prisma from '@/lib/database/prisma';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken<Record<string, unknown>>(token);
    const userId = decoded.id as number;

    // Get fresh data from database to ensure synchronization
    const user = await prisma.user.findUnique({
      where: { id: typeof userId === 'string' ? parseInt(userId) : (userId as number) },
      include: { role: {
          select: { name: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        namaLengkap: user.namaLengkap,
        username: user.username,
        email: user.email,
        role: user.role.name,
        foto: user.foto,
        alamat: user.alamat,
        noTlp: user.noTlp,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error("Auth verification error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}