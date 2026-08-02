import { describe, it, expect } from 'vitest';
import { ValidationHelpers } from '@/lib/api-helpers';

describe('ValidationHelpers', () => {
  describe('isValidDate', () => {
    it('returns true for valid ISO date strings', () => {
      expect(ValidationHelpers.isValidDate('2026-08-02')).toBe(true);
      expect(ValidationHelpers.isValidDate('2026-08-02T10:00:00Z')).toBe(true);
    });

    it('returns false for clearly invalid date text', () => {
      expect(ValidationHelpers.isValidDate('not-a-date')).toBe(false);
    });

    // BUG REPRODUCTION TEST: null, empty string '', or non-string should return false!
    it('returns false for null, undefined, empty string, or boolean (proving runtime safety)', () => {
      expect(ValidationHelpers.isValidDate(null as unknown as string)).toBe(false);
      expect(ValidationHelpers.isValidDate('' as unknown as string)).toBe(false);
      expect(ValidationHelpers.isValidDate(undefined as unknown as string)).toBe(false);
      expect(ValidationHelpers.isValidDate(true as unknown as string)).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('returns true for standard email format', () => {
      expect(ValidationHelpers.isValidEmail('test@example.com')).toBe(true);
    });

    it('returns false for malformed emails or empty string', () => {
      expect(ValidationHelpers.isValidEmail('invalid-email')).toBe(false);
      expect(ValidationHelpers.isValidEmail('')).toBe(false);
      expect(ValidationHelpers.isValidEmail(null as unknown as string)).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('trims whitespace and removes HTML tags', () => {
      expect(ValidationHelpers.sanitizeString('  <script>alert("xss")</script>  ')).toBe('scriptalert("xss")/script');
    });

    // BUG REPRODUCTION TEST: null or undefined should return empty string instead of throwing TypeError
    it('handles null, undefined, or number inputs gracefully without crashing', () => {
      expect(ValidationHelpers.sanitizeString(null as unknown as string)).toBe('');
      expect(ValidationHelpers.sanitizeString(undefined as unknown as string)).toBe('');
      expect(ValidationHelpers.sanitizeString(12345 as unknown as string)).toBe('12345');
    });
  });
});
