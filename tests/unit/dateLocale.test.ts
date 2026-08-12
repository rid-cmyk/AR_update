import { describe, it, expect } from 'vitest';
import { getTodayLabels, formatNumber, formatDateLong } from '@/lib/utils/dateLocale';

describe('dateLocale', () => {
  describe('getTodayLabels', () => {
    it('returns formatted masehi date in Indonesian locale', () => {
      const labels = getTodayLabels(new Date('2026-08-11T12:00:00'));
      expect(labels.masehi).toContain('2026');
      expect(labels.masehi).toMatch(/agustus/i);
    });

    it('returns hijri date in Indonesian locale', () => {
      const labels = getTodayLabels(new Date('2026-08-11T12:00:00'));
      expect(labels.hijri.trim()).toMatch(/^\d+ \w+ \d+( H)?$/);
    });

    it('returns short date format', () => {
      const labels = getTodayLabels(new Date('2026-08-11T12:00:00'));
      expect(labels.short).toMatch(/11 agustus 2026/i);
    });

    it('uses current date when no argument provided', () => {
      const now = getTodayLabels();
      const today = new Date();
      expect(now.short).toContain(String(today.getFullYear()));
    });
  });

  describe('formatDateLong', () => {
    it('memformat tanggal panjang dalam locale Indonesia', () => {
      expect(formatDateLong('2026-08-11')).toMatch(/11 agustus 2026/i);
    });

    it('menerima objek Date', () => {
      expect(formatDateLong(new Date('2026-08-11T12:00:00'))).toMatch(/11 agustus 2026/i);
    });
  });

  describe('formatNumber', () => {
    it('formats with id-ID thousands separator', () => {
      expect(formatNumber(1234567)).toBe('1.234.567');
    });

    it('formats zero as 0', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('handles negative numbers', () => {
      expect(formatNumber(-1500)).toBe('-1.500');
    });
  });
});
