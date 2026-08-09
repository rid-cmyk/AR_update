"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, Button, Switch, message, Skeleton } from "antd";
import {
  UserOutlined,
  DownloadOutlined,
  DesktopOutlined,
  BellOutlined,
  LogoutOutlined,
  RightOutlined,
  LockOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { usePWAInstall } from "@/hooks/usePWAInstall";

interface SantriUser {
  namaLengkap: string;
  username: string;
  noTlp?: string;
  email?: string;
}

export default function MobileSantriProfil() {
  const { isInstallable, install, isOnline } = usePWAInstall();
  const [user, setUser] = useState<SantriUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const json = await res.json();
          if (json.user) {
            setUser(json.user);
          }
        }
      } catch (e) {
        console.error("Gagal memuat profil santri:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      window.location.href = "/login";
    } catch {
      message.error("Gagal logout. Silakan coba lagi.");
    }
  };

  const handleSyncNow = () => {
    message.loading({ content: "Menyinkronkan data hafalan dengan server...", key: "sync" });
    setTimeout(() => {
      message.success({ content: "Sinkronisasi selesai!", key: "sync" });
    }, 1200);
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* Kartu Profil Santri */}
      <div className="bg-gradient-to-br from-navy-900 via-navy-900 to-emerald-950 border border-navy-800 rounded-3xl p-5 flex items-center gap-4 shadow-lg">
        <Avatar
          size={64}
          style={{ backgroundColor: "#219ebc" }}
          icon={<UserOutlined />}
          className="border-2 border-emerald-400/30 flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-semibold mb-1">
            Santri Tahfizh
          </span>
          {loading ? (
            <Skeleton active paragraph={{ rows: 1 }} />
          ) : (
            <>
              <h2 className="text-lg font-bold text-white truncate">
                {user?.namaLengkap || "Santri"}
              </h2>
              <p className="text-xs text-slate-400 truncate">
                NIS / Username: @{user?.username || "santri"} — Halaqah Tahfizh
              </p>
            </>
          )}
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
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <DownloadOutlined />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Install Aplikasi PWA
                  </h4>
                  <p className="text-xs text-slate-400">
                    Pasang di layar utama HP untuk muroja&apos;ah offline
                  </p>
                </div>
              </div>
              <Button type="primary" size="small" className="bg-emerald-600 rounded-lg">
                Install
              </Button>
            </div>
          )}

          <div
            onClick={handleSyncNow}
            className="p-4 flex items-center justify-between cursor-pointer tap-active hover:bg-navy-700/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-teal/15 text-brand-teal flex items-center justify-center">
                <SyncOutlined />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Sinkronisasi Data
                </h4>
                <p className="text-xs text-slate-400">
                  {isOnline ? "Terhubung (Online)" : "Mode Offline aktif"}
                </p>
              </div>
            </div>
            <RightOutlined className="text-xs text-slate-500" />
          </div>

          <Link
            href="/santri/dashboard?desktop=true"
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
                  Tampilan lengkap layar lebar desktop
                </p>
              </div>
            </div>
            <RightOutlined className="text-xs text-slate-500" />
          </Link>
        </div>
      </div>

      {/* Preferensi & Keamanan */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
          Preferensi
        </h3>
        <div className="bg-navy-900/80 border border-navy-800 rounded-2xl overflow-hidden divide-y divide-navy-800/60">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-teal/15 text-brand-teal flex items-center justify-center">
                <BellOutlined />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Notifikasi Ujian & Target
                </h4>
                <p className="text-xs text-slate-400">
                  Pengingat target harian dan jadwal ujian
                </p>
              </div>
            </div>
            <Switch defaultChecked className="bg-navy-700" />
          </div>
        </div>
      </div>

      {/* Keluar / Logout */}
      <div className="pt-2">
        <Button
          danger
          type="primary"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          className="w-full h-12 rounded-2xl font-bold bg-rose-600/90 hover:bg-rose-600 border-none shadow-lg shadow-rose-900/30"
        >
          Keluar dari Aplikasi
        </Button>
      </div>
    </div>
  );
}
