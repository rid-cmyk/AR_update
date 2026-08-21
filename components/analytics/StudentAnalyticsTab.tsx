'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Card, Segmented, Button, Alert, Skeleton, Space, Tag, Avatar, Empty } from 'antd';
import {
  ReloadOutlined,
  UserOutlined,
  AreaChartOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { VelocityPredictionCard } from './VelocityPredictionCard';
import MobileBottomSheet from '@/components/mobile/MobileBottomSheet';
import {
  HafalanVelocityResult,
  CompletionPredictionResult,
  PerJuzKKMStatusResult,
} from '@/lib/services/predictiveAnalytics';

export interface SantriMetadata {
  id: number;
  namaLengkap: string;
  username: string;
  foto?: string | null;
  halaqah?: Array<{
    id: number;
    namaHalaqah: string;
    guruNama: string;
  }>;
}

export interface ActiveTargetData {
  id: number;
  surat: string;
  ayatTarget: number;
  deadline: string;
  status: string;
}

export interface SantriAnalyticsData {
  santri: SantriMetadata;
  activeTarget: ActiveTargetData | null;
  perJuzKKM: PerJuzKKMStatusResult;
  velocity: HafalanVelocityResult;
  prediction: CompletionPredictionResult;
}

export interface AnalyticsApiResponse {
  success: boolean;
  data?: SantriAnalyticsData;
  error?: string;
  details?: string;
}

export interface StudentAnalyticsTabProps {
  /** Target Santri ID for analytics query */
  santriId: number;
  /** Optional pre-filled Santri display name */
  santriName?: string;
  /** Initial days window filter (default: 30) */
  initialDaysWindow?: number;
  /** Custom wrapper CSS class name */
  className?: string;
  /** Callback triggered on manual data refresh */
  onRefresh?: () => void;
}

// Global SWR fetcher function with error parsing
const analyticsFetcher = async (url: string): Promise<AnalyticsApiResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `HTTP ${res.status}: Gagal memuat data analitik`);
  }
  return res.json();
};

