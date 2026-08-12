import { formatPhoneNumberForWhatsApp } from "@/lib/utils/phoneFormatter";
import { prisma } from "@/lib/database/prisma";

export interface WhatsAppConfig {
  apiUrl: string;
  apiKey: string;
  sessionId: string;
  enabled: boolean;
}

let cachedConfig: WhatsAppConfig | null = null;
let cacheExpiry: number = 0;

export async function getWhatsAppConfig(): Promise<WhatsAppConfig> {
  const now = Date.now();
  if (cachedConfig && now < cacheExpiry) {
    return cachedConfig;
  }

  const apiUrl = process.env.WHATSAPP_API_URL || "https://api.fullstacknotes.org/api/v1/messages/send";
  const apiKey = process.env.WHATSAPP_API_KEY || "";
  const sessionId = process.env.WHATSAPP_SESSION_ID || "";

  let enabled = false;
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { id: "global" } });
    if (setting) {
      const data = setting.data as Record<string, unknown>;
      enabled = data.whatsapp_enabled === true;

      if (data.whatsapp_api_key && typeof data.whatsapp_api_key === "string") {
        cachedConfig = {
          apiUrl,
          apiKey: data.whatsapp_api_key as string,
          sessionId: (data.whatsapp_session_id as string) || sessionId,
          enabled,
        };
        cacheExpiry = now + 5 * 60 * 1000;
        return cachedConfig;
      }
    }
  } catch {
    // SystemSetting belum ada, fallback ke .env
  }

  cachedConfig = {
    apiUrl,
    apiKey,
    sessionId,
    enabled: enabled && (!!apiKey && !!sessionId),
  };
  cacheExpiry = now + 5 * 60 * 1000;
  return cachedConfig;
}

export function resetConfigCache(): void {
  cachedConfig = null;
  cacheExpiry = 0;
}

export async function sendWhatsAppMessage(
  phone: string,
  message: string
): Promise<boolean> {
  const config = await getWhatsAppConfig();

  if (!config.enabled) {
    console.log("[WhatsApp] Disabled, skipping send to", phone);
    return false;
  }

  if (!config.apiKey || !config.sessionId) {
    console.warn("[WhatsApp] Missing API key or session ID");
    return false;
  }

  const formattedPhone = formatPhoneNumberForWhatsApp(phone);
  if (!formattedPhone || formattedPhone.length < 10) {
    console.warn("[WhatsApp] Invalid phone number:", phone);
    return false;
  }

  try {
    const response = await fetch(config.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": config.apiKey,
      },
      body: JSON.stringify({
        phone: formattedPhone,
        message,
        session_id: config.sessionId,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error("[WhatsApp] Send failed:", response.status, errorText);
      return false;
    }

    await response.json().catch(() => ({}));

    console.log("[WhatsApp] Message sent to", formattedPhone);
    return true;
  } catch (error) {
    console.error("[WhatsApp] Error sending message:", error);
    return false;
  }
}
