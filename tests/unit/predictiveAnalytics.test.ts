import { describe, it, expect } from 'vitest';
import {
  calculatePerJuzKKMStatus,
  calculateHafalanVelocity,
  predictCompletionAndRisk,
} from '@/lib/services/predictiveAnalytics';

describe('Predictive Analytics Domain Service', () => {
  describe('calculatePerJuzKKMStatus', () => {
    it('returns default empty result for null, undefined, or empty scores', () => {
      const resNull = calculatePerJuzKKMStatus(null);
      expect(resNull.juzScores).toEqual([]);
      expect(resNull.remedialJuzList).toEqual([]);
      expect(resNull.isAllLulus).toBe(true);
      expect(resNull.averageScore).toBe(0);

      const resUndef = calculatePerJuzKKMStatus(undefined);
      expect(resUndef.juzScores).toEqual([]);
      expect(resUndef.remedialJuzList).toEqual([]);
      expect(resUndef.isAllLulus).toBe(true);
      expect(resUndef.averageScore).toBe(0);

      const resEmpty = calculatePerJuzKKMStatus({});
      expect(resEmpty.juzScores).toEqual([]);
      expect(resEmpty.remedialJuzList).toEqual([]);
      expect(resEmpty.isAllLulus).toBe(true);
      expect(resEmpty.averageScore).toBe(0);
    });

    it('identifies juz with score strictly less than default KKM (80) as remedial required', () => {
      const scores = { 1: 85, 2: 75, 3: 90, 4: 65 };
      const res = calculatePerJuzKKMStatus(scores);

      expect(res.isAllLulus).toBe(false);
      expect(res.remedialJuzList).toEqual([2, 4]);
      expect(res.juzScores).toHaveLength(4);

      const juz2 = res.juzScores.find((j) => j.juz === 2);
      expect(juz2).toEqual({
        juz: 2,
        score: 75,
        isRemedial: true,
        status: 'REMEDIAL_REQUIRED',
      });

      const juz1 = res.juzScores.find((j) => j.juz === 1);
      expect(juz1).toEqual({
        juz: 1,
        score: 85,
        isRemedial: false,
        status: 'LULUS',
      });

      expect(res.averageScore).toBe(78.75);
    });

    it('treats score equal to exact KKM (80) as LULUS (not remedial)', () => {
      const scores = { 1: 80, 2: 80.0 };
      const res = calculatePerJuzKKMStatus(scores, 80);

      expect(res.isAllLulus).toBe(true);
      expect(res.remedialJuzList).toEqual([]);
      expect(res.juzScores[0].isRemedial).toBe(false);
      expect(res.juzScores[0].status).toBe('LULUS');
      expect(res.juzScores[1].isRemedial).toBe(false);
      expect(res.juzScores[1].status).toBe('LULUS');
    });

    it('treats score slightly below KKM (79.9) as REMEDIAL_REQUIRED', () => {
      const scores = { 1: 79.9 };
      const res = calculatePerJuzKKMStatus(scores, 80);

      expect(res.isAllLulus).toBe(false);
      expect(res.remedialJuzList).toEqual([1]);
      expect(res.juzScores[0].isRemedial).toBe(true);
      expect(res.juzScores[0].status).toBe('REMEDIAL_REQUIRED');
    });

    it('respects custom KKM threshold when provided', () => {
      const scores = { 1: 75, 2: 68 };
      const res = calculatePerJuzKKMStatus(scores, 70); // KKM = 70

      expect(res.isAllLulus).toBe(false);
      expect(res.remedialJuzList).toEqual([2]); // 75 >= 70, 68 < 70
      expect(res.juzScores[0].status).toBe('LULUS');
      expect(res.juzScores[1].status).toBe('REMEDIAL_REQUIRED');
    });

    it('sorts juz numbers numerically ascending', () => {
      const scores = { 30: 90, 1: 85, 15: 70, 2: 88 };
      const res = calculatePerJuzKKMStatus(scores);

      expect(res.juzScores.map((item) => item.juz)).toEqual([1, 2, 15, 30]);
    });

    it('handles undefined, null, and NaN values in scores object without returning NaN averageScore', () => {
      const scores = { 1: 85, 2: null as any, 3: undefined as any, 4: NaN as any };
      const res = calculatePerJuzKKMStatus(scores);

      expect(isNaN(res.averageScore)).toBe(false);
      expect(res.averageScore).toBe(21.25); // (85 + 0 + 0 + 0) / 4
      expect(res.isAllLulus).toBe(false);
      expect(res.remedialJuzList).toEqual([2, 3, 4]);
    });
  });

  describe('calculateHafalanVelocity', () => {
    const refDate = '2026-08-01T00:00:00Z';

    it('returns 0 velocity for empty, null, or undefined setoran list', () => {
      const res1 = calculateHafalanVelocity([], 30, refDate);
      expect(res1.dailyVelocityAyat).toBe(0);
      expect(res1.weeklyVelocityAyat).toBe(0);
      expect(res1.totalZiyadahAyat).toBe(0);
      expect(res1.activeDays).toBe(0);
      expect(res1.windowDays).toBe(30);

      const res2 = calculateHafalanVelocity(null, 30, refDate);
      expect(res2.dailyVelocityAyat).toBe(0);

      const res3 = calculateHafalanVelocity(undefined, 30, refDate);
      expect(res3.dailyVelocityAyat).toBe(0);
    });

    it('calculates daily and weekly velocity correctly over 30-day window', () => {
      const setoranList = [
        { tanggal: '2026-07-30T00:00:00Z', jumlahAyat: 15, status: 'ziyadah' },
        { tanggal: '2026-07-25T00:00:00Z', jumlahAyat: 15, status: 'ziyadah' },
        { tanggal: '2026-07-20T00:00:00Z', jumlahAyat: 30, status: 'ziyadah' },
      ];

      const res = calculateHafalanVelocity(setoranList, 30, refDate);
      expect(res.totalZiyadahAyat).toBe(60);
      expect(res.activeDays).toBe(3);
      expect(res.dailyVelocityAyat).toBe(2.0); // 60 / 30
      expect(res.weeklyVelocityAyat).toBe(14.0); // 2.0 * 7
    });

    it('handles single (1) setoran record gracefully', () => {
      const setoranList = [
        { tanggal: '2026-07-31T00:00:00Z', jumlahAyat: 30, status: 'ziyadah' },
      ];

      const res = calculateHafalanVelocity(setoranList, 30, refDate);
      expect(res.totalZiyadahAyat).toBe(30);
      expect(res.activeDays).toBe(1);
      expect(res.dailyVelocityAyat).toBe(1.0); // 30 / 30
      expect(res.weeklyVelocityAyat).toBe(7.0);
    });

    it('combines multiple setoran entries on the same date into a single active day', () => {
      const setoranList = [
        { tanggal: '2026-07-30T08:00:00Z', jumlahAyat: 10, status: 'ziyadah' },
        { tanggal: '2026-07-30T16:00:00Z', jumlahAyat: 20, status: 'ziyadah' },
      ];

      const res = calculateHafalanVelocity(setoranList, 30, refDate);
      expect(res.totalZiyadahAyat).toBe(30);
      expect(res.activeDays).toBe(1);
      expect(res.dailyVelocityAyat).toBe(1.0);
    });

    it('filters out non-ziyadah setoran (e.g. murojaah) when status is specified', () => {
      const setoranList = [
        { tanggal: '2026-07-30T00:00:00Z', jumlahAyat: 20, status: 'ziyadah' },
        { tanggal: '2026-07-29T00:00:00Z', jumlahAyat: 100, status: 'murojaah' },
      ];

      const res = calculateHafalanVelocity(setoranList, 30, refDate);
      expect(res.totalZiyadahAyat).toBe(20);
      expect(res.activeDays).toBe(1);
    });

    it('handles untrimmed and mixed-case status string like " Ziyadah "', () => {
      const setoranList = [
        { tanggal: '2026-07-30T00:00:00Z', jumlahAyat: 10, status: ' Ziyadah ' },
        { tanggal: '2026-07-29T00:00:00Z', jumlahAyat: 15, status: 'ZIYADAH\n' },
      ];

      const res = calculateHafalanVelocity(setoranList, 30, refDate);
      expect(res.totalZiyadahAyat).toBe(25);
      expect(res.activeDays).toBe(2);
    });

    it('guards against jumlahAyat = NaN or Infinity and daysWindow = NaN', () => {
      const setoranList = [
        { tanggal: '2026-07-30T00:00:00Z', jumlahAyat: NaN },
        { tanggal: '2026-07-29T00:00:00Z', jumlahAyat: Infinity },
        { tanggal: '2026-07-28T00:00:00Z', jumlahAyat: 30, status: 'ziyadah' },
      ];

      const res = calculateHafalanVelocity(setoranList, NaN, refDate);
      expect(isNaN(res.dailyVelocityAyat)).toBe(false);
      expect(res.totalZiyadahAyat).toBe(30);
      expect(res.windowDays).toBe(30);
      expect(res.dailyVelocityAyat).toBe(1.0);
    });

    it('handles invalid referenceDate gracefully by returning 0 velocity without crashing', () => {
      const setoranList = [
        { tanggal: '2026-07-30T00:00:00Z', jumlahAyat: 10, status: 'ziyadah' },
      ];

      const res = calculateHafalanVelocity(setoranList, 30, 'invalid-date');
      expect(res.dailyVelocityAyat).toBe(0);
      expect(res.totalZiyadahAyat).toBe(0);
    });

    it('includes setoran when status is omitted or undefined', () => {
      const setoranList = [
        { tanggal: '2026-07-30T00:00:00Z', jumlahAyat: 25 },
      ];

      const res = calculateHafalanVelocity(setoranList, 30, refDate);
      expect(res.totalZiyadahAyat).toBe(25);
      expect(res.activeDays).toBe(1);
    });

    it('filters out setoran outside the historical window', () => {
      const setoranList = [
        { tanggal: '2026-07-30T00:00:00Z', jumlahAyat: 20, status: 'ziyadah' },
        { tanggal: '2026-05-01T00:00:00Z', jumlahAyat: 100, status: 'ziyadah' }, // > 30 days old
      ];

      const res = calculateHafalanVelocity(setoranList, 30, refDate);
      expect(res.totalZiyadahAyat).toBe(20);
    });

    it('supports custom windowDays (e.g. 7 days)', () => {
      const setoranList = [
        { tanggal: '2026-07-30T00:00:00Z', jumlahAyat: 14, status: 'ziyadah' },
      ];

      const res = calculateHafalanVelocity(setoranList, 7, refDate);
      expect(res.windowDays).toBe(7);
      expect(res.totalZiyadahAyat).toBe(14);
      expect(res.dailyVelocityAyat).toBe(2.0); // 14 / 7
      expect(res.weeklyVelocityAyat).toBe(14.0);
    });
  });

  describe('predictCompletionAndRisk', () => {
    const refDate = new Date('2026-08-01T00:00:00Z');

    it('returns COMPLETED status when current progress reaches or exceeds target', () => {
      const resExact = predictCompletionAndRisk(6236, 6236, 10, '2026-12-31', refDate);
      expect(resExact.remainingAyat).toBe(0);
      expect(resExact.estimatedDays).toBe(0);
      expect(resExact.riskStatus).toBe('COMPLETED');
      expect(resExact.daysDelayed).toBe(0);

      const resExceed = predictCompletionAndRisk(6300, 6236, 10, '2026-12-31', refDate);
      expect(resExceed.remainingAyat).toBe(0);
      expect(resExceed.riskStatus).toBe('COMPLETED');
    });

    it('returns INSUFFICIENT_DATA when daily velocity is 0, negative, or NaN', () => {
      const resZero = predictCompletionAndRisk(100, 1000, 0, '2026-12-31', refDate);
      expect(resZero.remainingAyat).toBe(900);
      expect(resZero.estimatedDays).toBe(Infinity);
      expect(resZero.estimatedCompletionDate).toBeNull();
      expect(resZero.riskStatus).toBe('INSUFFICIENT_DATA');
      expect(resZero.daysDelayed).toBe(0);

      const resNeg = predictCompletionAndRisk(100, 1000, -5, '2026-12-31', refDate);
      expect(resNeg.riskStatus).toBe('INSUFFICIENT_DATA');

      const resNaN = predictCompletionAndRisk(100, 1000, NaN, '2026-12-31', refDate);
      expect(resNaN.riskStatus).toBe('INSUFFICIENT_DATA');
    });

    it('classifies ON_TRACK when estimated completion date is before or on deadline', () => {
      // Remaining: 300 ayat. Velocity: 10 ayat/day. Days needed: 30 days -> Aug 31, 2026.
      // Deadline: Dec 31, 2026 -> ON_TRACK
      const res = predictCompletionAndRisk(700, 1000, 10, '2026-12-31T00:00:00Z', refDate);

      expect(res.remainingAyat).toBe(300);
      expect(res.estimatedDays).toBe(30);
      expect(res.riskStatus).toBe('ON_TRACK');
      expect(res.daysDelayed).toBe(0);
      expect(res.estimatedCompletionDate?.toISOString()).toContain('2026-08-31');
    });

    it('classifies AT_RISK when estimated completion date exceeds deadline', () => {
      // Remaining: 300 ayat. Velocity: 5 ayat/day. Days needed: 60 days -> Sep 30, 2026.
      // Deadline: Aug 15, 2026 -> AT_RISK (delayed by ~46 days)
      const res = predictCompletionAndRisk(700, 1000, 5, '2026-08-15T00:00:00Z', refDate);

      expect(res.remainingAyat).toBe(300);
      expect(res.estimatedDays).toBe(60);
      expect(res.riskStatus).toBe('AT_RISK');
      expect(res.daysDelayed).toBeGreaterThan(0);
    });

    it('handles near-zero velocity date overflow without returning Invalid Date or false ON_TRACK', () => {
      const res = predictCompletionAndRisk(0, 6000, 0.0000000001, '2026-12-31', refDate);

      expect(res.estimatedCompletionDate).not.toBeNull();
      expect(isNaN(res.estimatedCompletionDate!.getTime())).toBe(false);
      expect(res.riskStatus).toBe('AT_RISK');
      expect(res.daysDelayed).toBeGreaterThan(0);
    });

    it('handles invalid referenceDate inputs gracefully', () => {
      const res = predictCompletionAndRisk(500, 1000, 10, '2026-12-31', 'invalid-date');

      expect(res.estimatedCompletionDate).not.toBeNull();
      expect(isNaN(res.estimatedCompletionDate!.getTime())).toBe(false);
      expect(res.riskStatus).toBe('ON_TRACK');
    });

    it('handles empty, null, or undefined target deadline by classifying as ON_TRACK', () => {
      const resNull = predictCompletionAndRisk(500, 1000, 10, null, refDate);
      expect(resNull.remainingAyat).toBe(500);
      expect(resNull.estimatedDays).toBe(50);
      expect(resNull.riskStatus).toBe('ON_TRACK');
      expect(resNull.daysDelayed).toBe(0);
      expect(resNull.estimatedCompletionDate).not.toBeNull();

      const resEmptyStr = predictCompletionAndRisk(500, 1000, 10, '', refDate);
      expect(resEmptyStr.riskStatus).toBe('ON_TRACK');

      const resUndef = predictCompletionAndRisk(500, 1000, 10, undefined, refDate);
      expect(resUndef.riskStatus).toBe('ON_TRACK');
    });

    it('handles invalid date strings gracefully', () => {
      const res = predictCompletionAndRisk(500, 1000, 10, 'invalid-date-string', refDate);
      expect(res.riskStatus).toBe('ON_TRACK');
      expect(res.daysDelayed).toBe(0);
    });
  });
});

