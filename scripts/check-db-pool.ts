import { prisma } from "../lib/database/prisma";

/**
 * Audit Script for Prisma Database Connection Pool & Multi-Concurrency Escalation
 * Concurrency stages: 20, 50, 100, 250, 500 parallel queries
 */
async function auditDatabaseConnectionPool() {
  console.log("==================================================");
  console.log("🔍 AR-Hafalan DB Connection Pool Multi-Concurrency Test");
  console.log("==================================================");

  const isGlobalSet = !!(global as any).__prisma;
  console.log(`Prisma Singleton Status: ${isGlobalSet ? "✅ OK (global.__prisma active)" : "⚠️ WARNING (global.__prisma missing)"}\n`);

  const concurrencyLevels = [20, 50, 100, 250, 500];
  const summaryReport: any[] = [];

  for (const concurrency of concurrencyLevels) {
    console.log(`🏃 Testing Concurrency Level: ${concurrency} parallel DB queries...`);
    const queryStart = Date.now();

    const parallelQueries = Array.from({ length: concurrency }, (_, i) => {
      const qStart = Date.now();
      return prisma.user
        .count()
        .then((count) => ({ id: i, count, durationMs: Date.now() - qStart, success: true, error: null }))
        .catch((err) => ({ id: i, count: 0, durationMs: Date.now() - qStart, success: false, error: err.message }));
    });

    const results = await Promise.all(parallelQueries);
    const totalTimeMs = Date.now() - queryStart;

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    const errorRate = ((failed / concurrency) * 100).toFixed(1);

    const durations = results.map((r) => r.durationMs).sort((a, b) => a - b);
    const p50 = durations[Math.floor(durations.length * 0.50)] || 0;
    const p95 = durations[Math.floor(durations.length * 0.95)] || 0;
    const p99 = durations[Math.floor(durations.length * 0.99)] || 0;
    const max = durations[durations.length - 1] || 0;

    summaryReport.push({
      "Parallel Queries": concurrency,
      "Successful": `${successful}/${concurrency}`,
      "Error Rate": `${errorRate}%`,
      "P50 (ms)": p50,
      "P95 (ms)": p95,
      "P99 (ms)": p99,
      "Max (ms)": max,
      "Total Time (ms)": totalTimeMs,
    });
  }

  console.log("\n==================================================");
  console.log("📋 DB CONNECTION POOL CONCURRENCY ESCALATION REPORT");
  console.log("==================================================");
  console.table(summaryReport);

  await prisma.$disconnect();
}

auditDatabaseConnectionPool();
