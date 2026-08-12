"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Progress, Skeleton } from "antd";
import {
  TeamOutlined,
  BookOutlined,
  TrophyOutlined,
  FileTextOutlined,
  BankOutlined,
  BellOutlined,
  LineChartOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  MobileDashboardHero,
  MobileQuickTile,
  MobileStatTile,
  MobileSectionTitle,
  MobileCard,
} from "@/components/mobile/dashboard";

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
    <div className="min-h-[calc(100vh-8rem)] bg-[#f4f9fb] p-4 pb-24">
      <div className="mx-auto max-w-lg space-y-5">
        <MobileDashboardHero
          avatarLabel="Y"
          greeting="Yayasan Nurul Quran"
          badge="Executive Pulse Dashboard"
          subtitle="Pantau ringkasan performa tahfizh seluruh lembaga secara cepat dan aktual."
          actions={[
            { label: "Laporan Eksekutif", href: "/m/yayasan/laporan", icon: <FileTextOutlined />, variant: "primary" },
            { label: "Direktori Santri", href: "/m/yayasan/santri", icon: <TeamOutlined />, variant: "ghost" },
          ]}
        />

        <div>
          <MobileSectionTitle title="Menu Layanan" icon={<UserAddOutlined />} />
          <div className="grid grid-cols-4 gap-2">
            <MobileQuickTile
              icon={<TeamOutlined />}
              label="Santri"
              href="/m/yayasan/santri"
              color="blue"
            />
            <MobileQuickTile
              icon={<LineChartOutlined />}
              label="Laporan"
              href="/m/yayasan/laporan"
              color="teal"
            />
            <MobileQuickTile
              icon={<TrophyOutlined />}
              label="Rapor"
              href="/m/yayasan/raport"
              color="amber"
            />
            <MobileQuickTile
              icon={<BellOutlined />}
              label="Notifikasi"
              href="/m/yayasan/notifikasi"
              color="violet"
            />
          </div>
        </div>

        <div>
          <MobileSectionTitle title="Metrik Utama Lembaga" icon={<LineChartOutlined />} />
          {loading ? (
            <div className="grid grid-cols-2 gap-3" data-testid="skeleton-kpi">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200/80">
                  <Skeleton active paragraph={{ rows: 1 }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <MobileStatTile
                icon={<TeamOutlined />}
                label="Total Santri"
                value={overview.totalSantri.toLocaleString("id-ID")}
                suffix={`${overview.totalHalaqah} Halaqah`}
                color="blue"
              />
              <MobileStatTile
                icon={<BookOutlined />}
                label="Total Setoran"
                value={totalHafalan.toLocaleString("id-ID")}
                color="teal"
              />
              <MobileStatTile
                icon={<TrophyOutlined />}
                label="Capaian Target"
                value={`${performance.hafalanRate}`}
                suffix="%"
                color="amber"
              />
              <MobileStatTile
                icon={<BankOutlined />}
                label="Total Ustadz"
                value={overview.totalGuru.toLocaleString("id-ID")}
                suffix={`Kehadiran ${performance.attendanceRate}%`}
                color="violet"
              />
            </div>
          )}
        </div>

        <div>
          <MobileSectionTitle
            title="Halaqah Berkinerja Tinggi"
            icon={<TrophyOutlined />}
            link="/m/yayasan/laporan"
            linkLabel="Semua Halaqah"
          />
          {loading ? (
            <div className="space-y-3" data-testid="skeleton-halaqah">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200/80">
                  <Skeleton active paragraph={{ rows: 2 }} />
                </div>
              ))}
            </div>
          ) : topHalaqah.length === 0 ? (
            <MobileCard className="py-6 text-center text-xs text-slate-400">
              Belum ada data halaqah tersedia.
            </MobileCard>
          ) : (
            <div className="space-y-3">
              {topHalaqah.map((item) => (
                <MobileCard key={item.halaqahId}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="truncate text-[13px] font-bold text-deep-space">
                        {item.namaHalaqah}
                      </h4>
                      <span className="text-[11px] text-slate-400">{item.guru}</span>
                    </div>
                    <span className="shrink-0 text-[13px] font-extrabold text-blue-green">
                      {item.attendanceRate}%
                    </span>
                  </div>
                  <Progress
                    percent={item.attendanceRate}
                    showInfo={false}
                    strokeColor="#219ebc"
                    trailColor="#e2e8f0"
                    size="small"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{item.santriCount} Santri</span>
                    <span className="font-medium text-emerald-600">Aktif</span>
                  </div>
                </MobileCard>
              ))}
            </div>
          )}
        </div>

        <p className="pb-2 text-center text-[10px] text-slate-400">
          Data aktual lembaga · diperbarui otomatis
        </p>
      </div>
    </div>
  );
}
