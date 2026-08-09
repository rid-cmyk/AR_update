import { describe, it, expect, beforeEach } from "vitest";
import { enqueueWhatsAppMessage } from "../../lib/services/whatsapp-outbox";
import { processOutboxMessage, recoverStaleProcessingMessages } from "../../lib/services/whatsapp-outbox-worker";
import { prisma } from "../../lib/database/prisma";

describe("WhatsApp Outbox Pattern & Reliability Unit Suite", () => {
  const testEventId = `test:absensi:${Date.now()}:santri-99`;

  beforeEach(async () => {
    // Clean up test records
    await prisma.whatsAppDeliveryAttempt.deleteMany({
      where: { outbox: { eventId: { startsWith: "test:" } } },
    });
    await prisma.whatsAppOutbox.deleteMany({
      where: { eventId: { startsWith: "test:" } },
    });
  });

  it("1. Enqueues Outbox message idempotently inside transaction", async () => {
    const params = {
      eventId: testEventId,
      recipient: "628123456789",
      messageType: "absensi" as const,
      messageContent: "Santri Ahmad Hadir",
      referenceId: 101,
    };

    // First enqueue
    const record1 = await enqueueWhatsAppMessage(prisma, params);
    expect(record1).toBeDefined();
    expect(record1.status).toBe("PENDING");

    // Second enqueue with duplicate eventId (Idempotency test)
    const record2 = await enqueueWhatsAppMessage(prisma, params);
    expect(record2.id).toBe(record1.id);
  });

  it("2. Processes Outbox message and records WhatsAppDeliveryAttempt on SUCCESS", async () => {
    const record = await enqueueWhatsAppMessage(prisma, {
      eventId: `${testEventId}-success`,
      recipient: "628123456789",
      messageType: "hafalan" as const,
      messageContent: "Setoran Surah Al-Mulk Lancar",
    });

    const mockSendFn = async () => ({
      success: true,
      providerMessageId: "WA_MSG_12345",
      responseBody: "Delivered to device",
    });

    const result = await processOutboxMessage(record.id, mockSendFn);
    expect(result.success).toBe(true);

    const updatedOutbox = await prisma.whatsAppOutbox.findUnique({
      where: { id: record.id },
      include: { deliveryAttempts: true },
    });

    expect(updatedOutbox?.status).toBe("SENT");
    expect(updatedOutbox?.providerMessageId).toBe("WA_MSG_12345");
    expect(updatedOutbox?.deliveryAttempts.length).toBe(1);
    expect(updatedOutbox?.deliveryAttempts[0].status).toBe("SUCCESS");
  });

  it("3. Handles worker crash recovery by resetting stale PROCESSING messages to RETRY", async () => {
    const record = await enqueueWhatsAppMessage(prisma, {
      eventId: `${testEventId}-crash`,
      recipient: "628123456789",
      messageType: "absensi" as const,
      messageContent: "Crash Recovery Test",
    });

    // Simulate worker crashing while processing message 10 minutes ago
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    await prisma.whatsAppOutbox.update({
      where: { id: record.id },
      data: { status: "PROCESSING", updatedAt: tenMinutesAgo },
    });

    const recoveredCount = await recoverStaleProcessingMessages(5);
    expect(recoveredCount).toBeGreaterThanOrEqual(1);

    const recoveredRecord = await prisma.whatsAppOutbox.findUnique({
      where: { id: record.id },
    });
    expect(recoveredRecord?.status).toBe("RETRY");
  });
});
