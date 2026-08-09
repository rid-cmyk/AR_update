import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

// GET /api/cron/absensi-wa
// Called by external cron scheduler every 30 minutes (18:00-23:00)
export async function GET(request: NextRequest) {
  // Optional: validate cron secret header for security
  const cronSecret = request.headers.get("x-cron-secret");
  if (cronSecret && cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
