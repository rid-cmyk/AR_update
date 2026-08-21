"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  DatabaseOutlined,
  BellOutlined,
  SafetyCertificateOutlined,
  BookOutlined,
  SettingOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  MobileDashboardHero,
  MobileQuickTile,
  MobileStatTile,
  MobileSectionTitle,
  MobileCard,
} from "@/components/mobile/dashboard";

interface SuperAdminData {
  overview?: {
    totalUsers?: number;
    totalSantri?: number;
    totalGuru?: number;
    totalHalaqah?: number;
    totalAdmin?: number;
    totalOrtu?: number;
    totalYayasan?: number;
  };
}

interface DesktopAdminStats {
  totalTemplate: number;
  ujianAktif: number;
  dataLaporan: number;
  totalPengguna: number;
}

export default function MobileSuperAdminDashboard() {
  const [data, setData] = useState<SuperAdminData | null>(null);
  const [desktopStats, setDesktopStats] = useState<DesktopAdminStats>({
    totalTemplate: 0,
    ujianAktif: 0,
    dataLaporan: 0,
    totalPengguna: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/super-admin/dashboard-stats").then((res) => (res.ok ? res.json() : null)),
      fetch("/api/analytics/dashboard").then((res) => (res.ok ? res.json() : null)),
    ])
      .then(([adminRes, analyticsRes]) => {
        const statsObj = adminRes?.stats || {};
        const overviewObj = analyticsRes?.overview || {};

        setData({ overview: overviewObj });

        setDesktopStats({
          totalTemplate: statsObj.totalTemplate?.value || 0,
          ujianAktif: statsObj.ujianAktif?.value || 0,
          dataLaporan: statsObj.dataLaporan?.value || 0,
          totalPengguna: statsObj.totalPengguna?.value || overviewObj.totalUsers || 0,
        });

        setLoading(false);
      })
      .catch(() => {
        fetch("/api/analytics/global-reports")
          .then((res) => res.json())
          .then((fallbackData) => {
            setData({
              overview: {
                totalUsers: fallbackData.totalUsers || 0,
                totalSantri: fallbackData.totalSantri || 0,
                totalGuru: fallbackData.totalGuru || 0,
                totalHalaqah: fallbackData.totalHalaqah || 0,
              },
            });
            setLoading(false);
          })
          .catch(() => setLoading(false));
      });
  }, []);

  const overview = data?.overview || {};

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-[#f4f9fb] p-4 pb-24">
      <div className="mx-auto max-w-lg space-y-5">
        <MobileDashboardHero
          avatarLabel="SA"
          greeting="Kontrol Penuh Sistem"
          badge="Super Admin Control Center"
          subtitle="Kelola seluruh akun pengguna, data santri, rekap hafalan, dan backup basis data."
          actions={[
            { label: "Kelola Pengguna", href: "/m/super-admin/users", icon: <TeamOutlined />, variant: "primary" },
            { label: "Rekap Hafalan", href: "/m/super-admin/hafalan", icon: <BookOutlined />, variant: "ghost" },
          ]}
        />

        <div>
          <MobileSectionTitle title="Menu Layanan" icon={<SettingOutlined />} />
          <div className="grid grid-cols-4 gap-2">
            <MobileQuickTile
              icon={<TeamOutlined />}
              label="Pengguna"
              href="/m/super-admin/users"
              color="blue"
            />
            <MobileQuickTile
              icon={<BookOutlined />}
              label="Santri"
              href="/m/super-admin/santri"
              color="teal"
            />
            <MobileQuickTile
              icon={<BellOutlined />}
              label="Notifikasi"
              href="/m/super-admin/notifikasi"
              color="amber"
            />
            <MobileQuickTile
              icon={<DatabaseOutlined />}
              label="Backup Data"
              href="/super-admin/settings/backup-database?desktop=true"
              color="violet"
            />
          </div>
        </div>

        <div>
          <MobileSectionTitle title="Statistik Global" icon={<AppstoreOutlined />} />
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              <Skeleton.Button active style={{ height: 72, width: "100%" }} />
              <Skeleton.Button active style={{ height: 72, width: "100%" }} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <MobileStatTile
                icon={<UserOutlined />}
                label="Total Santri"
                value={overview.totalSantri || 0}
                color="teal"
              />
              <MobileStatTile
                icon={<BookOutlined />}
                label="Total Guru"
                value={overview.totalGuru || 0}
                color="amber"
              />
              <MobileStatTile
                icon={<TeamOutlined />}
                label="Total Ortu"
                value={overview.totalOrtu || 0}
                color="orange"
              />
              <MobileStatTile
                icon={<DatabaseOutlined />}
                label="Total Halaqah"
                value={overview.totalHalaqah || 0}
                color="blue"
              />
            </div>
          )}
        </div>

        <div>
          <MobileSectionTitle title="Statistik Operasional" icon={<AppstoreOutlined />} />
          <div className="grid grid-cols-2 gap-3">
            <MobileStatTile
              icon={<AppstoreOutlined />}
              label="Total Template"
              value={loading ? "..." : desktopStats.totalTemplate}
              suffix="Tpl"
              color="violet"
            />
            <MobileStatTile
              icon={<CheckCircleOutlined />}
              label="Ujian Aktif"
              value={loading ? "..." : desktopStats.ujianAktif}
              color="teal"
            />
            <MobileStatTile
              icon={<FileTextOutlined />}
              label="Data Laporan"
              value={loading ? "..." : desktopStats.dataLaporan}
              color="amber"
            />
          </div>
        </div>

        <div>
          <MobileSectionTitle title="Distribusi Peran Sistem" icon={<SafetyCertificateOutlined />} />
          <div className="grid grid-cols-3 gap-2.5">
            <MobileCard className="p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Admin</p>
              <p className="mt-1 text-lg font-extrabold text-blue-green">
                {loading ? "..." : overview.totalAdmin ?? 0}
              </p>
            </MobileCard>
            <MobileCard className="p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Ortu</p>
              <p className="mt-1 text-lg font-extrabold text-teal-600">
                {loading ? "..." : overview.totalOrtu ?? 0}
              </p>
            </MobileCard>
            <MobileCard className="p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Yayasan</p>
              <p className="mt-1 text-lg font-extrabold text-blue-green">
                {loading ? "..." : overview.totalYayasan ?? 1}
              </p>
            </MobileCard>
          </div>
        </div>

        <div>
          <MobileSectionTitle title="Akses Cepat (PC)" icon={<SettingOutlined />} />
          <MobileCard className="space-y-2">
            <Link
              href="/super-admin/halaqah?desktop=true"
              className="flex items-center gap-3 rounded-xl bg-[#f4f9fb] px-3.5 py-3 text-xs font-semibold text-deep-space transition-colors hover:bg-sky-blue/20"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-sky-blue/30 text-blue-green">
                <BookOutlined />
              </span>
              Kelola Halaqah
              <span className="ml-auto rounded-full bg-slate-200/70 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                PC
              </span>
            </Link>
            <Link
              href="/super-admin/template-ujian?desktop=true"
              className="flex items-center gap-3 rounded-xl bg-[#f4f9fb] px-3.5 py-3 text-xs font-semibold text-deep-space transition-colors hover:bg-sky-blue/20"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-amber-50 text-amber-flame">
                <AppstoreOutlined />
              </span>
              Template Ujian & Rapor
              <span className="ml-auto rounded-full bg-slate-200/70 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                PC
              </span>
            </Link>
            <Link
              href="/super-admin/settings/backup-database?desktop=true"
              className="flex items-center gap-3 rounded-xl bg-[#f4f9fb] px-3.5 py-3 text-xs font-semibold text-deep-space transition-colors hover:bg-sky-blue/20"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                <DatabaseOutlined />
              </span>
              Backup Basis Data
              <span className="ml-auto rounded-full bg-slate-200/70 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                PC
              </span>
            </Link>
          </MobileCard>
        </div>

        <p className="pb-2 text-center text-[10px] text-slate-400">
          Seluruh sistem · otoritas tertinggi
        </p>
      </div>
    </div>
  );
}
