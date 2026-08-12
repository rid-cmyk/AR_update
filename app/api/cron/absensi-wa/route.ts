import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

// GET /api/cron/absensi-wa
// Called by external cron scheduler every 30 minutes (18:00-23:00)
export async function GET(request: NextRequest) {
  // Validasi secret cron (fail-closed bila CRON_SECRET dikonfigurasi).
  // Vercel mengirimnya sebagai header `Authorization: Bearer <CRON_SECRET>`,
  // dan kami juga menerima header `x-cron-secret` untuk scheduler lain.
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
    // Ringan: hanya trigger event, selesai dalam hitungan ms
    await inngest.send({
      name: 'absensi/send-recap',
      data: { triggeredAt: new Date().toISOString() },
    });

    return NextResponse.json({
      success: true,
      message: 'Rekap absensi dijadwalkan untuk dikirim di background (Inngest)',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron Absensi WA] Error triggering inngest:", error);
    return NextResponse.json(
      { error: "Failed to schedule absensi recap" },
      { status: 500 }
    );
  }
}
