"use client";

import React from "react";
import Link from "next/link";
import { Avatar, Button, Switch, message } from "antd";
import {
  UserOutlined,
  DownloadOutlined,
  DesktopOutlined,
  BellOutlined,
  LogoutOutlined,
  RightOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";
import { usePWAInstall } from "@/hooks/usePWAInstall";

export default function MobileOrtuProfil() {
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
      {/* Kartu Profil Wali Santri */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950 border border-slate-800 rounded-3xl p-5 flex items-center gap-4 shadow-lg">
        <Avatar
          size={64}
          style={{ backgroundColor: "#f59e0b" }}
          icon={<UserOutlined />}
          className="border-2 border-amber-400/30 flex-shrink-0"
        />
        <div className="min-w-0">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[11px] font-semibold mb-1">
            Orang Tua / Wali
          </span>
          <h2 className="text-lg font-bold text-white truncate">
            Bpk. H. Ahmad Sulaiman
          </h2>
          <p className="text-xs text-slate-400 truncate">No. HP / WA: 0812-3456-7890</p>
        </div>
      </div>

      {/* Pengaturan PWA & Desktop */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
          Aplikasi & Layar
        </h3>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
          {isInstallable && (
            <div
              onClick={install}
              className="p-4 flex items-center justify-between cursor-pointer tap-active hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <DownloadOutlined />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Install Aplikasi PWA
                  </h4>
                  <p className="text-xs text-slate-400">
                    Pasang di layar utama HP untuk pemantauan harian
                  </p>
                </div>
              </div>
              <Button type="primary" size="small" className="bg-amber-600 rounded-lg border-none">
                Install
              </Button>
            </div>
          )}

          <Link
            href="/ortu/dashboard"
            className="p-4 flex items-center justify-between tap-active hover:bg-slate-800/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <DesktopOutlined />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Buka Versi Desktop (PC)
                </h4>
                <p className="text-xs text-slate-400">
                  Tampilan lengkap desktop PC
                </p>
              </div>
            </div>
            <RightOutlined className="text-xs text-slate-500" />
          </Link>
        </div>
      </div>

      {/* Preferensi Notifikasi */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
          Notifikasi & Komunikasi
        </h3>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <WhatsAppOutlined />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Notifikasi WhatsApp Setoran
                </h4>
                <p className="text-xs text-slate-400">
                  Kirim laporan setoran hafalan otomatis ke WA
                </p>
              </div>
            </div>
            <Switch defaultChecked style={{ backgroundColor: "#059669" }} />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <BellOutlined />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Notifikasi Push Pengumuman
                </h4>
                <p className="text-xs text-slate-400">
                  Pengumuman penting dari halaqah & yayasan
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
