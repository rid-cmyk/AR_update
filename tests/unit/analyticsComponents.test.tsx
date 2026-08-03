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

describe('Analytics UI Components (Milestone 3)', () => {
  describe('VelocityPredictionCard', () => {
    const mockVelocity: HafalanVelocityResult = {
      dailyVelocityAyat: 12.5,
      weeklyVelocityAyat: 87.5,
      totalZiyadahAyat: 375,
      activeDays: 25,
      windowDays: 30,
    };

    const mockPredictionOnTrack: CompletionPredictionResult = {
      remainingAyat: 100,
      estimatedDays: 8,
      estimatedCompletionDate: new Date('2026-08-15T00:00:00.000Z'),
      riskStatus: 'ON_TRACK',
      daysDelayed: 0,
    };

    const mockPredictionAtRisk: CompletionPredictionResult = {
      remainingAyat: 300,
      estimatedDays: 24,
      estimatedCompletionDate: new Date('2026-08-30T00:00:00.000Z'),
      riskStatus: 'AT_RISK',
      daysDelayed: 10,
    };

    const mockPredictionCompleted: CompletionPredictionResult = {
      remainingAyat: 0,
      estimatedDays: 0,
      estimatedCompletionDate: new Date('2026-08-01T00:00:00.000Z'),
      riskStatus: 'COMPLETED',
      daysDelayed: 0,
    };

    const mockPredictionInsufficientData: CompletionPredictionResult = {
      remainingAyat: 200,
      estimatedDays: Infinity,
      estimatedCompletionDate: null,
      riskStatus: 'INSUFFICIENT_DATA',
      daysDelayed: 0,
    };

    const mockActiveTarget = {
      id: 1,
      surat: 'Al-Baqarah',
      ayatTarget: 286,
      deadline: '2026-08-20T00:00:00.000Z',
      status: 'proses',
    };

    it('renders ON_TRACK velocity statistics and status tag', () => {
      const html = renderToStaticMarkup(
        React.createElement(VelocityPredictionCard, {
          velocity: mockVelocity,
          prediction: mockPredictionOnTrack,
          activeTarget: mockActiveTarget,
        })
      );

      expect(html).toContain('Prediksi &amp; Kecepatan Hafalan');
      expect(html).toContain('SESUAI JADWAL');
      expect(html).toContain('Al-Baqarah');
      expect(html).toContain('Progres Sesuai Jadwal');
      expect(html).toContain('Kecepatan Harian');
      expect(html).toContain('Proyeksi Mingguan');
    });

    it('renders AT_RISK status tag and alert warning when delayed', () => {
      const html = renderToStaticMarkup(
        React.createElement(VelocityPredictionCard, {
          velocity: mockVelocity,
          prediction: mockPredictionAtRisk,
          activeTarget: mockActiveTarget,
        })
      );

      expect(html).toContain('BERISIKO TERLAMBAT');
      expect(html).toContain('10 HARI');
      expect(html).toContain('Peringatan Terlambat');
    });

    it('renders COMPLETED status when target reached', () => {
      const html = renderToStaticMarkup(
        React.createElement(VelocityPredictionCard, {
          velocity: mockVelocity,
          prediction: mockPredictionCompleted,
          activeTarget: mockActiveTarget,
        })
      );

      expect(html).toContain('TARGET SELESAI');
      expect(html).toContain('Target Tuntas');
    });

    it('renders INSUFFICIENT_DATA status tag when zero velocity', () => {
      const html = renderToStaticMarkup(
        React.createElement(VelocityPredictionCard, {
          velocity: {
            dailyVelocityAyat: 0,
            weeklyVelocityAyat: 0,
            totalZiyadahAyat: 0,
            activeDays: 0,
            windowDays: 30,
          },
          prediction: mockPredictionInsufficientData,
          activeTarget: mockActiveTarget,
        })
      );

      expect(html).toContain('DATA BELUM CUKUP');
      expect(html).toContain('Data Belum Cukup');
    });

    it('handles null activeTarget gracefully', () => {
      const html = renderToStaticMarkup(
        React.createElement(VelocityPredictionCard, {
          velocity: mockVelocity,
          prediction: mockPredictionOnTrack,
          activeTarget: null,
        })
      );

      expect(html).toContain('Santri belum memiliki target hafalan aktif');
    });
  });

  describe('PerJuzAnalyticsChart', () => {
    const mockScores: JuzKKMItem[] = [
      { juz: 1, score: 85, isRemedial: false, status: 'LULUS' },
      { juz: 2, score: 72, isRemedial: true, status: 'REMEDIAL_REQUIRED' },
      { juz: 3, score: 90, isRemedial: false, status: 'LULUS' },
    ];

    it('renders skeleton loading state prior to client mount', () => {
      const html = renderToStaticMarkup(
        React.createElement(PerJuzAnalyticsChart, {
          juzScores: mockScores,
          loading: true,
        })
      );

      expect(html).toContain('ant-skeleton');
    });

    it('renders chart component card container props correctly', () => {
      const html = renderToStaticMarkup(
        React.createElement(PerJuzAnalyticsChart, {
          juzScores: mockScores,
          kkmThreshold: 80,
          averageScore: 82.33,
          remedialJuzList: [2],
          loading: false,
        })
      );

      // In server render static markup prior to useEffect mount hydration check, returns skeleton card
      expect(html).toContain('ant-card');
    });
  });

  describe('StudentAnalyticsTab', () => {
    it('renders container structure with fallback loading skeleton', () => {
      const html = renderToStaticMarkup(
        React.createElement(StudentAnalyticsTab, {
          santriId: 1,
          santriName: 'Ahmad Fulan',
        })
      );

      expect(html).toContain('ant-skeleton');
    });
  });
});
