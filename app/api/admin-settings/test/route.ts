import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Test endpoint untuk cek session
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      session: session
    });
  } catch (error) {
    return NextResponse.json({
      error: "Error getting session",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
