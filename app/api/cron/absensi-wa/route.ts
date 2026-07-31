import { NextRequest, NextResponse } from "next/server";
import { sendAbsensiRecap } from "@/lib/services/whatsapp-notifier";

// GET /api/cron/absensi-wa
// Called by external cron scheduler every 30 minutes (18:00-23:00)
// Sends WhatsApp recap after the last halaqah of the day ends
export async function GET(request: NextRequest) {
  // Optional: validate cron secret header for security
  const cronSecret = request.headers.get("x-cron-secret");
  if (cronSecret && cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await sendAbsensiRecap();

    return NextResponse.json({
      success: true,
      message: `Absensi recap sent. Sent: ${result.sent}, Failed: ${result.failed}`,
      sent: result.sent,
      failed: result.failed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron Absensi WA] Error:", error);
    return NextResponse.json(
      { error: "Failed to send absensi recap" },
      { status: 500 }
    );
  }
}
