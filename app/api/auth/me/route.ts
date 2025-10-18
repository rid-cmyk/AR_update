import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    return NextResponse.json({
      user: {
        id: decoded.id,
        namaLengkap: decoded.namaLengkap,
        username: decoded.username,
        role: decoded.role,
        foto: decoded.foto
      }
    });

  } catch (error) {
    console.error("Auth verification error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}