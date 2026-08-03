'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, Tag, Alert, Segmented, Space, Typography, Skeleton } from 'antd';
import {
  BarChartOutlined,
  LineChartOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { JuzKKMItem } from '@/lib/services/predictiveAnalytics';

const { Text, Title } = Typography;

// Dynamic imports for Recharts to eliminate Next.js 15 App Router SSR hydration mismatch errors
const ResponsiveContainer = dynamic<any>(
  () => import('recharts').then((mod) => mod.ResponsiveContainer as any),
  { ssr: false }
);
const BarChart = dynamic<any>(() => import('recharts').then((mod) => mod.BarChart as any), { ssr: false });
const Bar = dynamic<any>(() => import('recharts').then((mod) => mod.Bar as any), { ssr: false });
const LineChart = dynamic<any>(() => import('recharts').then((mod) => mod.LineChart as any), { ssr: false });
const Line = dynamic<any>(() => import('recharts').then((mod) => mod.Line as any), { ssr: false });
const XAxis = dynamic<any>(() => import('recharts').then((mod) => mod.XAxis as any), { ssr: false });
const YAxis = dynamic<any>(() => import('recharts').then((mod) => mod.YAxis as any), { ssr: false });
const CartesianGrid = dynamic<any>(() => import('recharts').then((mod) => mod.CartesianGrid as any), {
  ssr: false,
});
const Tooltip = dynamic<any>(() => import('recharts').then((mod) => mod.Tooltip as any), { ssr: false });
const ReferenceLine = dynamic<any>(() => import('recharts').then((mod) => mod.ReferenceLine as any), {
  ssr: false,
});
const Cell = dynamic<any>(() => import('recharts').then((mod) => mod.Cell as any), { ssr: false });

export interface PerJuzAnalyticsChartProps {
  /** Array of per-juz scores and KKM status */
  juzScores?: JuzKKMItem[];
  /** KKM threshold cutoff (default: 80) */
  kkmThreshold?: number;
  /** Average score across evaluated juzs */
  averageScore?: number;
  /** List of juz numbers requiring remedial */
  remedialJuzList?: number[];
  /** Default view type: 'bar' | 'line' (default: 'bar') */
  defaultChartType?: 'bar' | 'line';
  /** Chart container height in pixels (default: 350) */
  height?: number;
  /** Loading state flag */
  loading?: boolean;
  /** Custom title */
  title?: string;
  /** Custom class name */
  className?: string;
}

export function PerJuzAnalyticsChart({
  juzScores = [],
  kkmThreshold = 80,
  averageScore,
  remedialJuzList,
  defaultChartType = 'bar',
  height = 350,
  loading = false,
  title = 'Analisis Nilai Per-Juz & KKM',
  className = '',
}: PerJuzAnalyticsChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'line'>(defaultChartType);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || loading) {
    return (
      <Card className={`shadow-sm rounded-xl border border-gray-100 ${className}`}>
        <div className="p-4">
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      </Card>
    );
  }

  // Derived remedial list if not explicitly provided
  const actualRemedialList =
    remedialJuzList ??
    juzScores.filter((item) => item.isRemedial || item.score < kkmThreshold).map((item) => item.juz);

  // Calculated average score if not explicitly provided
  const computedAverage =
    averageScore ??
    (juzScores.length > 0
      ? parseFloat((juzScores.reduce((acc, curr) => acc + curr.score, 0) / juzScores.length).toFixed(2))
      : 0);

  // Chart data formatting
  const chartData = juzScores.map((item) => ({
    ...item,
    juzLabel: `Juz ${item.juz}`,
    shortLabel: `J${item.juz}`,
    isRemedial: item.isRemedial || item.score < kkmThreshold,
  }));

  const hasRemedial = actualRemedialList.length > 0;

  return (
    <Card className={`shadow-sm border border-gray-100 rounded-xl overflow-hidden ${className}`}>
      {/* Header & Control Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-3 border-b border-gray-100">
        <div>
          <Title level={5} className="!mb-0 text-gray-800 flex items-center gap-2">
            <BarChartOutlined className="text-blue-600" /> {title}
          </Title>
          <Text type="secondary" className="text-xs">
            Batas kelulusan KKM: <span className="font-semibold text-red-500">{kkmThreshold}</span>
          </Text>
        </div>

        <Space wrap>
          {juzScores.length > 0 && (
            <Tag
              color={computedAverage >= kkmThreshold ? 'green' : 'orange'}
              className="px-2.5 py-1 text-xs rounded-full font-medium"
            >
              Rata-rata: {computedAverage}
            </Tag>
          )}

          {hasRemedial ? (
            <Tag
              color="error"
              icon={<WarningOutlined />}
              className="px-2.5 py-1 text-xs rounded-full font-medium"
            >
              {actualRemedialList.length} Remedial
            </Tag>
          ) : (
            <Tag
              color="success"
              icon={<CheckCircleOutlined />}
              className="px-2.5 py-1 text-xs rounded-full font-medium"
            >
              Semua Lulus KKM
            </Tag>
          )}

          <Segmented
            value={chartType}
            onChange={(val) => setChartType(val as 'bar' | 'line')}
            options={[
              { value: 'bar', icon: <BarChartOutlined />, label: 'Bar' },
              { value: 'line', icon: <LineChartOutlined />, label: 'Line' },
            ]}
            size="small"
          />
        </Space>
      </div>

      {/* Remedial Warning Alert */}
      {hasRemedial && (
        <Alert
          type="warning"
          showIcon
          className="mb-4 text-xs rounded-lg border-amber-200 bg-amber-50"
          message={
            <span>
              <strong>Perhatian Remedial:</strong> Santri memiliki {actualRemedialList.length} juz dengan nilai di bawah KKM (&lt; {kkmThreshold}):{' '}
              {actualRemedialList.map((juz) => {
                const item = juzScores.find((s) => s.juz === juz);
                return (
                  <Tag key={juz} color="red" className="ml-1 text-xs font-semibold">
                    Juz {juz} ({item?.score ?? 0})
                  </Tag>
                );
              })}
            </span>
          }
        />
      )}

      {/* Recharts Canvas */}
      {chartData.length === 0 ? (
        <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">
          Belum ada data nilai evaluasi per-juz.
        </div>
      ) : (
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="juzLabel"
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={45}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-100 text-xs">
                        <p className="font-bold text-gray-800 mb-1">Juz {data.juz}</p>
                        <p className="text-gray-600">
                          Nilai: <span className="font-semibold text-blue-600">{data.score}</span>
                        </p>
                        <p
                          className={`mt-1 font-semibold ${
                            data.isRemedial ? 'text-red-500' : 'text-emerald-600'
                          }`}
                        >
                          Status: {data.isRemedial ? '⚠️ REMEDIAL REQUIRED (< 80)' : '✅ LULUS'}
                        </p>
                      </div>
                    );
                  }}
                />
                <ReferenceLine
                  y={kkmThreshold}
                  stroke="#EF4444"
                  strokeDasharray="5 5"
                  label={{
                    value: `KKM Baseline (${kkmThreshold})`,
                    fill: '#EF4444',
                    fontSize: 11,
                    position: 'insideTopRight',
                  }}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.score < kkmThreshold ? '#EF4444' : '#3B82F6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="juzLabel"
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={45}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-100 text-xs">
                        <p className="font-bold text-gray-800 mb-1">Juz {data.juz}</p>
                        <p className="text-gray-600">
                          Nilai: <span className="font-semibold text-blue-600">{data.score}</span>
                        </p>
                        <p
                          className={`mt-1 font-semibold ${
                            data.isRemedial ? 'text-red-500' : 'text-emerald-600'
                          }`}
                        >
                          Status: {data.isRemedial ? '⚠️ REMEDIAL REQUIRED (< 80)' : '✅ LULUS'}
                        </p>
                      </div>
                    );
                  }}
                />
                <ReferenceLine
                  y={kkmThreshold}
                  stroke="#EF4444"
                  strokeDasharray="5 5"
                  label={{
                    value: `KKM Baseline (${kkmThreshold})`,
                    fill: '#EF4444',
                    fontSize: 11,
                    position: 'insideTopRight',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  dot={(props: any): any => {
                    const { cx = 0, cy = 0, payload = {} } = props || {};
                    const isRem = (payload.score ?? 0) < kkmThreshold;
                    return (
                      <circle
                        key={`dot-${payload.juz ?? Math.random()}`}
                        cx={cx}
                        cy={cy}
                        r={isRem ? 6 : 4}
                        fill={isRem ? '#EF4444' : '#3B82F6'}
                        stroke={isRem ? '#FEE2E2' : '#FFFFFF'}
                        strokeWidth={isRem ? 3 : 2}
                      />
                    );
                  }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

export default PerJuzAnalyticsChart;
