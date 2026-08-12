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

export default function MobileSuperAdminDashboard() {
  const [data, setData] = useState<SuperAdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/dashboard")
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
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
          subtitle="Kelola seluruh akun pengguna, notifikasi passcode, dan backup basis data."
          actions={[
            { label: "Manajemen User", href: "/m/super-admin/users", icon: <TeamOutlined />, variant: "primary" },
            { label: "Hak Akses", href: "/m/super-admin/profil", icon: <SafetyCertificateOutlined />, variant: "ghost" },
          ]}
        />

        <div>
          <MobileSectionTitle title="Menu Layanan" icon={<SettingOutlined />} />
          <div className="grid grid-cols-4 gap-2">
            <MobileQuickTile
              icon={<TeamOutlined />}
              label="Manajemen User"
              href="/m/super-admin/users"
              color="blue"
            />
            <MobileQuickTile
              icon={<BellOutlined />}
              label="Notifikasi"
              href="/m/super-admin/notifikasi"
              color="amber"
            />
            <MobileQuickTile
              icon={<SafetyCertificateOutlined />}
              label="Profil"
              href="/m/super-admin/profil"
              color="violet"
            />
            <MobileQuickTile
              icon={<DatabaseOutlined />}
              label="Backup Data"
              href="/super-admin/settings/backup-database?desktop=true"
              color="teal"
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
                icon={<TeamOutlined />}
                label="Total Pengguna"
                value={overview.totalUsers || 0}
                color="blue"
              />
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
                icon={<DatabaseOutlined />}
                label="Total Halaqah"
                value={overview.totalHalaqah || 0}
                color="orange"
              />
            </div>
          )}
        </div>

        <div>
          <MobileSectionTitle title="Distribusi Peran Sistem" icon={<SafetyCertificateOutlined />} />
          <div className="grid grid-cols-3 gap-2.5">
            <MobileCard className="p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Admin</p>
              <p className="mt-1 text-lg font-extrabold text-blue-green">
                {loading ? "..." : overview.totalAdmin ?? 2}
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
          <MobileSectionTitle title="Manajemen Sistem (PC)" icon={<DatabaseOutlined />} />
          <MobileCard className="space-y-2">
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
