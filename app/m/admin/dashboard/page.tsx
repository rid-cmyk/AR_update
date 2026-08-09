"use client";

import React, { useEffect, useState } from "react";
import { UserOutlined, BookOutlined, TeamOutlined, PlusOutlined, FileTextOutlined, AppstoreOutlined } from "@ant-design/icons";
import Link from "next/link";
import MobileStatCard from "@/components/mobile/MobileStatCard";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/dashboard-stats").then((res) => (res.ok ? res.json() : null)),
      fetch("/api/analytics/dashboard").then((res) => (res.ok ? res.json() : null)),
    ])
      .then(([adminRes, analyticsRes]) => {
        const statsObj = adminRes?.stats || {};
        const overviewObj = analyticsRes?.overview || {};

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

  return (
    <div className="p-4 space-y-6">
      {/* Banner Utama Admin */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-green via-navy-800 to-navy-900 p-6 shadow-lg border border-brand-teal/20">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-slate-100 text-[11px] font-semibold mb-2">
            Panel Administrator
          </span>
          <h2 className="text-2xl font-bold text-white mb-1">
            Selamat Datang, Admin!
          </h2>
          <p className="text-slate-100 text-xs max-w-xs leading-relaxed opacity-90 mb-4">
            Kelola data santri, halaqah, dan rekap hafalan secara terpusat.
          </p>

          <div className="flex items-center gap-2">
            <Link href="/m/admin/santri">
              <button className="bg-white text-navy-900 hover:bg-slate-100 font-semibold rounded-full h-9 px-4 text-xs shadow-md transition-all tap-active flex items-center gap-1.5">
                <TeamOutlined />
                <span>Kelola Santri</span>
              </button>
            </Link>
            <Link href="/m/admin/hafalan">
              <button className="bg-white/15 text-white border border-white/20 hover:bg-white/25 rounded-full h-9 px-4 text-xs font-semibold backdrop-blur-sm transition-all tap-active flex items-center gap-1.5">
                <FileTextOutlined />
                <span>Rekap Hafalan</span>
              </button>
            </Link>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-brand-teal/20 blur-2xl pointer-events-none" />
      </div>

      {/* Grid Statistik Utama */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200">Statistik Utama</h3>
          <span className="text-xs text-slate-400">Terakhir Diperbarui</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MobileStatCard
            title="Total Santri"
            value={loading ? "..." : data?.stats?.totalSantri || 0}
            icon={<UserOutlined />}
            subtitle="Santri Terdaftar"
            colorScheme="blue"
          />
          <MobileStatCard
            title="Total Guru"
            value={loading ? "..." : data?.stats?.totalGuru || 0}
            icon={<TeamOutlined />}
            subtitle="Pengampu Halaqah"
            colorScheme="emerald"
          />
          <MobileStatCard
            title="Total Halaqah"
            value={loading ? "..." : data?.stats?.totalHalaqah || 0}
            icon={<BookOutlined />}
            subtitle="Halaqah Aktif"
            colorScheme="purple"
          />
          <MobileStatCard
            title="Setoran Hari Ini"
            value={loading ? "..." : data?.stats?.setoranHariIni || 0}
            icon={<FileTextOutlined />}
            subtitle="Catatan Baru"
            colorScheme="amber"
          />
        </div>
      </div>

      {/* Statistik Operasional & Ujian (Dikembangkan dari Versi Desktop) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200">Statistik Operasional</h3>
          <span className="text-[11px] text-brand-teal font-medium">Data Terpusat</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-navy-900/80 border border-navy-800 rounded-2xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Total Template</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-teal/10 text-brand-teal font-semibold">Ujian & Raport</span>
            </div>
            <div className="text-xl font-bold text-white">{loading ? "..." : desktopStats.totalTemplate}</div>
          </div>

          <div className="bg-navy-900/80 border border-navy-800 rounded-2xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Ujian Aktif</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">Sedang Berjalan</span>
            </div>
            <div className="text-xl font-bold text-white">{loading ? "..." : desktopStats.ujianAktif}</div>
          </div>

          <div className="bg-navy-900/80 border border-navy-800 rounded-2xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Data Laporan</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-teal/10 text-brand-teal font-semibold">Tersedia</span>
            </div>
            <div className="text-xl font-bold text-white">{loading ? "..." : desktopStats.dataLaporan}</div>
          </div>

          <div className="bg-navy-900/80 border border-navy-800 rounded-2xl p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Total Pengguna</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold">Akun Aktif</span>
            </div>
            <div className="text-xl font-bold text-white">{loading ? "..." : desktopStats.totalPengguna}</div>
          </div>
        </div>
      </div>

      {/* Aksi Cepat Admin */}
      <div className="bg-navy-900/80 border border-navy-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aksi Cepat Admin</h3>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/m/admin/santri"
            className="flex items-center gap-2 p-3 bg-navy-700/60 hover:bg-navy-700 border border-navy-800/50 rounded-xl text-slate-200 text-xs font-medium transition-all tap-active"
          >
            <UserOutlined className="text-brand-teal text-base" />
            <span>Kelola Santri</span>
          </Link>
          <Link
            href="/m/admin/hafalan"
            className="flex items-center gap-2 p-3 bg-navy-700/60 hover:bg-navy-700 border border-navy-800/50 rounded-xl text-slate-200 text-xs font-medium transition-all tap-active"
          >
            <FileTextOutlined className="text-amber-400 text-base" />
            <span>Rekap Hafalan</span>
          </Link>
          <Link
            href="/admin/halaqah?desktop=true"
            className="flex items-center gap-2 p-3 bg-navy-700/60 hover:bg-navy-700 border border-navy-800/50 rounded-xl text-slate-200 text-xs font-medium transition-all tap-active"
          >
            <BookOutlined className="text-emerald-400 text-base" />
            <span>Halaqah (PC)</span>
          </Link>
          <Link
            href="/admin/template?desktop=true"
            className="flex items-center gap-2 p-3 bg-navy-700/60 hover:bg-navy-700 border border-navy-800/50 rounded-xl text-slate-200 text-xs font-medium transition-all tap-active"
          >
            <AppstoreOutlined className="text-brand-teal text-base" />
            <span>Template Ujian (PC)</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
