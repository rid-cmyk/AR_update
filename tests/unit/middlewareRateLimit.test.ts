import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, rateLimitHeaders } from '../../middleware';

describe('middleware rate limiting', () => {
  beforeEach(() => {
    // key unik per test agar tidak terpengaruh state Map antar test
  });

  it('allows requests under the limit and decrements remaining', () => {
    const key = `test-allow-${Math.random()}`;
    const first = checkRateLimit(key, 3, 60_000);
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(2);

    const second = checkRateLimit(key, 3, 60_000);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(1);
  });

  it('blocks requests over the limit with resetSeconds >= 1', () => {
    const key = `test-block-${Math.random()}`;
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key, 5, 60_000);
    }
    const blocked = checkRateLimit(key, 5, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetSeconds).toBeGreaterThanOrEqual(1);
  });

  it('resets after the window expires', () => {
    const key = `test-window-${Math.random()}`;
    for (let i = 0; i < 2; i++) {
      checkRateLimit(key, 2, 10);
    }
    expect(checkRateLimit(key, 2, 10).allowed).toBe(false);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const afterWindow = checkRateLimit(key, 2, 10);
        expect(afterWindow.allowed).toBe(true);
        resolve();
      }, 15);
    });
  });

  describe('rateLimitHeaders', () => {
    it('includes X-RateLimit-* headers on allowed results without Retry-After', () => {
      const headers = rateLimitHeaders({ allowed: true, remaining: 42, resetSeconds: 30 }, 100);
      expect(headers['X-RateLimit-Limit']).toBe('100');
      expect(headers['X-RateLimit-Remaining']).toBe('42');
      expect(headers['X-RateLimit-Reset']).toBe(String(Math.floor(Date.now() / 1000) + 30));
      expect(headers['Retry-After']).toBeUndefined();
    });

    it('adds Retry-After on blocked results', () => {
      const headers = rateLimitHeaders({ allowed: false, remaining: 0, resetSeconds: 17 }, 5);
      expect(headers['Retry-After']).toBe('17');
      expect(headers['X-RateLimit-Limit']).toBe('5');
    });
  });
});
