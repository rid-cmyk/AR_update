"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Avatar } from "antd";
import {
  BellOutlined,
  UserOutlined,
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
  unreadNotifications = 0,
}: MobileHeaderProps) {
  const { isOnline } = usePWAInstall();
  const { setIsModalOpen } = useMobileTheme();
  const [unreadCount, setUnreadCount] = useState<number>(unreadNotifications);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/notifikasi?unreadOnly=true&limit=1")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (isMounted && json?.unreadCount != null) {
          setUnreadCount(json.unreadCount);
        }
      })
      .catch(() => {
        // Abaikan error jaringan; badge tetap memakai nilai dari props
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
  const notifikasiHref = `/m/${rolePrefix}/notifikasi`;

  return (
    <header className="sticky top-0 z-40">
      {/* Garis aksen gradasi di paling atas */}
      <div className="h-[3px] bg-gradient-to-r from-blue-green via-sky-blue to-brand-teal" />

      <div className="bg-navy-900/85 backdrop-blur-xl border-b border-navy-800 px-4 pt-safe pb-2.5 shadow-lg shadow-navy-950/30 gpu-layer">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {/* Kiri: Logo & Identitas */}
          <Link
            href={dashboardHref}
            prefetch={true}
            className="flex items-center gap-2.5 min-w-0 tap-instant"
          >
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-green via-navy-800 to-navy-900 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-green/30 ring-1 ring-white/15 flex-shrink-0">
              AR
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-navy-900 ${
                  isOnline ? "bg-emerald-400" : "bg-amber-400"
                }`}
                title={isOnline ? "Online" : "Offline"}
              />
            </div>
            <div className="min-w-0 flex flex-col leading-tight">
              <span className="text-white font-bold text-[15px] tracking-tight truncate">
                AR-Hafalan
              </span>
              <span className="text-[10px] text-slate-400 font-medium capitalize truncate">
                {roleTitle}
              </span>
            </div>
          </Link>

          {/* Kanan: Kustomisasi, Notifikasi, Profil */}
          <div className="flex items-center gap-1">
            {/* Tombol Kustomisasi UI/UX */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-amber-400 hover:bg-white/10 transition-colors tap-active tap-instant"
              title="Kustomisasi Tampilan"
              aria-label="Kustomisasi Tampilan"
            >
              <BgColorsOutlined className="text-base" />
            </button>

            {/* Notifikasi Bell */}
            <Link
              href={notifikasiHref}
              prefetch={true}
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors tap-active tap-instant"
              title="Notifikasi"
              aria-label="Notifikasi"
            >
              <Badge
                count={unreadCount}
                size="small"
                overflowCount={99}
                offset={[4, -4]}
              >
                <BellOutlined className="text-base" />
              </Badge>
            </Link>

            {/* Profil Avatar */}
            <Link href={profilHref} prefetch={true} className="ml-0.5 tap-instant">
              <Avatar
                size="small"
                style={{ backgroundColor: "#219ebc" }}
                icon={<UserOutlined />}
                className="cursor-pointer ring-1 ring-white/20 hover:ring-blue-500 transition-all"
              />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default React.memo(MobileHeaderComponent);
