import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  sendWhatsAppMessage,
  resetConfigCache,
} from '@/lib/services/whatsapp';

describe('WhatsAppService - Error Recovery & Resiliency', () => {
  beforeEach(() => {
    resetConfigCache();
    vi.stubEnv('WHATSAPP_API_KEY', 'test-key');
    vi.stubEnv('WHATSAPP_SESSION_ID', 'test-session');
    vi.stubEnv('WHATSAPP_API_URL', 'https://api.test.org/send');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('returns false immediately when phone number is invalid or too short', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const result = await sendWhatsAppMessage('123', 'Hello');
    expect(result).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('handles HTML 502/504 Bad Gateway responses safely without throwing SyntaxError', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 502,
      text: async () => '<html>502 Bad Gateway</html>',
      json: async () => {
        throw new SyntaxError('Unexpected token < in JSON at position 0');
      },
    } as unknown as Response);

    const result = await sendWhatsAppMessage('081234567890', 'Test message');
    expect(result).toBe(false);
  });

  it('handles network timeouts or fetch rejections gracefully without unhandled crashes', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('The operation was aborted due to timeout'));

    const result = await sendWhatsAppMessage('081234567890', 'Test message');
    expect(result).toBe(false);
  });
});
