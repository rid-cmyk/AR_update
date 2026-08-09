import { prisma } from "../database/prisma";

/**
 * Worker Processor & Crash Recovery Engine for WhatsApp Outbox Messages
 */

export interface SendResult {
  success: boolean;
  providerMessageId?: string;
  responseBody?: string;
  error?: string;
}

/**
 * Process a single outbox message with detailed Delivery Attempt tracking.
 */
export async function processOutboxMessage(
  outboxId: number,
  sendFn: (recipient: string, message: string) => Promise<SendResult>
) {
  const outbox = await prisma.whatsAppOutbox.findUnique({
    where: { id: outboxId },
  });

  if (!outbox) {
    throw new Error(`Outbox message #${outboxId} not found`);
  }

  // Already sent - idempotent bypass
  if (outbox.status === "SENT") {
    console.log(`[Outbox Worker] Message #${outboxId} already SENT. Skipping.`);
    return { success: true, status: "SENT" as const };
  }

  const currentAttemptNumber = outbox.attempts + 1;
  const startedAt = new Date();

  // 1. Transition status to PROCESSING
  await prisma.whatsAppOutbox.update({
    where: { id: outboxId },
    data: { status: "PROCESSING", attempts: currentAttemptNumber },
  });

  // 2. Log delivery attempt start
  const attemptRecord = await prisma.whatsAppDeliveryAttempt.create({
    data: {
      outboxId: outbox.id,
      attemptNumber: currentAttemptNumber,
      status: "PROCESSING",
      startedAt,
    },
  });

  try {
    // 3. Execute sending function
    const result = await sendFn(outbox.recipient, outbox.messageContent);

    if (result.success) {
      const finishedAt = new Date();
      await prisma.$transaction([
        prisma.whatsAppOutbox.update({
          where: { id: outbox.id },
          data: {
            status: "SENT",
            sentAt: finishedAt,
            providerMessageId: result.providerMessageId,
            lastError: null,
          },
        }),
        prisma.whatsAppDeliveryAttempt.update({
          where: { id: attemptRecord.id },
          data: {
            status: "SUCCESS",
            finishedAt,
            response: result.responseBody || "Message delivered successfully",
          },
        }),
      ]);

      console.log(`[Outbox Worker] Message #${outbox.id} successfully SENT.`);
      return { success: true, status: "SENT" };
    } else {
      throw new Error(result.error || "Delivery failed");
    }
  } catch (error: any) {
    const finishedAt = new Date();
    const errorMessage = error.message || "Unknown delivery error";
    const nextStatus = currentAttemptNumber >= 3 ? "FAILED" : "RETRY";

    await prisma.$transaction([
      prisma.whatsAppOutbox.update({
        where: { id: outbox.id },
        data: {
          status: nextStatus,
          lastError: errorMessage,
        },
      }),
      prisma.whatsAppDeliveryAttempt.update({
        where: { id: attemptRecord.id },
        data: {
          status: "FAILED",
          finishedAt,
          error: errorMessage,
        },
      }),
    ]);

    console.warn(`[Outbox Worker] Message #${outbox.id} attempt ${currentAttemptNumber} failed: ${errorMessage}`);
    return { success: false, status: nextStatus, error: errorMessage };
  }
}

/**
 * Crash Recovery: Find outbox records stuck in PROCESSING > 5 minutes and reset to RETRY.
 */
export async function recoverStaleProcessingMessages(staleTimeoutMinutes: number = 5) {
  const cutoffTime = new Date(Date.now() - staleTimeoutMinutes * 60 * 1000);

  const result = await prisma.whatsAppOutbox.updateMany({
    where: {
      status: "PROCESSING",
      updatedAt: { lt: cutoffTime },
    },
    data: {
      status: "RETRY",
      lastError: "Stale lock recovery: worker crash or timeout reset",
    },
  });

  if (result.count > 0) {
    console.log(`[Outbox Recovery] Recovered ${result.count} stale PROCESSING message(s) -> RETRY.`);
  }

  return result.count;
}
