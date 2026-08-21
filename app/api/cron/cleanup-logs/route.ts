import { NextRequest, NextResponse } from "next/server";
import { cleanupAuditLogs } from "@/lib/services/audit.service";
import { prisma } from "@/lib/database/prisma";

// GET /api/cron/cleanup-logs
// Called periodically by cron to prune historical logs older than retention policy
export async function GET(request: NextRequest) {
  // Validate cron secret if configured
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get("authorization") || "";
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const xCronSecret = request.headers.get("x-cron-secret") || "";
    if (bearer !== secret && xCronSecret !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const auditCleanup = await cleanupAuditLogs(90);

    // Also cleanup WhatsApp delivery attempts older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const outboxCleanup = await prisma.whatsAppDeliveryAttempt.deleteMany({
      where: { createdAt: { lt: thirtyDaysAgo } }
    });

    return NextResponse.json({
      success: true,
      deletedAuditLogs: auditCleanup.deletedCount,
      deletedDeliveryAttempts: outboxCleanup.count,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron Cleanup Logs] Error during log cleanup:", error);
    return NextResponse.json(
      { error: "Failed to cleanup logs" },
      { status: 500 }
    );
  }
}
