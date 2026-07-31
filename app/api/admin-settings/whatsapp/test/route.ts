import { NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/services/whatsapp";

// POST - Send test WhatsApp message
export async function POST() {
  try {
    const config = await import("@/lib/services/whatsapp").then((m) => m.getWhatsAppConfig());

    if (!config.enabled) {
      return NextResponse.json(
        { error: "WhatsApp is not enabled" },
        { status: 400 }
      );
    }

    if (!config.apiKey || !config.sessionId) {
      return NextResponse.json(
        { error: "API Key or Session ID not configured" },
        { status: 400 }
      );
    }

    // Send test message to the configured number
    const testPhone = "6281213923253";
    const testMessage = [
      "✅ *Test WhatsApp - AR-Hafalan*",
      "",
      "WhatsApp notification berhasil dikirim!",
      `📅 ${new Date().toLocaleString("id-ID")}`,
      "",
      "Ini adalah pesan test dari sistem notifikasi.",
    ].join("\n");

    const result = await sendWhatsAppMessage(testPhone, testMessage);

    if (result) {
      return NextResponse.json({ success: true, message: "Test message sent successfully" });
    } else {
      return NextResponse.json(
        { error: "Failed to send test message. Check API key and session ID." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending test WhatsApp:", error);
    return NextResponse.json(
      { error: "Failed to send test message" },
      { status: 500 }
    );
  }
}
