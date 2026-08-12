"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "antd";
import {
  UserOutlined,
  BookOutlined,
  TeamOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  BellOutlined,
  SettingOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  MobileDashboardHero,
  MobileQuickTile,
  MobileStatTile,
  MobileSectionTitle,
  MobileCard,
} from "@/components/mobile/dashboard";

interface AdminDashboardData {
  stats: {
    totalSantri: number;
    totalGuru: number;
    totalHalaqah: number;
    setoranHariIni: number;
  };
}

interface DesktopAdminStats {
  totalTemplate: number;
  ujianAktif: number;
  dataLaporan: number;
  totalPengguna: number;
}

export default function MobileAdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [desktopStats, setDesktopStats] = useState<DesktopAdminStats>({
    totalTemplate: 0,
    ujianAktif: 0,
    dataLaporan: 0,
    totalPengguna: 0,
  });
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/dashboard-stats").then((res) => (res.ok ? res.json() : null)),
      fetch("/api/analytics/dashboard").then((res) => (res.ok ? res.json() : null)),
      fetch("/api/auth/me").then((res) => (res.ok ? res.json() : null)),
    ])
      .then(([adminRes, analyticsRes, meRes]) => {
        const statsObj = adminRes?.stats || {};
        const overviewObj = analyticsRes?.overview || {};

        if (meRes?.user?.namaLengkap) {
          setAdminName(meRes.user.namaLengkap);
        }

        setData({
          stats: {
            totalSantri: overviewObj.totalSantri || statsObj.santriAktif?.value || 0,
            totalGuru: overviewObj.totalGuru || statsObj.ustadzPengampu?.value || 0,
            totalHalaqah: overviewObj.totalHalaqah || statsObj.halaqahAktif?.value || 0,
            setoranHariIni: analyticsRes?.recentActivities?.hafalan?.length || 0,
          },
        });

        setDesktopStats({
          totalTemplate: statsObj.totalTemplate?.value || 0,
          ujianAktif: statsObj.ujianAktif?.value || 0,
          dataLaporan: statsObj.dataLaporan?.value || 0,
          totalPengguna: statsObj.totalPengguna?.value || overviewObj.totalUsers || 0,
        });

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const namaDepan = adminName.trim().split(" ")[0];
  const avatarLabel = (adminName.trim().charAt(0) || "A").toUpperCase();

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-[#f4f9fb] p-4 pb-24">
      <div className="mx-auto max-w-lg space-y-5">
        <MobileDashboardHero
          avatarLabel={avatarLabel}
          greeting={namaDepan ? `Selamat Datang, ${namaDepan}!` : "Selamat Datang, Admin!"}
          badge="Panel Administrator"
          subtitle="Kelola data santri, halaqah, dan rekap hafalan secara terpusat."
          actions={[
            { label: "Kelola Santri", href: "/m/admin/santri", icon: <TeamOutlined />, variant: "primary" },
            { label: "Rekap Hafalan", href: "/m/admin/hafalan", icon: <FileTextOutlined />, variant: "ghost" },
          ]}
        />

        <div>
          <MobileSectionTitle title="Menu Layanan" icon={<UserAddOutlined />} />
          <div className="grid grid-cols-4 gap-2">
            <MobileQuickTile
              icon={<UserOutlined />}
              label="Santri"
              href="/m/admin/santri"
              color="blue"
            />
            <MobileQuickTile
              icon={<BookOutlined />}
              label="Hafalan"
              href="/m/admin/hafalan"
              color="teal"
            />
            <MobileQuickTile
              icon={<BellOutlined />}
              label="Notifikasi"
              href="/m/admin/notifikasi"
              color="amber"
            />
            <MobileQuickTile
              icon={<SettingOutlined />}
              label="Profil"
              href="/m/admin/profil"
              color="violet"
            />
          </div>
        </div>

        <div>
          <MobileSectionTitle title="Statistik Utama" icon={<TeamOutlined />} />
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
                value={data?.stats?.totalSantri || 0}
                color="blue"
              />
              <MobileStatTile
                icon={<TeamOutlined />}
                label="Total Guru"
                value={data?.stats?.totalGuru || 0}
                color="teal"
              />
              <MobileStatTile
                icon={<BookOutlined />}
                label="Total Halaqah"
                value={data?.stats?.totalHalaqah || 0}
                color="amber"
              />
              <MobileStatTile
                icon={<FileTextOutlined />}
                label="Setoran Hari Ini"
                value={data?.stats?.setoranHariIni || 0}
                color="orange"
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
            <MobileStatTile
              icon={<TeamOutlined />}
              label="Total Pengguna"
              value={loading ? "..." : desktopStats.totalPengguna}
              color="orange"
            />
          </div>
        </div>

        <div>
          <MobileSectionTitle title="Akses Cepat (PC)" icon={<SettingOutlined />} />
          <MobileCard className="space-y-2">
            <Link
              href="/admin/halaqah?desktop=true"
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
              href="/admin/template?desktop=true"
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
          </MobileCard>
        </div>
      </div>
    </div>
  );
}
