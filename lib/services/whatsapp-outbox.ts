import { Prisma } from "@prisma/client";
import { prisma } from "../database/prisma";

export interface EnqueueWhatsAppParams {
  eventId: string;
  recipient: string;
  messageType: "hafalan" | "absensi" | "target" | "ujian" | "prestasi" | "passcode";
  messageContent: string;
  referenceId?: number;
  scheduledAt?: Date;
}

/**
 * Enqueue WhatsApp Notification using Outbox Pattern.
 * Must be executed within a Prisma Transaction to guarantee ACID atomicity.
 * Idempotent: If eventId already exists, ignores duplicate insertion.
 */
export async function enqueueWhatsAppMessage(
  tx: Prisma.TransactionClient | typeof prisma,
  params: EnqueueWhatsAppParams
) {
  try {
    const existing = await tx.whatsAppOutbox.findUnique({
      where: { eventId: params.eventId },
    });

    if (existing) {
      console.log(`[WhatsApp Outbox] Event ID ${params.eventId} already enqueued (Idempotent bypass).`);
      return existing;
    }

    const outbox = await tx.whatsAppOutbox.create({
      data: {
        eventId: params.eventId,
        recipient: params.recipient,
        messageType: params.messageType,
        messageContent: params.messageContent,
        referenceId: params.referenceId,
        scheduledAt: params.scheduledAt,
        status: "PENDING",
        attempts: 0,
      },
    });

    console.log(`[WhatsApp Outbox] Enqueued message #${outbox.id} for ${params.recipient} (EventId: ${params.eventId})`);
    return outbox;
  } catch (error) {
    console.error(`[WhatsApp Outbox] Error enqueuing message for ${params.recipient}:`, error);
    throw error;
  }
}
