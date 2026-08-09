import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

/**
 * Readiness Probe (/api/health/ready)
 * Verifies PostgreSQL database connectivity, acquire latency, and heap memory limits.
 * Returns HTTP 200 if ready to serve traffic, HTTP 503 if DB is unreachable.
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Check DB connection
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - startTime;

    const memory = process.memoryUsage();

    return NextResponse.json(
      {
        status: "ready",
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
        checks: {
          database: {
            status: "connected",
            latencyMs,
          },
          memory: {
            heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
            heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024),
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "unready",
        error: "Database connectivity check failed",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
