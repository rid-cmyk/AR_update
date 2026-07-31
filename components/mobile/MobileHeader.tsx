"use client";

import React from "react";
import Link from "next/link";
import { Badge, Avatar } from "antd";
import {
  BellOutlined,
  UserOutlined,
  WifiOutlined,
  DisconnectOutlined,
  BgColorsOutlined,
} from "@ant-design/icons";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useMobileTheme } from "@/components/mobile/theme/MobileThemeProvider";

interface MobileHeaderProps {
  userName?: string;
  roleTitle?: string;
  unreadNotifications?: number;
}

function MobileHeaderComponent({
  userName = "Pengguna",
  roleTitle = "Guru",
  unreadNotifications = 2,
}: MobileHeaderProps) {
  const { isOnline } = usePWAInstall();
  const { setIsModalOpen } = useMobileTheme();

  const getRolePrefix = () => {
    const r = roleTitle?.toLowerCase() || "guru";
    if (r.includes("santri")) return "santri";
    if (r.includes("ortu") || r.includes("orang tua")) return "ortu";
    if (r.includes("yayasan")) return "yayasan";
    if (r.includes("super")) return "super-admin";
    if (r.includes("admin")) return "admin";
    return "guru";
  };

  const rolePrefix = getRolePrefix();
  const dashboardHref = `/m/${rolePrefix}/dashboard`;
  const profilHref = `/m/${rolePrefix}/profil`;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 px-4 py-2.5 pt-safe flex items-center justify-between shadow-sm gpu-layer">
      {/* Kiri: Logo & Status Koneksi */}
      <div className="flex items-center gap-3">
        <Link href={dashboardHref} prefetch={true} className="flex items-center gap-2.5 tap-instant">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-base shadow-md shadow-blue-500/20">
            AR
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm tracking-tight leading-none">
              AR-Hafalan
            </span>
            <span className="text-[10px] text-slate-400 font-medium capitalize mt-0.5">
              {roleTitle}
            </span>
          </div>
        </Link>
      </div>

      {/* Kanan: Offline Indicator, Palette Customizer, Notifikasi, Avatar */}
      <div className="flex items-center gap-2.5">
        {/* Status Koneksi */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
            isOnline
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
          }`}
        >
          {isOnline ? (
            <>
              <WifiOutlined className="text-[11px]" />
              <span>Online</span>
            </>
          ) : (
            <>
              <DisconnectOutlined className="text-[11px]" />
              <span>Offline</span>
            </>
          )}
        </div>

        {/* Tombol Kustomisasi UI/UX */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="p-1.5 text-slate-300 hover:text-amber-400 transition-colors tap-active tap-instant"
          title="Kustomisasi Tampilan"
        >
          <BgColorsOutlined className="text-lg" />
        </button>

        {/* Notifikasi Bell */}
        <Link href={profilHref} prefetch={true} className="relative p-1.5 text-slate-300 hover:text-white tap-instant">
          <Badge count={unreadNotifications} size="small" offset={[2, -2]}>
            <BellOutlined className="text-lg text-slate-300" />
          </Badge>
        </Link>

        {/* Profil Avatar */}
        <Link href={profilHref} prefetch={true} className="tap-instant">
          <Avatar
            size="small"
            style={{ backgroundColor: "#1890ff" }}
            icon={<UserOutlined />}
            className="cursor-pointer border border-white/20 hover:border-blue-500 transition-colors"
          />
        </Link>
      </div>
    </header>
  );
}

export default React.memo(MobileHeaderComponent);

