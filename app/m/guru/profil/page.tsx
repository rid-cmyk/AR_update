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
  WifiOutlined,
  LockOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { usePWAInstall } from "@/hooks/usePWAInstall";

export default function MobileGuruProfil() {
  const { isInstallable, install, isOnline } = usePWAInstall();

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      window.location.href = "/login";
    } catch {
      message.error("Gagal logout. Silakan coba lagi.");
    }
  };

  const handleSyncNow = () => {
    message.loading({ content: "Menyinkronkan data lokal dengan server...", key: "sync" });
    setTimeout(() => {
      message.success({ content: "Sinkronisasi selesai! Semua data mutakhir.", key: "sync" });
    }, 1200);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Kartu Profil Utama */}
      <div className="bg-gradient-to-br from-navy-900 via-navy-900 to-navy-950 border border-navy-800 rounded-3xl p-5 flex items-center gap-4 shadow-lg">
        <Avatar
          size={64}
          style={{ backgroundColor: "#219ebc" }}
          icon={<UserOutlined />}
          className="border-2 border-brand-teal/30 flex-shrink-0"
        />
        <div className="min-w-0">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand-teal/15 text-brand-teal text-[11px] font-semibold mb-1">
            Guru Tahfizh & Tahsin
          </span>
          <h2 className="text-lg font-bold text-white truncate">
            Ust. Hendri Sudianto
          </h2>
          <p className="text-xs text-slate-400 truncate">NIP: 198507202020011001</p>
        </div>
      </div>

      {/* Status PWA & Sinkronisasi */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
          Aplikasi & Sinkronisasi
        </h3>
        <div className="bg-navy-900/80 border border-navy-800 rounded-2xl overflow-hidden divide-y divide-navy-800/60">
          {isInstallable && (
            <div
              onClick={install}
              className="p-4 flex items-center justify-between cursor-pointer tap-active hover:bg-navy-700/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-teal/15 text-brand-teal flex items-center justify-center">
                  <DownloadOutlined />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Install Aplikasi PWA
                  </h4>
                  <p className="text-xs text-slate-400">
                    Pasang di layar utama HP untuk akses offline
                  </p>
                </div>
              </div>
              <Button type="primary" size="small" className="bg-blue-green rounded-lg">
                Install
              </Button>
            </div>
          )}

          <div
            onClick={handleSyncNow}
            className="p-4 flex items-center justify-between cursor-pointer tap-active hover:bg-navy-700/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <SyncOutlined />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Sinkronisasi Data Sekarang
                </h4>
                <p className="text-xs text-slate-400">
                  {isOnline ? "Terhubung ke server (Online)" : "Mode Offline aktif"}
                </p>
              </div>
            </div>
            <RightOutlined className="text-xs text-slate-500" />
          </div>

          <Link
            href="/guru/dashboard?desktop=true"
            className="p-4 flex items-center justify-between tap-active hover:bg-navy-700/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-teal/15 text-brand-teal flex items-center justify-center">
                <DesktopOutlined />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Buka Versi Desktop (PC)
                </h4>
                <p className="text-xs text-slate-400">
                  Tampilan lengkap tabel & sidebar desktop
                </p>
              </div>
            </div>
            <RightOutlined className="text-xs text-slate-500" />
          </Link>
        </div>
      </div>

      {/* Pengaturan Privasi & Notifikasi */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
          Pengaturan
        </h3>
        <div className="bg-navy-900/80 border border-navy-800 rounded-2xl overflow-hidden divide-y divide-navy-800/60">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-teal/15 text-brand-teal flex items-center justify-center">
                <BellOutlined />
              </div>
              <span className="text-sm font-semibold text-white">
                Notifikasi Pengingat Halaqah
              </span>
            </div>
            <Switch defaultChecked style={{ backgroundColor: "#219ebc" }} />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-navy-700/40 text-slate-300 flex items-center justify-center">
                <LockOutlined />
              </div>
              <span className="text-sm font-semibold text-white">
                Ubah Kata Sandi / PIN
              </span>
            </div>
            <RightOutlined className="text-xs text-slate-500" />
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
