"use client";

import React, { useEffect, useState } from "react";
import { UserOutlined, TeamOutlined, DatabaseOutlined, BellOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import Link from "next/link";
import MobileStatCard from "@/components/mobile/MobileStatCard";

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

  return (
    <div className="p-4 space-y-6">
      {/* Banner Utama Super Admin */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-green via-navy-800 to-navy-900 p-6 shadow-lg border border-brand-teal/20">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-slate-100 text-[11px] font-semibold mb-2">
            Super Admin Control Center
          </span>
          <h2 className="text-2xl font-bold text-white mb-1">
            Kontrol Penuh Sistem
          </h2>
          <p className="text-slate-100 text-xs max-w-xs leading-relaxed opacity-90 mb-4">
            Kelola seluruh akun pengguna, notifikasi passcode, dan backup basis data.
          </p>

          <div className="flex items-center gap-2">
            <Link href="/m/super-admin/users">
              <button className="bg-white text-navy-900 hover:bg-slate-100 font-semibold rounded-full h-9 px-4 text-xs shadow-md transition-all tap-active flex items-center gap-1.5">
                <TeamOutlined />
                <span>Manajemen User</span>
              </button>
            </Link>
            <Link href="/m/super-admin/profil">
              <button className="bg-white/15 text-white border border-white/20 hover:bg-white/25 rounded-full h-9 px-4 text-xs font-semibold backdrop-blur-sm transition-all tap-active flex items-center gap-1.5">
                <SafetyCertificateOutlined />
                <span>Hak Akses</span>
              </button>
            </Link>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-brand-teal/20 blur-2xl pointer-events-none" />
      </div>

      {/* Grid Statistik Utama */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200">Statistik Global</h3>
          <span className="text-xs text-slate-400">Seluruh Sistem</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MobileStatCard
            title="Total Pengguna"
            value={loading ? "..." : data?.overview?.totalUsers || 0}
            icon={<TeamOutlined />}
            subtitle="Akun Terdaftar"
            colorScheme="purple"
          />
          <MobileStatCard
            title="Total Santri"
            value={loading ? "..." : data?.overview?.totalSantri || 0}
            icon={<UserOutlined />}
            subtitle="Santri Aktif"
            colorScheme="emerald"
          />
          <MobileStatCard
            title="Total Guru"
            value={loading ? "..." : data?.overview?.totalGuru || 0}
            icon={<UserOutlined />}
            subtitle="Ustadz Pengampu"
            colorScheme="blue"
          />
          <MobileStatCard
            title="Total Halaqah"
            value={loading ? "..." : data?.overview?.totalHalaqah || 0}
            icon={<DatabaseOutlined />}
            subtitle="Halaqah Tahfizh"
            colorScheme="amber"
          />
        </div>
      </div>

      {/* Distribusi Peran Sistem (Dikembangkan dari Versi Desktop) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200">Distribusi Peran Sistem</h3>
          <span className="text-[11px] text-brand-teal font-medium">Otoritas & Akses</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-navy-900/80 border border-navy-800 rounded-2xl p-3 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-400">Admin</span>
            <div className="text-lg font-bold text-brand-teal mt-1">
              {loading ? "..." : data?.overview?.totalAdmin ?? 2}
            </div>
          </div>
          <div className="bg-navy-900/80 border border-navy-800 rounded-2xl p-3 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-400">Ortu</span>
            <div className="text-lg font-bold text-emerald-300 mt-1">
              {loading ? "..." : data?.overview?.totalOrtu ?? 0}
            </div>
          </div>
          <div className="bg-navy-900/80 border border-navy-800 rounded-2xl p-3 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-400">Yayasan</span>
            <div className="text-lg font-bold text-brand-teal mt-1">
              {loading ? "..." : data?.overview?.totalYayasan ?? 1}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Kontrol Super Admin */}
      <div className="bg-navy-900/80 border border-navy-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Manajemen Sistem</h3>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/m/super-admin/users"
            className="flex items-center gap-2 p-3 bg-navy-700/60 hover:bg-navy-700 border border-navy-800/50 rounded-xl text-slate-200 text-xs font-medium transition-all tap-active"
          >
            <TeamOutlined className="text-brand-teal text-base" />
            <span>Manajemen User</span>
          </Link>

          <Link
            href="/super-admin/notifications/forgot-passcode?desktop=true"
            className="flex items-center gap-2 p-3 bg-navy-700/60 hover:bg-navy-700 border border-navy-800/50 rounded-xl text-slate-200 text-xs font-medium transition-all tap-active"
          >
            <BellOutlined className="text-rose-400 text-base" />
            <span>Notif Passcode (PC)</span>
          </Link>

          <Link
            href="/super-admin/settings/backup-database?desktop=true"
            className="flex items-center gap-2 p-3 bg-navy-700/60 hover:bg-navy-700 border border-navy-800/50 rounded-xl text-slate-200 text-xs font-medium transition-all tap-active"
          >
            <DatabaseOutlined className="text-emerald-400 text-base" />
            <span>Backup Data (PC)</span>
          </Link>

          <Link
            href="/m/super-admin/profil"
            className="flex items-center gap-2 p-3 bg-navy-700/60 hover:bg-navy-700 border border-navy-800/50 rounded-xl text-slate-200 text-xs font-medium transition-all tap-active"
          >
            <SafetyCertificateOutlined className="text-brand-teal text-base" />
            <span>Profil Hak Akses</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
