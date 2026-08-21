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
import { MobileCard } from "@/components/mobile/dashboard";

export default function MobileYayasanProfil() {
  const { isInstallable, install } = usePWAInstall();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch {
      message.error("Gagal logout. Silakan coba lagi.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-[#f4f9fb] p-4 space-y-6 pb-24">
      {/* Kartu Identitas Lembaga Yayasan */}
      <div className="bg-gradient-to-br from-sky-blue via-blue-green to-deep-space border border-slate-200/80 rounded-3xl p-5 flex items-center gap-4 shadow-sm">
        <Avatar
          size={64}
          style={{ backgroundColor: "#ffffff", color: "#219ebc" }}
          icon={<BankOutlined />}
          className="border-2 border-white/40 flex-shrink-0"
        />
        <div className="min-w-0">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold mb-1">
            Eksekutif Lembaga
          </span>
          <h2 className="text-lg font-bold text-white truncate">
            Yayasan Nurul Quran
          </h2>
          <p className="text-xs text-white/80 truncate">Pimpinan: KH. Muhammad Arifin</p>
        </div>
      </div>

      {/* Pengaturan Aplikasi PWA & Desktop */}
      <div>
        <h3 className="text-xs font-semibold text-deep-space uppercase tracking-wider mb-2 px-1">
          Aplikasi & Akses
        </h3>
        <MobileCard className="p-0 overflow-hidden divide-y divide-slate-100">
          {isInstallable && (
            <div
              onClick={install}
              className="p-4 flex items-center justify-between cursor-pointer tap-active hover:bg-sky-blue/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-blue/20 text-blue-green flex items-center justify-center">
                  <DownloadOutlined />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-deep-space">
                    Install Aplikasi PWA
                  </h4>
                  <p className="text-xs text-slate-500">
                    Pasang Executive Dashboard di layar utama HP
                  </p>
                </div>
              </div>
              <Button type="primary" size="small" className="bg-blue-green rounded-lg border-none">
                Install
              </Button>
            </div>
          )}

          <Link
            href="/yayasan/dashboard?desktop=true"
            className="p-4 flex items-center justify-between tap-active hover:bg-sky-blue/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-blue/20 text-blue-green flex items-center justify-center">
                <DesktopOutlined />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-deep-space">
                  Buka Versi Desktop (PC)
                </h4>
                <p className="text-xs text-slate-500">
                  Tampilan lengkap manajemen eksekutif
                </p>
              </div>
            </div>
            <RightOutlined className="text-xs text-slate-400" />
          </Link>
        </MobileCard>
      </div>

      {/* Preferensi Laporan Eksekutif */}
      <div>
        <h3 className="text-xs font-semibold text-deep-space uppercase tracking-wider mb-2 px-1">
          Laporan & Notifikasi
        </h3>
        <MobileCard className="p-0 overflow-hidden divide-y divide-slate-100">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileProtectOutlined />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-deep-space">
                  Ringkasan Eksekutif Bulanan
                </h4>
                <p className="text-xs text-slate-500">
                  Kirim laporan performa lembaga via WhatsApp
                </p>
              </div>
            </div>
            <Switch defaultChecked style={{ backgroundColor: "#219ebc" }} />
          </div>
        </MobileCard>
      </div>

      {/* Tombol Logout */}
      <div className="pt-4">
        <Button
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          className="w-full h-12 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-200 font-bold text-sm"
        >
          Keluar (Logout)
        </Button>
      </div>
    </div>
  );
}
