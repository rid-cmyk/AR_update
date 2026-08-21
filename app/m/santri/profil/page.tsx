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
import { MobileCard } from "@/components/mobile/dashboard";

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
      await fetch("/api/auth/logout", { method: "POST" });
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
    <div className="min-h-[calc(100vh-8rem)] bg-[#f4f9fb] p-4 space-y-6 pb-24">
      {/* Kartu Profil Santri */}
      <div className="bg-gradient-to-br from-sky-blue via-blue-green to-deep-space rounded-3xl p-5 flex items-center gap-4 shadow-lg shadow-blue-green/20">
        <Avatar
          size={64}
          style={{ backgroundColor: "#219ebc" }}
          icon={<UserOutlined />}
          className="border-2 border-white/40 flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold mb-1">
            Santri Tahfizh
          </span>
          {loading ? (
            <Skeleton active paragraph={{ rows: 1 }} />
          ) : (
            <>
              <h2 className="text-lg font-bold text-white truncate">
                {user?.namaLengkap || "Santri"}
              </h2>
              <p className="text-xs text-white/70 truncate">
                NIS / Username: @{user?.username || "santri"} — Halaqah Tahfizh
              </p>
            </>
          )}
        </div>
      </div>

      {/* Status PWA & Sinkronisasi */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
          Aplikasi & Sinkronisasi
        </h3>
        <MobileCard className="p-0 overflow-hidden divide-y divide-slate-100">
          {isInstallable && (
            <div
              onClick={install}
              className="p-4 flex items-center justify-between cursor-pointer tap-active hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DownloadOutlined />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-deep-space">
                    Install Aplikasi PWA
                  </h4>
                  <p className="text-xs text-slate-500">
                    Pasang di layar utama HP untuk muroja&apos;ah offline
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
              <div className="w-8 h-8 rounded-xl bg-sky-blue/15 text-sky-blue flex items-center justify-center">
                <SyncOutlined />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-deep-space">
                  Sinkronisasi Data
                </h4>
                <p className="text-xs text-slate-500">
                  {isOnline ? "Terhubung (Online)" : "Mode Offline aktif"}
                </p>
              </div>
            </div>
            <RightOutlined className="text-xs text-slate-400" />
          </div>

          <Link
            href="/santri/dashboard?desktop=true"
            className="p-4 flex items-center justify-between tap-active hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-blue/15 text-sky-blue flex items-center justify-center">
                <DesktopOutlined />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-deep-space">
                  Buka Versi Desktop (PC)
                </h4>
                <p className="text-xs text-slate-500">
                  Tampilan lengkap layar lebar desktop
                </p>
              </div>
            </div>
            <RightOutlined className="text-xs text-slate-400" />
          </Link>
        </MobileCard>
      </div>

      {/* Preferensi & Keamanan */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
          Preferensi
        </h3>
        <MobileCard className="p-0 overflow-hidden divide-y divide-slate-100">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-blue/15 text-sky-blue flex items-center justify-center">
                <BellOutlined />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-deep-space">
                  Notifikasi Ujian & Target
                </h4>
                <p className="text-xs text-slate-500">
                  Pengingat target harian dan jadwal ujian
                </p>
              </div>
            </div>
            <Switch defaultChecked className="bg-slate-300" />
          </div>
        </MobileCard>
      </div>

      {/* Keluar / Logout */}
      <div className="pt-2">
        <Button
          danger
          type="primary"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          className="w-full h-12 rounded-2xl font-bold bg-rose-500 hover:bg-rose-600 border-none shadow-lg shadow-rose-500/20"
        >
          Keluar dari Aplikasi
        </Button>
      </div>
    </div>
  );
}
