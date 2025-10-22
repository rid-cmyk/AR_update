// 🔄 Hook untuk Progress Juz
// Custom hook untuk mengambil dan mengelola data progress hafalan per juz

'use client';

import { useState, useEffect } from 'react';

interface JuzProgress {
  juz: number;
  progress: number;
  ayatHafal: number;
  totalAyat: number;
  detail: string;
  status: 'selesai' | 'proses' | 'belum';
}

interface SuratProgress {
  surat: string;
  progress: number;
  ayatHafal: number;
  totalAyat: number;
  juzTerkait: number[];
}

interface ProgressStatistik {
  totalJuzSelesai: number;
  totalJuzProses: number;
  totalJuzBelum: number;
  totalAyatHafal: number;
  totalAyatAlQuran: number;
  progressKeseluruhan: number;
  totalSuratDihafal: number;
}

interface ProgressJuzData {
  santriId: number;
  progressJuz: JuzProgress[];
  progressSurat: SuratProgress[];
  statistik: ProgressStatistik;
  lastUpdated: string;
}

interface UseProgressJuzResult {
  data: ProgressJuzData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProgressJuz(santriId?: number): UseProgressJuzResult {
  const [data, setData] = useState<ProgressJuzData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgressJuz = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan');
      }

      const url = santriId 
        ? `/api/konversi/progress-juz?santriId=${santriId}`
        : '/api/konversi/progress-juz';

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal mengambil data progress juz');
      }

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Gagal mengambil data');
      }

    } catch (err) {
      console.error('❌ Error fetching progress juz:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressJuz();
  }, [santriId]);

  return {
    data,
    loading,
    error,
    refetch: fetchProgressJuz
  };
}

// Hook untuk konversi target juz ke surat
interface TargetSuratData {
  targetJuz: number[];
  suratTarget: SuratProgress[];
  statistik: {
    totalJuz: number;
    totalSurat: number;
    totalAyatTarget: number;
    suratLengkap: number;
    suratSebagian: number;
    estimasiWaktu: string;
  };
  rencanaHafalan: Array<{
    urutan: number;
    surat: string;
    target: string;
    totalAyat: number;
    juzTerkait: number[];
    rencana: string;
    prioritas: string;
  }>;
  lastGenerated: string;
}

interface UseTargetSuratResult {
  data: TargetSuratData | null;
  loading: boolean;
  error: string | null;
  generateTarget: (juzNumbers: number[]) => Promise<void>;
}

export function useTargetSurat(): UseTargetSuratResult {
  const [data, setData] = useState<TargetSuratData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTarget = async (juzNumbers: number[]) => {
    try {
      setLoading(true);
      setError(null);

      if (juzNumbers.length === 0) {
        throw new Error('Pilih minimal 1 juz');
      }

      const juzParam = juzNumbers.join(',');
      const response = await fetch(`/api/konversi/target-surat?juz=${juzParam}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal generate target surat');
      }

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Gagal generate target');
      }

    } catch (err) {
      console.error('❌ Error generating target surat:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    generateTarget
  };
}

// Utility functions
export function getJuzStatusColor(status: string): string {
  switch (status) {
    case 'selesai':
      return 'text-green-600 bg-green-100';
    case 'proses':
      return 'text-yellow-600 bg-yellow-100';
    case 'belum':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function formatProgressText(progress: number): string {
  if (progress === 100) return 'Selesai';
  if (progress > 0) return `${progress}% Selesai`;
  return 'Belum Dimulai';
}

export function calculateEstimatedDays(totalAyat: number, ayatPerDay: number = 10): number {
  return Math.ceil(totalAyat / ayatPerDay);
}