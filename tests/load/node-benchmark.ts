import http from "http";
import https from "https";
import { URL } from "url";
import jwt from "jsonwebtoken";

/**
 * Native Node.js Performance Benchmark & Load Testing Suite (Authenticated)
 * Teacher Workflow Stages: 50, 100, 250, 500 Virtual Users
 * Measures BOTH Cumulative End-to-End Workflow Latency and Per-Endpoint Latency Breakdown.
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production-min-32-chars";

// Generate valid JWT auth token for Virtual Teacher User
const authToken = jwt.sign(
  { id: 1, username: "guru_loadtest", namaLengkap: "Guru LoadTest", role: "guru" },
  JWT_SECRET,
  { expiresIn: "24h" }
);

interface EndpointResult {
  endpointName: string;
  type: "READ" | "WRITE" | "CRITICAL WRITE";
  durationMs: number;
  statusCode: number;
  success: boolean;
}

interface IterationResult {
  workflowDurationMs: number;
  success: boolean;
}

function sendRequest(
  endpointName: string,
  type: "READ" | "WRITE" | "CRITICAL WRITE",
  urlStr: string,
  method: string = "GET",
  body?: object
): Promise<EndpointResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const parsedUrl = new URL(urlStr);
    const client = parsedUrl.protocol === "https:" ? https : http;

    const payloadStr = body ? JSON.stringify(body) : undefined;
    const req = client.request(
      parsedUrl,
      {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
          "Cookie": `auth_token=${authToken}`,
          "User-Agent": "Node-Benchmark-Agent",
          ...(payloadStr ? { "Content-Length": Buffer.byteLength(payloadStr) } : {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          const durationMs = Date.now() - startTime;
          resolve({
            endpointName,
            type,
            durationMs,
            statusCode: res.statusCode || 500,
            success: (res.statusCode || 500) < 400,
          });
        });
      }
    );

    req.on("error", () => {
      resolve({
        endpointName,
        type,
        durationMs: Date.now() - startTime,
        statusCode: 500,
        success: false,
      });
    });

    if (payloadStr) {
      req.write(payloadStr);
    }
    req.end();
  });
}

async function runStage(concurrency: number, iterationsPerUser: number = 2) {
  console.log(`\n--------------------------------------------------`);
  console.log(`🏃 Running Load Stage: ${concurrency} Concurrent Virtual Teachers (Authenticated)`);
  console.log(`--------------------------------------------------`);

  const endpoints = [
    { name: "1. Auth Session", type: "READ" as const, url: `${BASE_URL}/api/auth/session`, method: "GET" },
    { name: "2. Santri List", type: "READ" as const, url: `${BASE_URL}/api/guru/hafalan`, method: "GET" },
    { name: "3. Write Absensi", type: "WRITE" as const, url: `${BASE_URL}/api/guru/absensi`, method: "POST", body: { santriId: 1, status: "HADIR" } },
    { name: "4. Write Hafalan", type: "CRITICAL WRITE" as const, url: `${BASE_URL}/api/guru/hafalan`, method: "POST", body: { santriId: 1, surat: "Al-Fatihah", nilai: 95 } },
    { name: "5. Notifikasi", type: "READ" as const, url: `${BASE_URL}/api/notifikasi`, method: "GET" },
  ];

  const stageStartTime = Date.now();
  const allResults: EndpointResult[] = [];
  const workflowResults: IterationResult[] = [];

  const workerTasks = Array.from({ length: concurrency }, async () => {
    for (let i = 0; i < iterationsPerUser; i++) {
      const iterStartTime = Date.now();
      let iterSuccess = true;

      for (const ep of endpoints) {
        const res = await sendRequest(ep.name, ep.type, ep.url, ep.method, ep.body);
        allResults.push(res);
        if (!res.success) iterSuccess = false;
      }

      workflowResults.push({
        workflowDurationMs: Date.now() - iterStartTime,
        success: iterSuccess,
      });
    }
  });

  await Promise.all(workerTasks);
  const totalStageDurationSec = (Date.now() - stageStartTime) / 1000;

  const totalRequests = allResults.length;
  const successfulRequests = allResults.filter((r) => r.success).length;
  const failedRequests = totalRequests - successfulRequests;
  const errorRate = ((failedRequests / totalRequests) * 100).toFixed(2);
  const rps = (totalRequests / totalStageDurationSec).toFixed(1);

  // Single Request Latencies
  const singleDurations = allResults.map((r) => r.durationMs).sort((a, b) => a - b);
  const singleP50 = singleDurations[Math.floor(singleDurations.length * 0.50)] || 0;
  const singleP95 = singleDurations[Math.floor(singleDurations.length * 0.95)] || 0;
  const singleP99 = singleDurations[Math.floor(singleDurations.length * 0.99)] || 0;

  // Cumulative Sequential Workflow Latencies
  const wfDurations = workflowResults.map((r) => r.workflowDurationMs).sort((a, b) => a - b);
  const cumulativeP50 = wfDurations[Math.floor(wfDurations.length * 0.50)] || 0;
  const cumulativeP95 = wfDurations[Math.floor(wfDurations.length * 0.95)] || 0;
  const cumulativeP99 = wfDurations[Math.floor(wfDurations.length * 0.99)] || 0;

  console.log(`  - Total Requests        : ${totalRequests}`);
  console.log(`  - Total Duration        : ${totalStageDurationSec.toFixed(2)}s`);
  console.log(`  - Throughput (RPS)      : ${rps} req/sec`);
  console.log(`  - Error Rate            : ${errorRate}% (${failedRequests} failed)`);
  console.log(`  - Single Request P95    : ${singleP95}ms`);
  console.log(`  - Cumulative Workflow P95: ${cumulativeP95}ms (End-to-End 5 Steps)`);
  console.log(`  - Cumulative Workflow P99: ${cumulativeP99}ms (End-to-End 5 Steps)`);

  // Compute breakdown per endpoint
  const endpointBreakdown: Record<string, any> = {};
  for (const ep of endpoints) {
    const epResults = allResults.filter((r) => r.endpointName === ep.name);
    const epDurations = epResults.map((r) => r.durationMs).sort((a, b) => a - b);
    const epP50 = epDurations[Math.floor(epDurations.length * 0.50)] || 0;
    const epP95 = epDurations[Math.floor(epDurations.length * 0.95)] || 0;
    const epP99 = epDurations[Math.floor(epDurations.length * 0.99)] || 0;
    const epFailed = epResults.filter((r) => !r.success).length;
    const epErrRate = ((epFailed / epResults.length) * 100).toFixed(1);

    const slaStatus =
      ep.type === "READ"
        ? epP95 <= 500 ? "🟢 SLA Met" : "🔴 SLA Exceeded (>500ms)"
        : ep.type === "WRITE"
        ? epP95 <= 800 ? "🟢 SLA Met" : "🔴 SLA Exceeded (>800ms)"
        : epP99 <= 2000 ? "🟢 SLA Met" : "🔴 SLA Exceeded (>2000ms)";

    endpointBreakdown[ep.name] = {
      Type: ep.type,
      "P50 (ms)": epP50,
      "P95 (ms)": epP95,
      "P99 (ms)": epP99,
      "Error Rate": `${epErrRate}%`,
      "SLA Status": slaStatus,
    };
  }

  console.log(`\n  📍 Per-Endpoint Latency Breakdown (${concurrency} VUs):`);
  console.table(endpointBreakdown);

  return {
    Stage: `${concurrency} Guru`,
    RPS: Number(rps),
    "Single Req P95": singleP95,
    "Cumulative WF P95": cumulativeP95,
    "Cumulative WF P99": cumulativeP99,
    Error: `${errorRate}%`,
  };
}

async function startBenchmarkSuite() {
  console.log("==================================================");
  console.log("🚀 AR-Hafalan Benchmark Suite: Guru Workflow (Authenticated)");
  console.log(`Target Base URL: ${BASE_URL}`);
  console.log("==================================================");

  const stages = [50, 100, 250, 500];
  const summaryTable = [];

  for (const vus of stages) {
    const result = await runStage(vus, 2);
    summaryTable.push(result);
  }

  console.log("\n==================================================");
  console.log("📋 OVERALL WORKFLOW BENCHMARK SUMMARY (50 ➔ 500 GURU)");
  console.log("==================================================");
  console.table(summaryTable);
}

startBenchmarkSuite();
