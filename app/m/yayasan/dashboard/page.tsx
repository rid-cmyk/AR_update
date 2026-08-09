"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Progress, Skeleton } from "antd";
import {
  TeamOutlined,
  BookOutlined,
  TrophyOutlined,
  RightOutlined,
  FileTextOutlined,
  BankOutlined,
} from "@ant-design/icons";
import MobileStatCard from "@/components/mobile/MobileStatCard";

interface HalaqahStat {
  halaqahId: number;
  namaHalaqah: string;
  guru: string;
  santriCount: number;
  attendanceRate: number;
  averageHafalanPerSantri: number;
}

interface DashboardOverview {
  totalSantri: number;
  totalGuru: number;
  totalHalaqah: number;
}

interface DashboardPerformance {
  attendanceRate: number;
  hafalanRate: number;
}

export default function MobileYayasanDashboard() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<DashboardOverview>({
    totalSantri: 0,
    totalGuru: 0,
    totalHalaqah: 0,
  });
  const [performance, setPerformance] = useState<DashboardPerformance>({
    attendanceRate: 0,
    hafalanRate: 0,
  });
  const [totalHafalan, setTotalHafalan] = useState<number>(0);
  const [topHalaqah, setTopHalaqah] = useState<HalaqahStat[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [dashboardRes, halaqahRes, hafalanRes] = await Promise.all([
          fetch("/api/analytics/dashboard").then((res) => (res.ok ? res.json() : null)),
          fetch("/api/analytics/global-reports?type=halaqah").then((res) => (res.ok ? res.json() : null)),
          fetch("/api/analytics/global-reports?type=hafalan").then((res) => (res.ok ? res.json() : null)),
        ]);

        if (!isMounted) return;

        if (dashboardRes) {
          if (dashboardRes.overview) {
            setOverview({
              totalSantri: dashboardRes.overview.totalSantri || 0,
              totalGuru: dashboardRes.overview.totalGuru || 0,
              totalHalaqah: dashboardRes.overview.totalHalaqah || 0,
            });
          }
          if (dashboardRes.performance) {
            setPerformance({
              attendanceRate: dashboardRes.performance.attendanceRate || 0,
              hafalanRate: dashboardRes.performance.hafalanRate || 0,
            });
          }
        }

        if (hafalanRes && typeof hafalanRes.totalHafalan === "number") {
          setTotalHafalan(hafalanRes.totalHafalan);
        }

        if (halaqahRes && Array.isArray(halaqahRes.halaqahStats)) {
          const sorted = [...halaqahRes.halaqahStats]
            .sort((a, b) => (b.attendanceRate || 0) - (a.attendanceRate || 0))
            .slice(0, 5)
            .map((item: any) => ({
              halaqahId: item.halaqahId,
              namaHalaqah: item.namaHalaqah || "Halaqah Tanpa Nama",
              guru: item.guru || "Tidak ada guru",
              santriCount: item.santriCount || 0,
              attendanceRate: Math.round(item.attendanceRate || 0),
              averageHafalanPerSantri: Math.round(item.averageHafalanPerSantri || 0),
            }));
          setTopHalaqah(sorted);
        }
      } catch (err) {
        console.error("Error fetching Mobile Yayasan Dashboard:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-4 space-y-6">
      {/* Banner Executive Pulse Yayasan */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-green via-navy-800 to-navy-900 p-6 shadow-lg border border-brand-teal/20">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-slate-100 text-[11px] font-semibold mb-2">
            Executive Pulse Dashboard
          </span>
          <h2 className="text-2xl font-bold text-white mb-1">
            Yayasan Nurul Quran
          </h2>
          <p className="text-slate-100 text-xs max-w-xs leading-relaxed opacity-90 mb-4">
            Pantau ringkasan performa tahfizh seluruh lembaga secara cepat dan aktual.
          </p>

          <div className="flex items-center gap-2">
            <Link href="/m/yayasan/laporan">
              <button className="bg-white text-navy-950 hover:bg-slate-100 font-semibold rounded-full h-9 px-4 text-xs shadow-md transition-all tap-active flex items-center gap-1.5">
                <FileTextOutlined />
                <span>Laporan Eksekutif</span>
              </button>
            </Link>
            <Link href="/m/yayasan/santri">
              <button className="bg-white/15 text-white border border-white/20 hover:bg-white/25 rounded-full h-9 px-4 text-xs font-semibold backdrop-blur-sm transition-all tap-active flex items-center gap-1.5">
                <TeamOutlined />
                <span>Direktori Santri</span>
              </button>
            </Link>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-brand-teal/10 blur-2xl pointer-events-none" />
      </div>

      {/* Grid KPI Utama 2x2 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200">
            Metrik Utama Lembaga
          </h3>
          <span className="text-xs text-slate-400">Data Aktual</span>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-3" data-testid="skeleton-kpi">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-navy-900/80 border border-navy-800 rounded-2xl p-4 space-y-2"
              >
                <Skeleton active paragraph={{ rows: 1 }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <MobileStatCard
              title="Total Santri"
              value={overview.totalSantri.toLocaleString("id-ID")}
              icon={<TeamOutlined />}
              subtitle={`${overview.totalHalaqah} Halaqah Aktif`}
              colorScheme="purple"
            />
            <MobileStatCard
              title="Total Setoran"
              value={`${totalHafalan.toLocaleString("id-ID")}`}
              icon={<BookOutlined />}
              subtitle="Catatan Hafalan"
              colorScheme="emerald"
            />
            <MobileStatCard
              title="Capaian Target"
              value={`${performance.hafalanRate}%`}
              icon={<TrophyOutlined />}
              subtitle={`Kehadiran ${performance.attendanceRate}%`}
              colorScheme="amber"
            />
            <MobileStatCard
              title="Total Ustadz"
              value={overview.totalGuru.toLocaleString("id-ID")}
              icon={<BankOutlined />}
              subtitle="Aktif Mengajar"
              colorScheme="blue"
            />
          </div>
        )}
      </div>

      {/* Performa Halaqah Unggulan */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200">
            Halaqah Berkinerja Tinggi
          </h3>
          <Link
            href="/m/yayasan/laporan"
            className="text-xs text-brand-teal hover:text-brand-teal font-medium flex items-center gap-1"
          >
            <span>Semua Halaqah</span>
            <RightOutlined className="text-[10px]" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3" data-testid="skeleton-halaqah">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-navy-900/80 border border-navy-800 rounded-2xl p-4"
              >
                <Skeleton active paragraph={{ rows: 2 }} />
              </div>
            ))}
          </div>
        ) : topHalaqah.length === 0 ? (
          <div className="bg-navy-900/80 border border-navy-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
            Belum ada data halaqah tersedia.
          </div>
        ) : (
          <div className="space-y-3">
            {topHalaqah.map((item) => (
              <div
                key={item.halaqahId}
                className="bg-navy-900/80 border border-navy-800 rounded-2xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {item.namaHalaqah}
                    </h4>
                    <span className="text-xs text-slate-400">{item.guru}</span>
                  </div>
                  <span className="text-sm font-bold text-brand-teal">
                    {item.attendanceRate}% Kehadiran
                  </span>
                </div>
                <Progress
                  percent={item.attendanceRate}
                  showInfo={false}
                  strokeColor="#219ebc"
                  trailColor="#013a5e"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{item.santriCount} Santri</span>
                  <span className="text-emerald-400 font-medium">✓ Aktif</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
