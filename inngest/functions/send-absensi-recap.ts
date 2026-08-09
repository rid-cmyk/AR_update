import { inngest } from '../client';
import { sendAbsensiRecap } from '@/lib/services/whatsapp-notifier';

export const sendAbsensiRecapFn = inngest.createFunction(
  {
    id: 'send-absensi-recap',
    name: 'Kirim Rekap Absensi via WhatsApp',
    retries: 3,
    // v4 trigger signature
    triggers: [{ event: 'absensi/send-recap' }]
  },
  async ({ event, step }) => {
    const result = await step.run('process-and-send', async () => {
      return sendAbsensiRecap();
    });

    return {
      success: true,
      sent: result.sent,
      failed: result.failed,
      triggeredAt: event?.data?.triggeredAt,
    };
  }
);
