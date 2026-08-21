import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/services/whatsapp";
import { ApiResponse, withAuth } from "@/lib/api-helpers";

// POST - Send test WhatsApp message
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) {
      return ApiResponse.unauthorized(error || 'Unauthorized');
    }

    const config = await import("@/lib/services/whatsapp").then((m) => m.getWhatsAppConfig());

    if (!config.enabled) {
      return ApiResponse.error(
        "WhatsApp is not enabled",
        400
      );
    }

    if (!config.apiKey || !config.sessionId) {
      return ApiResponse.error(
        "API Key or Session ID not configured",
        400
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
      return ApiResponse.success({ message: "Test message sent successfully" });
    } else {
      return ApiResponse.serverError(
        "Failed to send test message. Check API key and session ID."
      );
    }
  } catch (error) {
    console.error("Error sending test WhatsApp:", error);
    return ApiResponse.serverError(
      "Failed to send test message"
    );
  }
}
