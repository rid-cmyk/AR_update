import { NextResponse } from "next/server";

/**
 * Fast Liveness Probe (/api/health)
 * Zero DB query overhead. Confirms node process is responsive.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
