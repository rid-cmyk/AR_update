'use client';

import React from 'react';
import { Card, Statistic, Tag, Alert, Progress, Tooltip, Skeleton, Row, Col } from 'antd';
import {
  ThunderboltOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  BookOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
  HafalanVelocityResult,
  CompletionPredictionResult,
  RiskStatus,
} from '@/lib/services/predictiveAnalytics';

export interface ActiveTargetMetadata {
  id: number;
  surat: string;
  ayatTarget: number;
  deadline: string | Date;
  status: string;
}

export interface VelocityPredictionCardProps {
  /** Hafalan setoran velocity data */
  velocity: HafalanVelocityResult;
  /** Target completion prediction and risk status */
  prediction: CompletionPredictionResult;
  /** Active target metadata (if any) */
  activeTarget: ActiveTargetMetadata | null;
  /** Loading state flag */
  loading?: boolean;
  /** Custom CSS class name */
  className?: string;
}

/** Formats date into readable Indonesian string (e.g., "15 Oktober 2026") */
function formatIndonesianDate(dateValue: string | Date | null | undefined): string {
  if (!dateValue) return 'Belum ditentukan';
  const dateObj = new Date(dateValue);
  if (isNaN(dateObj.getTime())) return 'Format tanggal tidak valid';

  return dateObj.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function VelocityPredictionCard({
  velocity,
  prediction,
  activeTarget,
  loading = false,
  className = '',
}: VelocityPredictionCardProps) {
  if (loading) {
    return (
      <Card className={`shadow-sm border border-gray-100 rounded-xl ${className}`}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  const {
    dailyVelocityAyat = 0,
    weeklyVelocityAyat = 0,
    totalZiyadahAyat = 0,
    activeDays = 0,
    windowDays = 30,
  } = velocity || {};

  const {
    remainingAyat = 0,
    estimatedDays = 0,
    estimatedCompletionDate = null,
    riskStatus = 'INSUFFICIENT_DATA',
    daysDelayed = 0,
  } = prediction || {};

  // Render Risk Status Tag & Configuration
  const renderRiskStatusTag = (status: RiskStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Tag
            color="success"
            icon={<CheckCircleOutlined />}
            className="px-3 py-1 text-xs rounded-full font-semibold border-emerald-200 bg-emerald-50 text-emerald-700"
          >
            TARGET SELESAI
          </Tag>
        );
      case 'ON_TRACK':
        return (
          <Tag
            color="processing"
            icon={<RiseOutlined />}
            className="px-3 py-1 text-xs rounded-full font-semibold border-blue-200 bg-blue-50 text-blue-700"
          >
            SESUAI JADWAL
          </Tag>
        );
      case 'AT_RISK':
        return (
          <Tag
            color="error"
            icon={<WarningOutlined />}
            className="px-3 py-1 text-xs rounded-full font-semibold border-rose-200 bg-rose-50 text-rose-700"
          >
            BERISIKO TERLAMBAT {daysDelayed > 0 ? `(${daysDelayed} HARI)` : ''}
          </Tag>
        );
      case 'INSUFFICIENT_DATA':
      default:
        return (
          <Tag
            color="default"
            icon={<ClockCircleOutlined />}
            className="px-3 py-1 text-xs rounded-full font-semibold border-amber-200 bg-amber-50 text-amber-700"
          >
            DATA BELUM CUKUP
          </Tag>
        );
    }
  };

  // Target progress percentage calculation
  const targetTotalAyat = activeTarget?.ayatTarget || 0;
  const currentProgressAyat = Math.max(0, targetTotalAyat - remainingAyat);
  const progressPercent =
    targetTotalAyat > 0 ? Math.min(100, Math.round((currentProgressAyat / targetTotalAyat) * 100)) : 0;

  return (
    <Card className={`shadow-sm border border-gray-100 rounded-xl overflow-hidden ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <div>
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 m-0">
            <ThunderboltOutlined className="text-amber-500" /> Prediksi & Kecepatan Hafalan
          </h3>
          <p className="text-xs text-gray-500 m-0 mt-0.5">
            Analisis tren setoran ziyadah berdasarkan aktivitas {windowDays} hari terakhir
          </p>
        </div>
        <div>{renderRiskStatusTag(riskStatus)}</div>
      </div>

      {/* Main Velocity Grid */}
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={12}>
          <div className="p-3.5 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 rounded-xl border border-blue-100">
            <Statistic
              title={
                <span className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                  <ThunderboltOutlined className="text-blue-500" /> Kecepatan Harian
                </span>
              }
              value={dailyVelocityAyat}
              precision={2}
              suffix={<span className="text-xs font-normal text-gray-500">ayat/hari</span>}
              valueStyle={{ color: '#1d4ed8', fontWeight: 700, fontSize: '1.5rem' }}
            />
          </div>
        </Col>

        <Col xs={24} sm={12}>
          <div className="p-3.5 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 rounded-xl border border-emerald-100">
            <Statistic
              title={
                <span className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                  <RiseOutlined className="text-emerald-500" /> Proyeksi Mingguan
                </span>
              }
              value={weeklyVelocityAyat}
              precision={2}
              suffix={<span className="text-xs font-normal text-gray-500">ayat/minggu</span>}
              valueStyle={{ color: '#047857', fontWeight: 700, fontSize: '1.5rem' }}
            />
          </div>
        </Col>
      </Row>

      {/* Activity Subtext */}
      <div className="mb-4 p-2.5 bg-gray-50 rounded-lg text-xs text-gray-600 flex items-center justify-between flex-wrap gap-2">
        <span>
          <strong>Total Ziyadah:</strong> {totalZiyadahAyat} ayat
        </span>
        <span>
          <strong>Hari Aktif Setoran:</strong> {activeDays} dari {windowDays} hari terakhir
        </span>
      </div>

      {/* Active Target & Prediction Box */}
      <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-xs mb-4">
        {activeTarget ? (
          <div>
            <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <BookOutlined className="text-blue-600" /> Target Aktif: Surat {activeTarget.surat} ({activeTarget.ayatTarget} Ayat)
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <CalendarOutlined /> Deadline: <strong>{formatIndonesianDate(activeTarget.deadline)}</strong>
              </span>
            </div>

            <Progress
              percent={progressPercent}
              status={riskStatus === 'AT_RISK' ? 'exception' : riskStatus === 'COMPLETED' ? 'success' : 'active'}
              strokeColor={riskStatus === 'AT_RISK' ? '#ef4444' : '#3b82f6'}
              className="mb-3"
            />

            <Row gutter={[12, 12]} className="text-xs text-gray-600 pt-2 border-t border-gray-100">
              <Col xs={12} sm={8}>
                <div className="text-gray-500">Sisa Ayat:</div>
                <div className="font-semibold text-gray-800">{remainingAyat} ayat</div>
              </Col>
              <Col xs={12} sm={8}>
                <div className="text-gray-500">Estimasi Hari:</div>
                <div className="font-semibold text-gray-800">
                  {estimatedDays !== Infinity ? `~${estimatedDays} hari lagi` : 'Belum terestimasi'}
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className="text-gray-500">Estimasi Selesai:</div>
                <div className="font-semibold text-blue-700">
                  {formatIndonesianDate(estimatedCompletionDate)}
                </div>
              </Col>
            </Row>
          </div>
        ) : (
          <div className="text-center py-2 text-gray-500 text-xs">
            <ExclamationCircleOutlined className="mr-1.5 text-amber-500" />
            Santri belum memiliki target hafalan aktif yang sedang berjalan.
          </div>
        )}
      </div>

      {/* Dynamic Risk Alert Banner */}
      {riskStatus === 'AT_RISK' && (
        <Alert
          type="error"
          showIcon
          icon={<WarningOutlined />}
          className="rounded-lg text-xs"
          message={
            <span>
              <strong>Peringatan Terlambat:</strong> Dengan kecepatan harian saat ini ({dailyVelocityAyat} ayat/hari), estimasi selesai ({formatIndonesianDate(estimatedCompletionDate)}) berisiko terlambat ~<strong>{daysDelayed} hari</strong> dari deadline target ({formatIndonesianDate(activeTarget?.deadline)}).
            </span>
          }
        />
      )}

      {riskStatus === 'ON_TRACK' && (
        <Alert
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          className="rounded-lg text-xs"
          message={
            <span>
              <strong>Progres Sesuai Jadwal:</strong> Kecepatan setoran hafalan memadai untuk menyelesaikan target sebelum deadline ({formatIndonesianDate(activeTarget?.deadline)}).
            </span>
          }
        />
      )}

      {riskStatus === 'COMPLETED' && (
        <Alert
          type="info"
          showIcon
          icon={<CheckCircleOutlined />}
          className="rounded-lg text-xs"
          message={
            <span>
              <strong>Target Tuntas:</strong> Santri telah mencapai 100% target hafalan aktif.
            </span>
          }
        />
      )}

      {riskStatus === 'INSUFFICIENT_DATA' && (
        <Alert
          type="warning"
          showIcon
          icon={<ClockCircleOutlined />}
          className="rounded-lg text-xs"
          message={
            <span>
              <strong>Data Belum Cukup:</strong> Tidak ada setoran ziyadah dalam {windowDays} hari terakhir. Tingkatkan aktivitas setoran harian untuk menghasilkan prediksi tanggal ketuntasan.
            </span>
          }
        />
      )}
    </Card>
  );
}

export default VelocityPredictionCard;
