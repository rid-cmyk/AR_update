import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  checkForgotPasscodeCooldown,
  recordForgotPasscodeAttempt,
  resetForgotPasscodeAttempts,
} from '@/lib/utils/forgotPasscodeCooldown';

describe('ForgotPasscodeCooldown', () => {
  let KEY: string;
  let keyCounter = 0;

  beforeEach(() => {
    vi.resetModules();
    KEY = `key-${keyCounter++}`;
  });

  describe('10 percobaan pertama bebas', () => {
    it('tidak terkunci sebelum melewati 10 percobaan', () => {
      for (let i = 0; i < 10; i++) {
        const result = recordForgotPasscodeAttempt(KEY);
        expect(result.locked).toBe(false);
        expect(result.lockoutMs).toBe(0);
      }
      expect(checkForgotPasscodeCooldown(KEY).locked).toBe(false);
    });

    it('percobaan ke-11 mulai menambah waktu 1 menit', () => {
      for (let i = 0; i < 10; i++) {
        recordForgotPasscodeAttempt(KEY);
      }
      const eleventh = recordForgotPasscodeAttempt(KEY);
      expect(eleventh.locked).toBe(true);
      expect(eleventh.lockoutMs).toBe(60 * 1000);
      expect(checkForgotPasscodeCooldown(KEY).locked).toBe(true);
      expect(checkForgotPasscodeCooldown(KEY).remainingMs).toBe(60 * 1000);
    });

    it('setiap percobaan ekstra menambah 1 menit lagi', () => {
      for (let i = 0; i < 12; i++) {
        recordForgotPasscodeAttempt(KEY);
      }
      const thirteenth = recordForgotPasscodeAttempt(KEY);
      expect(thirteenth.lockoutMs).toBe(3 * 60 * 1000);
    });
  });

  describe('reset', () => {
    it('reset saat resetForgotPasscodeAttempts dipanggil', () => {
      for (let i = 0; i < 15; i++) {
        recordForgotPasscodeAttempt(KEY);
      }
      resetForgotPasscodeAttempts(KEY);
      expect(checkForgotPasscodeCooldown(KEY).locked).toBe(false);
      expect(checkForgotPasscodeCooldown(KEY).remainingMs).toBe(0);
    });
  });

  describe('isolasi per key', () => {
    it('cooldown nomor lain tidak terpengaruh', () => {
      for (let i = 0; i < 12; i++) {
        recordForgotPasscodeAttempt(KEY);
      }
      expect(checkForgotPasscodeCooldown('phone-2|ip-1').locked).toBe(false);
    });
  });
});
