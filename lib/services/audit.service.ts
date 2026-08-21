import { prisma } from '@/lib/database/prisma';

/**
 * Create an audit log entry.
 * Fire-and-forget — callers should .catch(console.error) if needed.
 */
export async function createAuditLog(
  action: string,
  keterangan: string,
  userId: number,
  meta?: { ipAddress?: string | null; userAgent?: string | null; module?: string }
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      action,
      keterangan,
      userId,
      ipAddress: meta?.ipAddress ?? null,
      userAgent: meta?.userAgent ?? null,
      module: meta?.module ?? action,
    },
  });
}

/**
 * Cleanup audit logs older than a given number of days (default: 90 days).
 * Returns the count of deleted records.
 */
export async function cleanupAuditLogs(olderThanDays = 90): Promise<{ deletedCount: number }> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const result = await prisma.auditLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  });

  return { deletedCount: result.count };
}