export function StudentAnalyticsTab({
  santriId,
  santriName,
  initialDaysWindow = 30,
  className = '',
  onRefresh,
}: StudentAnalyticsTabProps) {
  const [daysWindow, setDaysWindow] = useState<number>(initialDaysWindow);
  const [isVelocityModalOpen, setVelocityModalOpen] = useState(false);

  // SWR hook for automatic caching, focus revalidation, and state updates
  const swrKey = santriId ? `/api/analytics/predictive?santriId=${santriId}&daysWindow=${daysWindow}` : null;
  const { data, error, isLoading, isValidating, mutate } = useSWR<AnalyticsApiResponse>(
    swrKey,
    analyticsFetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  );

  const handleRefresh = () => {
    mutate();
    if (onRefresh) {
      onRefresh();
    }
  };

  // Loading Skeleton State
  if (isLoading && !data) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="shadow-sm border border-gray-100 rounded-xl">
          <Skeleton avatar active paragraph={{ rows: 2 }} />
        </Card>
        <Card className="shadow-sm border border-gray-100 rounded-xl">
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
        <Card className="shadow-sm border border-gray-100 rounded-xl">
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </div>
    );
  }

  // Error State with Retry Button
  if (error || (data && !data.success)) {
    const errorMessage = error?.message || data?.error || 'Gagal memuat data analitik santri.';
    return (
      <div className={`space-y-4 ${className}`}>
        <Alert
          type="error"
          showIcon
          message="Gagal Memuat Analitik"
          description={errorMessage}
          action={
            <Button size="small" type="primary" danger onClick={handleRefresh}>
              Coba Lagi
            </Button>
          }
          className="rounded-xl"
        />
      </div>
    );
  }

  const analyticsData = data?.data;
  if (!analyticsData) {
    return (
      <Card className={`shadow-sm border border-gray-100 rounded-xl text-center py-8 ${className}`}>
        <Empty description="Data analitik belum tersedia untuk santri ini." />
      </Card>
    );
  }

  const { santri, activeTarget, velocity, prediction } = analyticsData;
  const displayName = santriName || santri.namaLengkap || 'Santri';
  const primaryHalaqah = santri.halaqah?.[0];
  const windowDays = velocity?.windowDays ?? initialDaysWindow;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Header & Toolbar Controls */}
      <Card className="shadow-sm border border-gray-100 rounded-xl overflow-hidden bg-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Santri Info Section */}
          <div className="flex items-center gap-3">
            <Avatar
              size={52}
              src={santri.foto || undefined}
              icon={!santri.foto ? <UserOutlined /> : undefined}
              className="bg-blue-600 border-2 border-blue-100 flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-gray-800 m-0">{displayName}</h2>
                <Tag color="blue" className="rounded-full text-xs font-semibold">
                  @{santri.username}
                </Tag>
              </div>
              <p className="text-xs text-gray-500 m-0 mt-0.5">
                {primaryHalaqah ? (
                  <span>
                    Halaqah: <strong>{primaryHalaqah.namaHalaqah}</strong> | Guru:{' '}
                    <strong>{primaryHalaqah.guruNama}</strong>
                  </span>
                ) : (
                  'Santri Hafalan Al-Qur\'an'
                )}
              </p>
            </div>
          </div>

          {/* Time Window Filter & Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
            <Space align="center" size="small">
              <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Filter Window:</span>
              <Segmented
                value={daysWindow}
                onChange={(val) => setDaysWindow(Number(val))}
                options={[
                  { label: '30 Hari', value: 30 },
                  { label: '60 Hari', value: 60 },
                  { label: '90 Hari', value: 90 },
                ]}
                size="small"
              />
            </Space>

            <Button
              icon={<ReloadOutlined spin={isValidating} />}
              onClick={handleRefresh}
              size="small"
              type="default"
              className="text-xs flex items-center"
            >
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Analytics Cards Layout */}
      <div className="grid grid-cols-1 gap-6">
        {/* Card 1: Velocity & Prediction Summary (trigger modal) */}
        <Card className="shadow-sm border border-gray-100 rounded-xl overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 m-0">
                <ThunderboltOutlined className="text-amber-500" /> Prediksi & Kecepatan Hafalan
              </h3>
              <p className="text-xs text-gray-500 m-0 mt-0.5">
                Analisis tren setoran ziyadah berdasarkan aktivitas {windowDays} hari terakhir
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 rounded-xl border border-blue-100">
              <div className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                <ThunderboltOutlined className="text-blue-500" /> Kecepatan Harian
              </div>
              <div className="text-xl font-bold text-blue-700 mt-1">
                {velocity?.dailyVelocityAyat ?? 0}
                <span className="text-xs font-normal text-gray-500 ml-0.5">ayat/hari</span>
              </div>
            </div>

            <div className="p-3 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 rounded-xl border border-emerald-100">
              <div className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                <AreaChartOutlined className="text-emerald-500" /> Proyeksi Mingguan
              </div>
              <div className="text-xl font-bold text-deep-space mt-1">
                {velocity?.weeklyVelocityAyat ?? 0}
                <span className="text-xs font-normal text-gray-500 ml-0.5">ayat/minggu</span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="text-xs font-semibold text-gray-600">Total Ziyadah</div>
              <div className="text-xl font-bold text-gray-800 mt-1">
                {velocity?.totalZiyadahAyat ?? 0}
                <span className="text-xs font-normal text-gray-500 ml-0.5">ayat</span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="text-xs font-semibold text-gray-600">Hari Aktif</div>
              <div className="text-xl font-bold text-gray-800 mt-1">
                {velocity?.activeDays ?? 0}
                <span className="text-xs font-normal text-gray-500 ml-0.5">dari {windowDays}</span>
              </div>
            </div>
          </div>

          <Button
            type="primary"
            block
            icon={<ThunderboltOutlined />}
            onClick={() => setVelocityModalOpen(true)}
            className="flex items-center justify-center text-sm font-semibold"
          >
            Analisis Tren Setoran & Prediksi
          </Button>
        </Card>

        {/* Velocity & Prediction Modal (Bottom Sheet ala input nilai ujian) */}
        <MobileBottomSheet
          isOpen={isVelocityModalOpen}
          onClose={() => setVelocityModalOpen(false)}
          title="Prediksi & Kecepatan Hafalan"
          initialState="full"
          snapPoints={[76, "75vh", "92vh"]}
        >
          <VelocityPredictionCard
            velocity={velocity}
            prediction={prediction}
            activeTarget={activeTarget}
            loading={isValidating && !data}
          />
        </MobileBottomSheet>
      </div>
    </div>
  );
}

export default StudentAnalyticsTab;
