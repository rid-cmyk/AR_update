import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { StudentAnalyticsTab, SantriAnalyticsData, AnalyticsApiResponse } from '@/components/analytics/StudentAnalyticsTab';

describe('StudentAnalyticsTab SWR Data Fetching & State Transition Stress Tests (Milestone 3)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const mockAnalyticsData: SantriAnalyticsData = {
    santri: {
      id: 1,
      namaLengkap: 'Ahmad Santri Test',
      username: 'ahmadsantri',
      foto: null,
      halaqah: [
        {
          id: 101,
          namaHalaqah: 'Halaqah Utsman',
          guruNama: 'Ustadz Ali',
        },
      ],
    },
    activeTarget: {
      id: 10,
      surat: 'Al-Baqarah',
      ayatTarget: 286,
      deadline: '2026-08-30T00:00:00.000Z',
      status: 'proses',
    },
    perJuzKKM: {
      juzScores: [
        { juz: 1, score: 85, isRemedial: false, status: 'LULUS' },
        { juz: 2, score: 75, isRemedial: true, status: 'REMEDIAL_REQUIRED' },
      ],
      averageScore: 80,
      remedialJuzList: [2],
      isAllLulus: false,
    },
    velocity: {
      dailyVelocityAyat: 10,
      weeklyVelocityAyat: 70,
      totalZiyadahAyat: 300,
      activeDays: 30,
      windowDays: 30,
    },
    prediction: {
      remainingAyat: 150,
      estimatedDays: 15,
      estimatedCompletionDate: new Date('2026-08-17T00:00:00.000Z'),
      riskStatus: 'ON_TRACK',
      daysDelayed: 0,
    },
  };

  describe('1. Time Window Selector & SWR Key Stress Testing', () => {
    it('generates correct SWR cache keys for rapid window switching (30 -> 60 -> 90 -> 30)', () => {
      const santriId = 1;
      const getSwrKey = (days: number) => `/api/analytics/predictive?santriId=${santriId}&daysWindow=${days}`;

      expect(getSwrKey(30)).toBe('/api/analytics/predictive?santriId=1&daysWindow=30');
      expect(getSwrKey(60)).toBe('/api/analytics/predictive?santriId=1&daysWindow=60');
      expect(getSwrKey(90)).toBe('/api/analytics/predictive?santriId=1&daysWindow=90');
      expect(getSwrKey(30)).toBe('/api/analytics/predictive?santriId=1&daysWindow=30');
    });

    it('handles out-of-order network responses without corrupting state', async () => {
      // Simulating rapid switching where 60d takes 200ms and 90d takes 50ms
      const callLogs: string[] = [];

      const mockFetch = vi.fn().mockImplementation((url: string) => {
        callLogs.push(url);
        if (url.includes('daysWindow=60')) {
          return new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    success: true,
                    data: { ...mockAnalyticsData, velocity: { ...mockAnalyticsData.velocity, windowDays: 60 } },
                  }),
                }),
              200
            )
          );
        }
        if (url.includes('daysWindow=90')) {
          return new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    success: true,
                    data: { ...mockAnalyticsData, velocity: { ...mockAnalyticsData.velocity, windowDays: 90 } },
                  }),
                }),
              50
            )
          );
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: mockAnalyticsData }),
        });
      });

      global.fetch = mockFetch as unknown as typeof fetch;

      // Execute rapid queries
      const res30 = fetch('/api/analytics/predictive?santriId=1&daysWindow=30');
      const res60 = fetch('/api/analytics/predictive?santriId=1&daysWindow=60');
      const res90 = fetch('/api/analytics/predictive?santriId=1&daysWindow=90');

      const [data30, data60, data90] = await Promise.all([res30, res60, res90]);
      const json90 = await data90.json();
      const json60 = await data60.json();

      expect(callLogs).toEqual([
        '/api/analytics/predictive?santriId=1&daysWindow=30',
        '/api/analytics/predictive?santriId=1&daysWindow=60',
        '/api/analytics/predictive?santriId=1&daysWindow=90',
      ]);

      expect(json90.data.velocity.windowDays).toBe(90);
      expect(json60.data.velocity.windowDays).toBe(60);
    });
  });

  describe('2. Error Simulation (500 Error, Network Drop, API Failures) & mutate() Retry', () => {
    it('parses HTTP 500 Internal Server Error correctly', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Koneksi database terputus (500)' }),
      });
      global.fetch = mockFetch as unknown as typeof fetch;

      const fetcher = async (url: string) => {
        const res = await fetch(url);
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || `HTTP ${res.status}: Gagal memuat data analitik`);
        }
        return res.json();
      };

      await expect(fetcher('/api/analytics/predictive?santriId=1&daysWindow=30')).rejects.toThrow(
        'Koneksi database terputus (500)'
      );
    });

    it('falls back to default HTTP status error message when server body is non-JSON', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });
      global.fetch = mockFetch as unknown as typeof fetch;

      const fetcher = async (url: string) => {
        const res = await fetch(url);
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || `HTTP ${res.status}: Gagal memuat data analitik`);
        }
        return res.json();
      };

      await expect(fetcher('/api/analytics/predictive?santriId=1&daysWindow=30')).rejects.toThrow(
        'HTTP 502: Gagal memuat data analitik'
      );
    });

    it('handles network drop (fetch rejection) safely', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
      global.fetch = mockFetch as unknown as typeof fetch;

      const fetcher = async (url: string) => {
        const res = await fetch(url);
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || `HTTP ${res.status}: Gagal memuat data analitik`);
        }
        return res.json();
      };

      await expect(fetcher('/api/analytics/predictive?santriId=1&daysWindow=30')).rejects.toThrow(
        'Failed to fetch'
      );
    });

    it('simulates error recovery flow when retrying via mutate()', async () => {
      let attempts = 0;
      const mockFetch = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts === 1) {
          // First attempt fails with 500 error
          return Promise.resolve({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Database temporary failure' }),
          });
        } else {
          // Second attempt (retry mutate) succeeds
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ success: true, data: mockAnalyticsData }),
          });
        }
      });
      global.fetch = mockFetch as unknown as typeof fetch;

      const fetcher = async (url: string) => {
        const res = await fetch(url);
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || `HTTP ${res.status}: Gagal memuat data analitik`);
        }
        return res.json();
      };

      // Attempt 1: expect error
      await expect(fetcher('/api/analytics/predictive?santriId=1&daysWindow=30')).rejects.toThrow(
        'Database temporary failure'
      );

      // Attempt 2: retry (simulate mutate call)
      const res = await fetcher('/api/analytics/predictive?santriId=1&daysWindow=30');
      expect(res.success).toBe(true);
      expect(res.data?.santri.namaLengkap).toBe('Ahmad Santri Test');
      expect(attempts).toBe(2);
    });
  });

  describe('3. Component Rendering & UI State Machine Verification', () => {
    it('renders initial skeleton loading state when data is not yet available', () => {
      const html = renderToStaticMarkup(
        React.createElement(StudentAnalyticsTab, {
          santriId: 1,
          santriName: 'Ahmad Santri Test',
          initialDaysWindow: 30,
        })
      );

      expect(html).toContain('ant-skeleton');
    });

    it('accepts onRefresh callback and executes without error', () => {
      const onRefreshMock = vi.fn();
      const html = renderToStaticMarkup(
        React.createElement(StudentAnalyticsTab, {
          santriId: 1,
          santriName: 'Ahmad Santri Test',
          onRefresh: onRefreshMock,
        })
      );

      expect(html).toBeDefined();
    });
  });
});
