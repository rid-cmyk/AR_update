"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Avatar } from "antd";
import {
  BellOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { usePWAInstall } from "@/hooks/usePWAInstall";

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

      <div className="relative overflow-hidden bg-gradient-to-r from-white via-white to-sky-blue/40 border-b border-slate-200/80 px-4 pt-safe pb-2.5 shadow-sm shadow-slate-200/50 gpu-layer">
        {/* Aksen dekoratif lembut */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-12 right-6 h-28 w-28 rounded-full bg-blue-green/10 blur-2xl" />
          <div className="absolute -bottom-14 left-1/4 h-24 w-24 rounded-full bg-brand-teal/10 blur-2xl" />
        </div>

        <div className="relative flex items-center justify-between max-w-lg mx-auto">
          {/* Kiri: Logo & Identitas */}
          <Link
            href={dashboardHref}
            prefetch={true}
            className="group flex items-center gap-2.5 min-w-0 tap-instant"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-green via-sky-blue to-deep-space flex items-center justify-center text-white font-extrabold text-[15px] tracking-tight shadow-lg shadow-blue-green/30 ring-1 ring-white/60 transition-transform group-active:scale-95 flex-shrink-0">
              AR
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white ${
                  isOnline ? "bg-emerald-500" : "bg-amber-500"
                } shadow-sm`}
                title={isOnline ? "Online" : "Offline"}
              />
            </div>
            <div className="min-w-0 flex flex-col items-start">
              <span className="text-deep-space font-extrabold text-base tracking-tight leading-none truncate">
                AR-Hafalan
              </span>
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-sky-blue/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-blue-green ring-1 ring-sky-blue/30">
                {roleTitle}
              </span>
            </div>
          </Link>

          {/* Kanan: Notifikasi, Profil */}
          <div className="flex items-center gap-1.5">
            {/* Notifikasi Bell */}
            <Link
              href={notifikasiHref}
              prefetch={true}
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-green hover:bg-sky-blue/20 bg-slate-100 ring-1 ring-slate-200 transition-all tap-active tap-instant"
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
            <Link href={profilHref} prefetch={true} className="tap-instant">
              <Avatar
                size={32}
                style={{ backgroundColor: "#219ebc" }}
                icon={<UserOutlined />}
                className="cursor-pointer ring-2 ring-sky-blue/40 shadow-md shadow-blue-green/20 transition-all hover:ring-blue-green"
              />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default React.memo(MobileHeaderComponent);
