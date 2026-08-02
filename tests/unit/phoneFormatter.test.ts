import { describe, it, expect } from 'vitest';
import {
  formatPhoneNumber,
  formatPhoneNumberDisplay,
  formatPhoneNumberForWhatsApp,
  validateIndonesianPhoneNumber,
  parseDisplayPhoneNumber,
} from '@/lib/utils/phoneFormatter';

describe('PhoneNumberFormatter', () => {
  describe('formatPhoneNumber', () => {
    it('formats local Indonesian number starting with 0 to +62 format', () => {
      const result = formatPhoneNumber('081234567890');
      expect(result).toBe('+6281234567890');
    });

    it('keeps existing 62 prefix and adds plus sign', () => {
      const result = formatPhoneNumber('6281234567890');
      expect(result).toBe('+6281234567890');
    });

    it('handles number without 0 or 62 prefix', () => {
      const result = formatPhoneNumber('81234567890');
      expect(result).toBe('+6281234567890');
    });

    it('returns empty string when input is empty', () => {
      expect(formatPhoneNumber('')).toBe('');
    });

    // PROVE-IT PATTERN: Bug reproduction test for typo where user enters 620... or +62 0...
    it('removes redundant zero after 62 country code (e.g., 620812... -> +62812...)', () => {
      const resultWithZero = formatPhoneNumber('62081234567890');
      expect(resultWithZero).toBe('+6281234567890');

      const resultWithPlusZero = formatPhoneNumber('+62 0812 3456 7890');
      expect(resultWithPlusZero).toBe('+6281234567890');
    });
  });

  describe('formatPhoneNumberDisplay', () => {
    it('formats +62 number into readable groups with spaces', () => {
      const result = formatPhoneNumberDisplay('081234567890');
      expect(result).toBe('+62 812 3456 7890');
    });
  });

  describe('formatPhoneNumberForWhatsApp', () => {
    it('returns numeric-only string starting with 62 without plus sign or spaces', () => {
      const result = formatPhoneNumberForWhatsApp('+62 812 3456 7890');
      expect(result).toBe('6281234567890');
    });
  });

  describe('validateIndonesianPhoneNumber', () => {
    it('returns true for valid Indonesian phone numbers (11-13 digits after 62)', () => {
      expect(validateIndonesianPhoneNumber('08123456789')).toBe(true);
      expect(validateIndonesianPhoneNumber('081234567890')).toBe(true);
      expect(validateIndonesianPhoneNumber('6281234567890')).toBe(true);
    });

    it('returns false for invalid or too short phone numbers', () => {
      expect(validateIndonesianPhoneNumber('0812')).toBe(false);
      expect(validateIndonesianPhoneNumber('')).toBe(false);
    });
  });

  describe('parseDisplayPhoneNumber', () => {
    it('parses formatted display number back to E.164 storage format', () => {
      const result = parseDisplayPhoneNumber('+62 812 3456 7890');
      expect(result).toBe('+6281234567890');
    });
  });
});
