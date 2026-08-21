"use client";

import React, { useEffect, useState } from "react";
import { Progress, Skeleton } from "antd";
import { DashboardHeader } from "@/components/ui/dashboard-header";
import { MobileCard, MobileSectionTitle } from "@/components/mobile/dashboard";
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
    <div className="min-h-[calc(100vh-8rem)] bg-[#f4f9fb] p-4 space-y-6 pb-24">
      {/* Header Banner */}
      <DashboardHeader
        badge={
          <span className="inline-flex items-center gap-1.5">
            <BarChartOutlined />
            Laporan Eksekutif
          </span>
        }
        title="Pertumbuhan Hafalan Lembaga"
        subtitle="Pantau tren tambahan hafalan dan distribusi status kelancaran santri secara aktual."
      />

      {/* Banner Laporan */}
      <MobileCard className="p-4 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-blue-green uppercase tracking-wider">
            Laporan Eksekutif Tahfizh
          </span>
          <h3 className="text-base font-bold text-deep-space mt-0.5">
            Pertumbuhan Hafalan Lembaga
          </h3>
          <p className="text-xs text-slate-500">
            {loading
              ? "Memuat data aktual..."
              : `Total ${totalHafalan.toLocaleString("id-ID")} catatan hafalan terverifikasi`}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-sky-blue/20 text-blue-green flex items-center justify-center text-xl">
          <BarChartOutlined />
        </div>
      </MobileCard>

      {/* Ringkasan Kemajuan Bulanan */}
      <div className="space-y-3">
        <MobileSectionTitle
          title="Tren Tambahan Hafalan per Bulan"
          icon={<BarChartOutlined />}
        />
        {loading ? (
          <div className="space-y-3" data-testid="skeleton-monthly">
            {[...Array(3)].map((_, idx) => (
              <MobileCard key={idx} className="p-4">
                <Skeleton active paragraph={{ rows: 1 }} />
              </MobileCard>
            ))}
          </div>
        ) : monthlyTrend.length === 0 ? (
          <MobileCard className="py-6 text-center text-slate-400 text-xs">
            Belum ada data tren hafalan bulanan.
          </MobileCard>
        ) : (
          monthlyTrend.map((item, idx) => (
            <MobileCard
              key={idx}
              className="p-4 flex items-center justify-between"
            >
              <div>
                <h4 className="text-sm font-bold text-deep-space">{item.month}</h4>
                <span className="text-xs text-blue-green font-medium">
                  Tambahan Ayat: {item.total_ayat.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-sm">
                  +{item.total_hafalan} Setoran
                </span>
              </div>
            </MobileCard>
          ))
        )}
      </div>

      {/* Distribusi Kategori Santri */}
      <MobileCard>
        <MobileSectionTitle
          title="Distribusi Status Kelancaran Hafalan"
          icon={<CheckCircleOutlined />}
        />
        {loading ? (
          <div data-testid="skeleton-status">
            <Skeleton active paragraph={{ rows: 3 }} />
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-deep-space mb-1">
                <span className="flex items-center gap-1.5">
                  <CheckCircleOutlined className="text-emerald-500" />
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
                trailColor="#dbe7ee"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-deep-space mb-1">
                <span className="flex items-center gap-1.5">
                  <SyncOutlined className="text-blue-green" />
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
                trailColor="#dbe7ee"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-deep-space mb-1">
                <span className="flex items-center gap-1.5">
                  <WarningOutlined className="text-princeton" />
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
                trailColor="#dbe7ee"
              />
            </div>
          </div>
        )}
      </MobileCard>
    </div>
  );
}
