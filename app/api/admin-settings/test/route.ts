import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from "@/lib/auth"



// Test endpoint untuk cek session — hanya untuk super_admin/admin
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthUser(request);
    if (!user || error) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    if (!['super_admin', 'admin'].includes(user.role.name)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      hasSession: true,
      hasUser: true,
      userId: user.id,
      role: user.role.name
    });
  } catch (error) {
    return NextResponse.json({
      error: "Error getting session"
    }, { status: 500 });
  }
}
