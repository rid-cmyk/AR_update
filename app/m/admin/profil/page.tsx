"use client";

import React, { useEffect, useState } from "react";
import { Avatar, Button, message } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  DesktopOutlined,
  DownloadOutlined,
  RightOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { usePWAInstall } from "@/hooks/usePWAInstall";

interface AdminUser {
  id: number;
  namaLengkap: string;
  username: string;
  role: { name: string };
}

export default function MobileAdminProfil() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const { isInstallable, install } = usePWAInstall();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      message.loading({ content: "Sedang logout...", key: "logout" });
      await fetch("/api/logout", { method: "POST" });
      window.location.href = "/login";
    } catch {
      message.error({ content: "Gagal logout. Silakan coba lagi.", key: "logout" });
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-[#f4f9fb] p-4 space-y-6 pb-24">
      {/* Profil Card Header */}
      <div className="bg-gradient-to-br from-sky-blue via-blue-green to-deep-space border border-slate-200/80 rounded-3xl p-5 flex items-center gap-4 shadow-sm">
        <Avatar
          size={64}
          style={{ backgroundColor: "#ffffff", color: "#219ebc" }}
          icon={<UserOutlined />}
          className="border-2 border-white/40 flex-shrink-0"
        />
        <div className="min-w-0">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold mb-1">
            Administrator
          </span>
          <h2 className="text-lg font-bold text-white truncate">
            {user?.namaLengkap || "Admin User"}
          </h2>
          <p className="text-xs text-white/80 truncate">@{user?.username || "admin"}</p>
        </div>
      </div>

      {/* Detail Informasi */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-3 shadow-sm">
        <h3 className="text-xs font-semibold text-deep-space uppercase tracking-wider">Pengaturan Akun</h3>

        <div className="flex items-center justify-between p-3 bg-sky-blue/10 rounded-xl">
          <div className="flex items-center gap-3">
            <SafetyCertificateOutlined className="text-blue-green text-lg" />
            <span className="text-sm font-medium text-deep-space">Hak Akses Administrator</span>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Aktif</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-sky-blue/10 rounded-xl">
          <div className="flex items-center gap-3">
            <LockOutlined className="text-blue-green text-lg" />
            <span className="text-sm font-medium text-deep-space">Keamanan Sesi JWT</span>
          </div>
          <span className="text-xs font-semibold text-slate-500">Terproteksi</span>
        </div>
      </div>

      {/* Aplikasi & Akses (Buka Versi Desktop & Install PWA) */}
      <div>
        <h3 className="text-xs font-semibold text-deep-space uppercase tracking-wider mb-2 px-1">
          Aplikasi & Akses
        </h3>
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm">
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
                    Pasang Admin Dashboard di layar utama HP
                  </p>
                </div>
              </div>
              <Button type="primary" size="small" className="bg-blue-green rounded-lg border-none">
                Install
              </Button>
            </div>
          )}

          <Link
            href="/admin/dashboard?desktop=true"
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
                  Tampilan 12-kolom lengkap untuk manajemen admin
                </p>
              </div>
            </div>
            <RightOutlined className="text-xs text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Tombol Logout Merah */}
      <div className="pt-2">
        <Button
          danger
          type="primary"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          className="w-full h-12 rounded-2xl font-bold text-sm bg-rose-500 hover:bg-rose-600 border-none shadow-sm shadow-rose-200"
        >
          Keluar (Logout)
        </Button>
      </div>
    </div>
  );
}
