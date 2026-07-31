import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { getWhatsAppConfig, resetConfigCache } from "@/lib/services/whatsapp";

// GET - Fetch WhatsApp settings
export async function GET() {
  try {
    const config = await getWhatsAppConfig();

    return NextResponse.json({
      success: true,
      data: {
        whatsapp_enabled: config.enabled,
        whatsapp_api_key: config.apiKey ? "••••" + config.apiKey.slice(-4) : "",
        whatsapp_session_id: config.sessionId ? "••••" + config.sessionId.slice(-4) : "",
      },
    });
  } catch (error) {
    console.error("Error fetching WhatsApp settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch WhatsApp settings" },
      { status: 500 }
    );
  }
}

// POST - Update WhatsApp settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { whatsapp_enabled, whatsapp_api_key, whatsapp_session_id } = body;

    const existing = await prisma.systemSetting.findUnique({ where: { id: "global" } });
    const currentData = existing ? (existing.data as Record<string, unknown>) : {};

    const newData: Record<string, unknown> = {
      ...currentData,
      whatsapp_enabled: Boolean(whatsapp_enabled),
    };

    // Only update API key and session ID if new values are provided (not masked)
    if (whatsapp_api_key && !whatsapp_api_key.startsWith("••••")) {
      newData.whatsapp_api_key = whatsapp_api_key;
    }
    if (whatsapp_session_id && !whatsapp_session_id.startsWith("••••")) {
      newData.whatsapp_session_id = whatsapp_session_id;
    }

    await prisma.systemSetting.upsert({
      where: { id: "global" },
      create: { id: "global", data: newData as any },
      update: { data: newData as any },
    });

    resetConfigCache();

    return NextResponse.json({ success: true, message: "WhatsApp settings saved" });
  } catch (error) {
    console.error("Error updating WhatsApp settings:", error);
    return NextResponse.json(
      { error: "Failed to update WhatsApp settings" },
      { status: 500 }
    );
  }
}
