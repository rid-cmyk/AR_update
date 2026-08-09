"use client";

import React, { useEffect, useState } from "react";
import { Progress, Skeleton } from "antd";
import {
  BarChartOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  WarningOutlined,
} from "@ant-design/icons";

interface MonthlyProgressItem {
  month: string;
  total_hafalan: number;
  total_ayat: number;
}

interface StatusCountItem {
  status: string;
  _count: {
    status: number;
  };
}

export default function MobileYayasanLaporan() {
  const [loading, setLoading] = useState(true);
  const [totalHafalan, setTotalHafalan] = useState(0);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyProgressItem[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({
    lancar: 0,
    sedang: 0,
    "perlu ulang": 0,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchLaporanData() {
      try {
        setLoading(true);
        const res = await fetch("/api/analytics/global-reports?type=hafalan");
        if (!res.ok) throw new Error("Gagal mengambil laporan hafalan");
        const data = await res.json();

        if (!isMounted) return;

        if (typeof data.totalHafalan === "number") {
          setTotalHafalan(data.totalHafalan);
        }

        if (Array.isArray(data.monthlyProgress)) {
          const formatted = data.monthlyProgress.map((item: any) => ({
            month: new Date(item.month).toLocaleDateString("id-ID", {
              month: "long",
              year: "numeric",
            }),
            total_hafalan: Number(item.total_hafalan || 0),
            total_ayat: Number(item.total_ayat || 0),
          }));
          setMonthlyTrend(formatted);
        }

        if (Array.isArray(data.hafalanByStatus)) {
          const counts: Record<string, number> = {
            lancar: 0,
            sedang: 0,
            "perlu ulang": 0,
          };
          data.hafalanByStatus.forEach((item: StatusCountItem) => {
            const key = item.status.toLowerCase();
            counts[key] = (counts[key] || 0) + item._count.status;
          });
          setStatusCounts(counts);
        }
      } catch (err) {
        console.error("Error fetching Laporan Yayasan:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchLaporanData();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalStatus =
    Object.values(statusCounts).reduce((a, b) => a + b, 0) || 1;

  const getPercent = (count: number) =>
    Math.round((count / totalStatus) * 100);

  return (
    <div className="p-4 space-y-6">
      {/* Banner Laporan */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
        <div>
          <span className="text-[11px] font-semibold text-brand-teal uppercase tracking-wider">
            Laporan Eksekutif Tahfizh
          </span>
          <h3 className="text-base font-bold text-white mt-0.5">
            Pertumbuhan Hafalan Lembaga
          </h3>
          <p className="text-xs text-slate-400">
            {loading
              ? "Memuat data aktual..."
              : `Total ${totalHafalan.toLocaleString("id-ID")} catatan hafalan terverifikasi`}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-brand-teal/15 text-brand-teal flex items-center justify-center text-xl">
          <BarChartOutlined />
        </div>
      </div>

      {/* Ringkasan Kemajuan Bulanan */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300">
          Tren Tambahan Hafalan per Bulan
        </h3>
        {loading ? (
          <div className="space-y-3" data-testid="skeleton-monthly">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="bg-navy-900/80 border border-navy-800 rounded-2xl p-4"
              >
                <Skeleton active paragraph={{ rows: 1 }} />
              </div>
            ))}
          </div>
        ) : monthlyTrend.length === 0 ? (
          <div className="bg-navy-900/80 border border-navy-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
            Belum ada data tren hafalan bulanan.
          </div>
        ) : (
          monthlyTrend.map((item, idx) => (
            <div
              key={idx}
              className="bg-navy-900/80 border border-navy-800 rounded-2xl p-4 flex items-center justify-between"
            >
              <div>
                <h4 className="text-sm font-bold text-white">{item.month}</h4>
                <span className="text-xs text-brand-teal font-medium">
                  Tambahan Ayat: {item.total_ayat.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 font-bold text-sm">
                  +{item.total_hafalan} Setoran
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Distribusi Kategori Santri */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-slate-200">
          Distribusi Status Kelancaran Hafalan
        </h3>
        {loading ? (
          <div data-testid="skeleton-status">
            <Skeleton active paragraph={{ rows: 3 }} />
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <CheckCircleOutlined className="text-emerald-400" />
                  <span>Lancar (Mumtaz)</span>
                </span>
                <span>
                  {statusCounts.lancar} Setoran ({getPercent(statusCounts.lancar)}%)
                </span>
              </div>
              <Progress
                percent={getPercent(statusCounts.lancar)}
                showInfo={false}
                strokeColor="#10b981"
                trailColor="#013a5e"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <SyncOutlined className="text-brand-teal" />
                  <span>Sedang (Jayyid)</span>
                </span>
                <span>
                  {statusCounts.sedang} Setoran ({getPercent(statusCounts.sedang)}%)
                </span>
              </div>
              <Progress
                percent={getPercent(statusCounts.sedang)}
                showInfo={false}
                strokeColor="#219ebc"
                trailColor="#013a5e"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <WarningOutlined className="text-amber-400" />
                  <span>Perlu Ulang (Murojaah)</span>
                </span>
                <span>
                  {statusCounts["perlu ulang"]} Setoran (
                  {getPercent(statusCounts["perlu ulang"])}%)
                </span>
              </div>
              <Progress
                percent={getPercent(statusCounts["perlu ulang"])}
                showInfo={false}
                strokeColor="#fb8500"
                trailColor="#013a5e"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
