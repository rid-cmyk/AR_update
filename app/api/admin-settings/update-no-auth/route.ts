import { NextResponse } from "next/server";

// This endpoint has been removed for security reasons.
// Use /api/admin/settings instead with proper authentication.
export async function PUT() {
  return NextResponse.json(
    { error: 'Endpoint removed. Use /api/admin/settings with authentication.' },
    { status: 410 }
  );
}
