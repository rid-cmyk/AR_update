"use client";

import React from "react";
import Link from "next/link";
import { Avatar, Button, Switch, message } from "antd";
import {
  BankOutlined,
  DownloadOutlined,
  DesktopOutlined,
  BellOutlined,
  LogoutOutlined,
  RightOutlined,
  FileProtectOutlined,
} from "@ant-design/icons";
import { usePWAInstall } from "@/hooks/usePWAInstall";

export default function MobileYayasanProfil() {
  const { isInstallable, install } = usePWAInstall();

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      window.location.href = "/login";
    } catch {
      message.error("Gagal logout. Silakan coba lagi.");
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Kartu Identitas Lembaga Yayasan */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950 border border-slate-800 rounded-3xl p-5 flex items-center gap-4 shadow-lg">
        <Avatar
          size={64}
          style={{ backgroundColor: "#9333ea" }}
          icon={<BankOutlined />}
          className="border-2 border-purple-400/30 flex-shrink-0"
        />
        <div className="min-w-0">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 text-[11px] font-semibold mb-1">
            Eksekutif Lembaga
          </span>
          <h2 className="text-lg font-bold text-white truncate">
            Yayasan Nurul Quran
          </h2>
          <p className="text-xs text-slate-400 truncate">Pimpinan: KH. Muhammad Arifin</p>
        </div>
      </div>

      {/* Pengaturan Aplikasi PWA & Desktop */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
          Aplikasi & Akses
        </h3>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
          {isInstallable && (
            <div
              onClick={install}
              className="p-4 flex items-center justify-between cursor-pointer tap-active hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                  <DownloadOutlined />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Install Aplikasi PWA
                  </h4>
                  <p className="text-xs text-slate-400">
                    Pasang Executive Dashboard di layar utama HP
                  </p>
                </div>
              </div>
              <Button type="primary" size="small" className="bg-purple-600 rounded-lg border-none">
                Install
              </Button>
            </div>
          )}

          <Link
            href="/yayasan/dashboard"
            className="p-4 flex items-center justify-between tap-active hover:bg-slate-800/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                <DesktopOutlined />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Buka Versi Desktop (PC)
                </h4>
                <p className="text-xs text-slate-400">
                  Tampilan lengkap manajemen eksekutif
                </p>
              </div>
            </div>
            <RightOutlined className="text-xs text-slate-500" />
          </Link>
        </div>
      </div>

      {/* Preferensi Laporan Eksekutif */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
          Laporan & Notifikasi
        </h3>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <FileProtectOutlined />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Ringkasan Eksekutif Bulanan
                </h4>
                <p className="text-xs text-slate-400">
                  Kirim laporan performa lembaga via WhatsApp
                </p>
              </div>
            </div>
            <Switch defaultChecked style={{ backgroundColor: "#059669" }} />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <BellOutlined />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Notifikasi KPI Kritis
                </h4>
                <p className="text-xs text-slate-400">
                  Peringatan jika ada halaqah di bawah target
                </p>
              </div>
            </div>
            <Switch defaultChecked style={{ backgroundColor: "#059669" }} />
          </div>
        </div>
      </div>

      {/* Tombol Logout */}
      <div className="pt-4">
        <Button
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          className="w-full h-12 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-sm"
        >
          Keluar (Logout)
        </Button>
      </div>
    </div>
  );
}
