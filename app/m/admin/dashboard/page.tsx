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

export default function MobileAdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 space-y-6">
      {/* Banner Utama Admin */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-blue-700 to-slate-900 p-6 shadow-lg border border-sky-400/20">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-sky-100 text-[11px] font-semibold mb-2">
            Panel Administrator
          </span>
          <h2 className="text-2xl font-bold text-white mb-1">
            Selamat Datang, Admin!
          </h2>
          <p className="text-sky-100 text-xs max-w-xs leading-relaxed opacity-90 mb-4">
            Kelola data santri, halaqah, dan rekap hafalan secara terpusat.
          </p>

          <div className="flex items-center gap-2">
            <Link href="/m/admin/santri">
              <button className="bg-white text-sky-900 hover:bg-sky-50 font-semibold rounded-full h-9 px-4 text-xs shadow-md transition-all tap-active flex items-center gap-1.5">
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
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-sky-400/10 blur-2xl pointer-events-none" />
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

      {/* Aksi Cepat Admin */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aksi Cepat Admin</h3>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/m/admin/santri"
            className="flex items-center gap-2 p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-xl text-slate-200 text-xs font-medium transition-all tap-active"
          >
            <UserOutlined className="text-sky-400 text-base" />
            <span>Kelola Santri</span>
          </Link>
          <Link
            href="/m/admin/hafalan"
            className="flex items-center gap-2 p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-xl text-slate-200 text-xs font-medium transition-all tap-active"
          >
            <FileTextOutlined className="text-amber-400 text-base" />
            <span>Rekap Hafalan</span>
          </Link>
          <Link
            href="/admin/halaqah"
            className="flex items-center gap-2 p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-xl text-slate-200 text-xs font-medium transition-all tap-active"
          >
            <BookOutlined className="text-emerald-400 text-base" />
            <span>Halaqah (PC)</span>
          </Link>
          <Link
            href="/admin/template"
            className="flex items-center gap-2 p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-xl text-slate-200 text-xs font-medium transition-all tap-active"
          >
            <AppstoreOutlined className="text-purple-400 text-base" />
            <span>Template Ujian (PC)</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
