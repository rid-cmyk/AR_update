import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isLockedOut,
  recordFailedAttempt,
  recordSuccessfulLogin,
  getAttemptCount,
  formatRemainingTime,
  getLockoutMessage,
  shouldClearLockout,
} from '@/lib/utils/rateLimiter';

describe('RateLimiter', () => {
  const TEST_ID = 'test_user_id';

  beforeEach(() => {
    // Mock localStorage in Node environment
    const storage: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage[key] || null,
      setItem: (key: string, val: string) => { storage[key] = val; },
      removeItem: (key: string) => { delete storage[key]; },
    });
    vi.stubGlobal('window', {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('attempt tracking and lockout', () => {
    it('starts with zero attempts and unlocked status', () => {
      expect(getAttemptCount(TEST_ID)).toBe(0);
      expect(isLockedOut(TEST_ID).locked).toBe(false);
    });

    it('increments failed attempts without locking before reaching 10 attempts', () => {
      const result = recordFailedAttempt(TEST_ID);
      expect(result.attempts).toBe(1);
      expect(result.isLocked).toBe(false);
      expect(isLockedOut(TEST_ID).locked).toBe(false);
    });

    it('locks out user upon reaching 10 failed attempts', () => {
      for (let i = 0; i < 9; i++) {
        recordFailedAttempt(TEST_ID);
      }
      const tenthAttempt = recordFailedAttempt(TEST_ID);
      expect(tenthAttempt.attempts).toBe(10);
      expect(tenthAttempt.isLocked).toBe(true);
      expect(tenthAttempt.remainingTime).toBeGreaterThan(0);
      expect(isLockedOut(TEST_ID).locked).toBe(true);
    });

    it('resets attempts when successful login is recorded', () => {
      recordFailedAttempt(TEST_ID);
      recordFailedAttempt(TEST_ID);
      recordSuccessfulLogin(TEST_ID);
      expect(getAttemptCount(TEST_ID)).toBe(0);
      expect(isLockedOut(TEST_ID).locked).toBe(false);
    });
  });

  describe('formatRemainingTime', () => {
    it('formats seconds under one minute', () => {
      expect(formatRemainingTime(45)).toBe('45 detik');
    });

    it('formats exact minutes without remainder seconds', () => {
      expect(formatRemainingTime(120)).toBe('2 menit');
    });

    it('formats minutes and remaining seconds', () => {
      expect(formatRemainingTime(90)).toBe('1 menit 30 detik');
    });
  });

  describe('getLockoutMessage', () => {
    it('returns Indonesian lockout warning message with formatted remaining time', () => {
      const message = getLockoutMessage(10, 30);
      expect(message).toContain('Terlalu banyak percobaan login yang gagal');
      expect(message).toContain('30 detik');
    });
  });

  describe('shouldClearLockout', () => {
    it('returns false when lockout has not expired', () => {
      for (let i = 0; i < 10; i++) {
        recordFailedAttempt(TEST_ID);
      }
      expect(shouldClearLockout(TEST_ID)).toBe(false);
    });
  });
});
