import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

/**
 * Production Health Check Endpoint
 * Inspects: DB Connection Latency, Memory Usage, System Status
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // 1. Verify PostgreSQL Database connectivity
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - startTime;

    const memoryUsage = process.memoryUsage();

    return NextResponse.json(
      {
        status: "healthy",
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        checks: {
          database: {
            status: "connected",
            latencyMs: dbLatencyMs,
          },
          memory: {
            heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error.message || "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
