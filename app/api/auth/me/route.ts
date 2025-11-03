import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from '@/lib/database/prisma';

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    // Get fresh data from database to ensure synchronization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
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