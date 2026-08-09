import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from "@/lib/auth"



// Test endpoint untuk cek session
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthUser(request);
    
    return NextResponse.json({
      hasSession: !!user,
      hasUser: !!user,
      userId: user?.id,
      user: user
    });
  } catch (error) {
    return NextResponse.json({
      error: "Error getting session",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
