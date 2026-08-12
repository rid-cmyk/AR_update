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
    <div className="min-h-[calc(100vh-8rem)] bg-[#f4f9fb] p-4 space-y-6 pb-24">
      {/* Kartu Profil Utama */}
      <div className="bg-gradient-to-br from-sky-blue via-blue-green to-deep-space rounded-3xl p-5 flex items-center gap-4 shadow-lg shadow-blue-green/20">
        <Avatar
          size={64}
          style={{ backgroundColor: "#219ebc" }}
          icon={<UserOutlined />}
          className="border-2 border-white/40 flex-shrink-0"
        />
        <div className="min-w-0">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold mb-1">
            Guru Tahfizh & Tahsin
          </span>
          <h2 className="text-lg font-bold text-white truncate">
            Ust. Hendri Sudianto
          </h2>
          <p className="text-xs text-white/70 truncate">NIP: 198507202020011001</p>
        </div>
      </div>

      {/* Status PWA & Sinkronisasi */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
          Aplikasi & Sinkronisasi
        </h3>
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm">
          {isInstallable && (
            <div
              onClick={install}
              className="p-4 flex items-center justify-between cursor-pointer tap-active hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-blue/15 text-blue-green flex items-center justify-center">
                  <DownloadOutlined />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-deep-space">
                    Install Aplikasi PWA
                  </h4>
                  <p className="text-xs text-slate-500">
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
            className="p-4 flex items-center justify-between cursor-pointer tap-active hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <SyncOutlined />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-deep-space">
                  Sinkronisasi Data Sekarang
                </h4>
                <p className="text-xs text-slate-500">
                  {isOnline ? "Terhubung ke server (Online)" : "Mode Offline aktif"}
                </p>
              </div>
            </div>
            <RightOutlined className="text-xs text-slate-400" />
          </div>

          <Link
            href="/guru/dashboard?desktop=true"
            className="p-4 flex items-center justify-between tap-active hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-blue/15 text-blue-green flex items-center justify-center">
                <DesktopOutlined />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-deep-space">
                  Buka Versi Desktop (PC)
                </h4>
                <p className="text-xs text-slate-500">
                  Tampilan lengkap tabel & sidebar desktop
                </p>
              </div>
            </div>
            <RightOutlined className="text-xs text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Pengaturan Privasi & Notifikasi */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
          Pengaturan
        </h3>
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-blue/15 text-blue-green flex items-center justify-center">
                <BellOutlined />
              </div>
              <span className="text-sm font-semibold text-deep-space">
                Notifikasi Pengingat Halaqah
              </span>
            </div>
            <Switch defaultChecked style={{ backgroundColor: "#219ebc" }} />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
                <LockOutlined />
              </div>
              <span className="text-sm font-semibold text-deep-space">
                Ubah Kata Sandi / PIN
              </span>
            </div>
            <RightOutlined className="text-xs text-slate-400" />
          </div>
        </div>
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
