import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  PerJuzAnalyticsChart,
  VelocityPredictionCard,
  StudentAnalyticsTab,
} from '@/components/analytics';
import {
  HafalanVelocityResult,
  CompletionPredictionResult,
  JuzKKMItem,
} from '@/lib/services/predictiveAnalytics';

describe('Adversarial Stress Tests — components/analytics/ (Milestone 3)', () => {
  describe('PerJuzAnalyticsChart Extreme Values & Edge Cases', () => {
    it('1. Handles empty juzScores array gracefully without crashing', () => {
      const html = renderToStaticMarkup(
        React.createElement(PerJuzAnalyticsChart, {
          juzScores: [],
          loading: false,
        })
      );
      // In SSR / static markup prior to useEffect mount, returns hydration-safe skeleton card
      expect(html).toContain('ant-card');
      expect(html).toContain('ant-skeleton');
    });

    it('2. Handles scores with 0 and 100 correctly', () => {
      const scores: JuzKKMItem[] = [
        { juz: 1, score: 0, isRemedial: true, status: 'REMEDIAL_REQUIRED' },
        { juz: 2, score: 100, isRemedial: false, status: 'LULUS' },
      ];
      const html = renderToStaticMarkup(
        React.createElement(PerJuzAnalyticsChart, {
          juzScores: scores,
          kkmThreshold: 80,
          loading: false,
        })
      );
      expect(html).toContain('ant-card');
    });

    it('3. Handles invalid score numbers (NaN, negative, >100, null, undefined) without crashing', () => {
      const scoresWithEdgeCases: any[] = [
        { juz: 1, score: NaN, isRemedial: true, status: 'REMEDIAL_REQUIRED' },
        { juz: 2, score: -50, isRemedial: true, status: 'REMEDIAL_REQUIRED' },
        { juz: 3, score: 999, isRemedial: false, status: 'LULUS' },
        { juz: 4, score: null, isRemedial: true, status: 'REMEDIAL_REQUIRED' },
        { juz: 5, score: undefined, isRemedial: true, status: 'REMEDIAL_REQUIRED' },
      ];
      const html = renderToStaticMarkup(
        React.createElement(PerJuzAnalyticsChart, {
          juzScores: scoresWithEdgeCases,
          kkmThreshold: 80,
          loading: false,
        })
      );
      expect(html).toContain('ant-card');
    });

    it('4. Handles all remedial juz scores (100% remedial)', () => {
      const allRemedialScores: JuzKKMItem[] = [
        { juz: 1, score: 50, isRemedial: true, status: 'REMEDIAL_REQUIRED' },
        { juz: 2, score: 60, isRemedial: true, status: 'REMEDIAL_REQUIRED' },
        { juz: 3, score: 75, isRemedial: true, status: 'REMEDIAL_REQUIRED' },
      ];
      const html = renderToStaticMarkup(
        React.createElement(PerJuzAnalyticsChart, {
          juzScores: allRemedialScores,
          kkmThreshold: 80,
          remedialJuzList: [1, 2, 3],
          loading: false,
        })
      );
      expect(html).toContain('ant-card');
    });

    it('5. Handles zero remedial juz scores (100% pass)', () => {
      const noRemedialScores: JuzKKMItem[] = [
        { juz: 1, score: 85, isRemedial: false, status: 'LULUS' },
        { juz: 2, score: 90, isRemedial: false, status: 'LULUS' },
        { juz: 3, score: 95, isRemedial: false, status: 'LULUS' },
      ];
      const html = renderToStaticMarkup(
        React.createElement(PerJuzAnalyticsChart, {
          juzScores: noRemedialScores,
          kkmThreshold: 80,
          remedialJuzList: [],
          loading: false,
        })
      );
      expect(html).toContain('ant-card');
    });

    it('6. Handles explicit averageScore=0 and custom kkmThreshold', () => {
      const html = renderToStaticMarkup(
        React.createElement(PerJuzAnalyticsChart, {
          juzScores: [{ juz: 1, score: 0, isRemedial: true, status: 'REMEDIAL_REQUIRED' }],
          kkmThreshold: 75,
          averageScore: 0,
          loading: false,
        })
      );
      expect(html).toContain('ant-card');
    });

    it('7. Renders skeleton when loading=true', () => {
      const html = renderToStaticMarkup(
        React.createElement(PerJuzAnalyticsChart, {
          loading: true,
        })
      );
      expect(html).toContain('ant-skeleton');
    });

    it('8. Supports switching defaultChartType between "bar" and "line"', () => {
      const htmlLine = renderToStaticMarkup(
        React.createElement(PerJuzAnalyticsChart, {
          defaultChartType: 'line',
          loading: false,
        })
      );
      expect(htmlLine).toContain('ant-card');
    });
  });

  describe('VelocityPredictionCard Extreme Values & Edge Cases', () => {
    const baseActiveTarget = {
      id: 10,
      surat: 'An-Nisa',
      ayatTarget: 176,
      deadline: '2026-12-31T00:00:00.000Z',
      status: 'proses',
    };

    it('1. Handles 0 daily velocity', () => {
      const velocity: HafalanVelocityResult = {
        dailyVelocityAyat: 0,
        weeklyVelocityAyat: 0,
        totalZiyadahAyat: 0,
        activeDays: 0,
        windowDays: 30,
      };
      const prediction: CompletionPredictionResult = {
        remainingAyat: 176,
        estimatedDays: Infinity,
        estimatedCompletionDate: null,
        riskStatus: 'INSUFFICIENT_DATA',
        daysDelayed: 0,
      };

      const html = renderToStaticMarkup(
        React.createElement(VelocityPredictionCard, {
          velocity,
          prediction,
          activeTarget: baseActiveTarget,
        })
      );

      expect(html).toContain('DATA BELUM CUKUP');
      expect(html).toContain('ant-statistic-content-value-int">0</span>');
      expect(html).toContain('ant-statistic-content-value-decimal">.00</span>');
      expect(html).toContain('ayat/hari');
    });

    it('2. Handles huge daily velocity (10,000 ayat/hari)', () => {
      const velocity: HafalanVelocityResult = {
        dailyVelocityAyat: 10000,
        weeklyVelocityAyat: 70000,
        totalZiyadahAyat: 300000,
        activeDays: 30,
        windowDays: 30,
      };
      const prediction: CompletionPredictionResult = {
        remainingAyat: 50,
        estimatedDays: 1,
        estimatedCompletionDate: new Date('2026-08-03T00:00:00.000Z'),
        riskStatus: 'ON_TRACK',
        daysDelayed: 0,
      };

      const html = renderToStaticMarkup(
        React.createElement(VelocityPredictionCard, {
          velocity,
          prediction,
          activeTarget: baseActiveTarget,
        })
      );

      // Ant Design Statistic formats 10000 with thousands separator: 10,000
      expect(html).toContain('ant-statistic-content-value-int">10,000</span>');
      expect(html).toContain('ant-statistic-content-value-decimal">.00</span>');
      expect(html).toContain('SESUAI JADWAL');
    });

    it('3. Handles negative velocity values gracefully', () => {
      const velocity: HafalanVelocityResult = {
        dailyVelocityAyat: -5,
        weeklyVelocityAyat: -35,
        totalZiyadahAyat: -10,
        activeDays: 0,
        windowDays: 30,
      };
      const prediction: CompletionPredictionResult = {
        remainingAyat: 176,
        estimatedDays: Infinity,
        estimatedCompletionDate: null,
        riskStatus: 'INSUFFICIENT_DATA',
        daysDelayed: 0,
      };

      const html = renderToStaticMarkup(
        React.createElement(VelocityPredictionCard, {
          velocity,
          prediction,
          activeTarget: baseActiveTarget,
        })
      );

      expect(html).toContain('ant-statistic-content-value-int">-5</span>');
      expect(html).toContain('ant-statistic-content-value-decimal">.00</span>');
    });

    it('4. Handles missing or invalid target deadline gracefully', () => {
      const velocity: HafalanVelocityResult = {
        dailyVelocityAyat: 5,
        weeklyVelocityAyat: 35,
        totalZiyadahAyat: 150,
        activeDays: 20,
        windowDays: 30,
      };
      const prediction: CompletionPredictionResult = {
        remainingAyat: 50,
        estimatedDays: 10,
        estimatedCompletionDate: new Date('2026-08-12T00:00:00.000Z'),
        riskStatus: 'ON_TRACK',
        daysDelayed: 0,
      };

      // Test with null deadline
      const htmlNullDeadline = renderToStaticMarkup(
        React.createElement(VelocityPredictionCard, {
          velocity,
          prediction,
          activeTarget: { ...baseActiveTarget, deadline: null as any },
        })
      );
      expect(htmlNullDeadline).toContain('Belum ditentukan');

      // Test with invalid deadline string
      const htmlInvalidDeadline = renderToStaticMarkup(
        React.createElement(VelocityPredictionCard, {
          velocity,
          prediction,
          activeTarget: { ...baseActiveTarget, deadline: 'not-a-valid-date' },
        })
      );
      expect(htmlInvalidDeadline).toContain('Format tanggal tidak valid');
    });

    it('5. Handles prediction with null completion date, 0 remaining ayat, and 100% completed', () => {
      const velocity: HafalanVelocityResult = {
        dailyVelocityAyat: 10,
        weeklyVelocityAyat: 70,
        totalZiyadahAyat: 176,
        activeDays: 18,
        windowDays: 30,
      };

      // Null completion date
      const predictionNullDate: CompletionPredictionResult = {
        remainingAyat: 50,
        estimatedDays: 5,
        estimatedCompletionDate: null,
        riskStatus: 'ON_TRACK',
        daysDelayed: 0,
      };
      const htmlNullDate = renderToStaticMarkup(
        React.createElement(VelocityPredictionCard, {
          velocity,
          prediction: predictionNullDate,
          activeTarget: baseActiveTarget,
        })
      );
      expect(htmlNullDate).toContain('Belum ditentukan');

      // Zero remaining ayat / 100% completed
      const predictionCompleted: CompletionPredictionResult = {
        remainingAyat: 0,
        estimatedDays: 0,
        estimatedCompletionDate: new Date('2026-08-01T00:00:00.000Z'),
        riskStatus: 'COMPLETED',
        daysDelayed: 0,
      };
      const htmlCompleted = renderToStaticMarkup(
        React.createElement(VelocityPredictionCard, {
          velocity,
          prediction: predictionCompleted,
          activeTarget: baseActiveTarget,
        })
      );
      expect(htmlCompleted).toContain('TARGET SELESAI');
      expect(htmlCompleted).toContain('Target Tuntas');
    });

    it('6. Handles null / undefined velocity or prediction props without crashing', () => {
      const html = renderToStaticMarkup(
        React.createElement(VelocityPredictionCard, {
          velocity: null as any,
          prediction: null as any,
          activeTarget: null,
        })
      );

      expect(html).toContain('DATA BELUM CUKUP');
      expect(html).toContain('Santri belum memiliki target hafalan aktif');
    });

    it('7. Renders skeleton when loading=true', () => {
      const html = renderToStaticMarkup(
        React.createElement(VelocityPredictionCard, {
          velocity: { dailyVelocityAyat: 5, weeklyVelocityAyat: 35, totalZiyadahAyat: 100, activeDays: 10, windowDays: 30 },
          prediction: { remainingAyat: 50, estimatedDays: 10, estimatedCompletionDate: null, riskStatus: 'ON_TRACK', daysDelayed: 0 },
          activeTarget: baseActiveTarget,
          loading: true,
        })
      );
      expect(html).toContain('ant-skeleton');
    });
  });

  describe('StudentAnalyticsTab Extreme Cases', () => {
    it('1. Renders skeleton state during initial data fetch', () => {
      const html = renderToStaticMarkup(
        React.createElement(StudentAnalyticsTab, {
          santriId: 99,
          santriName: 'Test Santri',
        })
      );
      expect(html).toContain('ant-skeleton');
    });
  });
});
