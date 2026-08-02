import { describe, it, expect, vi } from 'vitest';
import {
  parsePrismaError,
  safeExecute,
  isNetworkError,
} from '@/lib/utils/errorRecovery';

describe('ErrorRecoveryUtility', () => {
  describe('parsePrismaError', () => {
    it('classifies P2002 as 409 duplicate data error in Indonesian', () => {
      const parsed = parsePrismaError({ code: 'P2002', meta: { target: ['username'] } });
      expect(parsed.status).toBe(409);
      expect(parsed.code).toBe('P2002');
      expect(parsed.message).toContain('duplikat');
    });

    it('classifies P2025 as 404 not found error in Indonesian', () => {
      const parsed = parsePrismaError({ code: 'P2025' });
      expect(parsed.status).toBe(404);
      expect(parsed.code).toBe('P2025');
      expect(parsed.message).toContain('tidak ditemukan');
    });

    it('classifies P1001 database connection timeout as 503 service unavailable', () => {
      const parsed = parsePrismaError({ code: 'P1001' });
      expect(parsed.status).toBe(503);
      expect(parsed.message).toContain('Koneksi ke database');
    });

    it('sanitizes unknown errors without leaking raw SQL details', () => {
      const parsed = parsePrismaError(new Error('SELECT * FROM users syntax error at line 1'));
      expect(parsed.status).toBe(500);
      expect(parsed.message).toBe('Terjadi kesalahan internal pada server.');
    });
  });

  describe('safeExecute', () => {
    it('returns original async result when operation succeeds', async () => {
      const result = await safeExecute(async () => 'success', 'fallback');
      expect(result).toBe('success');
    });

    it('returns fallback value and invokes onError when async operation throws', async () => {
      const onError = vi.fn();
      const result = await safeExecute(
        async () => {
          throw new Error('Database down');
        },
        'fallback_default',
        onError
      );

      expect(result).toBe('fallback_default');
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('isNetworkError', () => {
    it('detects timeout and fetch failure messages', () => {
      expect(isNetworkError(new Error('fetch failed'))).toBe(true);
      expect(isNetworkError(new Error('The operation was aborted due to timeout'))).toBe(true);
      expect(isNetworkError(new Error('Validation failed'))).toBe(false);
    });
  });
});
