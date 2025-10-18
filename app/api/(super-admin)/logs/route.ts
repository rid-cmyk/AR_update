import prisma from '@/lib/prisma';
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: true },
      orderBy: { tanggal: 'desc' },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("GET /api/logs error:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}