"use client";

import React from "react";
import { Badge } from "antd";
import type { MenuProps } from "antd";
import {
  getOrtuMenu,
  getYayasanMenu,
  getSantriMenu,
  getGuruMenu,
  getAdminMenu,
  getSuperAdminMenu,
} from "./SidebarMenuDefinitions";
import {
  BookOutlined,
  CalendarOutlined,
  AimOutlined,
  FileDoneOutlined,
  BarChartOutlined,
  ProfileOutlined,
  SettingFilled,
  UserOutlined,
  CheckCircleOutlined,
  NotificationOutlined,
  BellOutlined,
  TeamOutlined,
  TrophyOutlined,
  FileTextOutlined,
  HomeOutlined,
  DatabaseOutlined,
  LockOutlined,
} from "@ant-design/icons";

export function getSelectedKey(pathname: string): string {
  // Super Admin routes
  if (pathname === "/" || pathname.startsWith("/super-admin/dashboard")) return "super-1";
  if (pathname.startsWith("/super-admin/users")) return "super-2";
  if (pathname.startsWith("/super-admin/notifications")) return "super-3";
  if (pathname.startsWith("/super-admin/settings/backup-database")) return "super-4";
  if (pathname.startsWith("/super-admin/system")) return "super-5";
  if (pathname.startsWith("/super-admin/logs")) return "super-6";

  // Admin routes
  if (pathname === "/admin" || pathname.startsWith("/admin/dashboard")) return "admin-1";
  if (pathname.startsWith("/admin/halaqah")) return "admin-2";
  if (pathname.startsWith("/admin/jadwal")) return "admin-3";
  if (pathname.startsWith("/admin/pengumuman")) return "admin-4";
  if (pathname.startsWith("/admin/template/tahun-akademik")) return "admin-5-1";
  if (pathname.startsWith("/admin/template/jenis-ujian")) return "admin-5-2";
  if (pathname.startsWith("/admin/template/raport")) return "admin-5-3";
  if (pathname.startsWith("/admin/template")) return "admin-5-1";
  if (pathname.startsWith("/admin/laporan")) return "admin-6";
  if (pathname.startsWith("/admin/settings/general")) return "admin-7-1";
  if (pathname.startsWith("/admin/settings/security")) return "admin-7-2";
  if (pathname.startsWith("/admin/settings/system")) return "admin-7-3";
  if (pathname.startsWith("/admin/settings/notifications")) return "admin-7-4";
  if (pathname.startsWith("/admin/settings/backup")) return "admin-7-5";
  if (pathname.startsWith("/admin/settings")) return "admin-7-1";

  // Guru routes
  if (pathname === "/guru/dashboard") return "guru-1";
  if (pathname === "/guru/hafalan") return "guru-2";
  if (pathname === "/guru/target") return "guru-3";
  if (pathname === "/guru/absensi") return "guru-4";
  if (pathname === "/guru/ujian" || pathname.startsWith("/guru/ujian")) return "guru-5";
  if (pathname.startsWith("/guru/jadwal")) return "guru-6";
  if (pathname === "/guru/prestasi") return "guru-7";
  if (pathname === "/guru/grafik") return "guru-9";
  if (pathname === "/guru/raport") return "guru-10";

  // Ortu routes
  if (pathname === "/ortu/dashboard") return "ortu-1";
  if (pathname.startsWith("/ortu/hafalan")) return "ortu-2";
  if (pathname.startsWith("/ortu/absensi")) return "ortu-3";
  if (pathname.startsWith("/ortu/target")) return "ortu-4";
  if (pathname.startsWith("/ortu/raport")) return "ortu-5";
  if (pathname.startsWith("/ortu/pengumuman")) return "ortu-6";
  if (pathname.startsWith("/ortu/profil")) return "ortu-7";

  // Santri routes
  if (pathname === "/santri/dashboard") return "santri-1";
  if (pathname.startsWith("/santri/hafalan")) return "santri-2";
  if (pathname.startsWith("/santri/absensi")) return "santri-3";
  if (pathname.startsWith("/santri/raport")) return "santri-4";
  if (pathname.startsWith("/santri/profil")) return "santri-6";

  // Yayasan routes
  if (pathname === "/yayasan/dashboard") return "yayasan-1";
  if (pathname.startsWith("/yayasan/laporan")) return "yayasan-2";
  if (pathname.startsWith("/yayasan/santri")) return "yayasan-3";
  if (pathname.startsWith("/yayasan/raport")) return "yayasan-4";
  if (pathname.startsWith("/yayasan/profil")) return "yayasan-6";

  return "";
}

export function getOpenKeys(pathname: string): string[] | undefined {
  const isAdminSection = pathname.startsWith("/admin");
  if (isAdminSection && (pathname.startsWith("/admin/template") || pathname.startsWith("/admin/settings"))) {
    return ["admin-5", "admin-7"].filter(
      (k) =>
        (k === "admin-5" && pathname.startsWith("/admin/template")) ||
        (k === "admin-7" && pathname.startsWith("/admin/settings"))
    );
  }
  return undefined;
}

interface SidebarMenuOptions {
  pathname: string;
  navigate: (path: string) => void;
  unreadNotifications?: number;
}

const itemStyle: React.CSSProperties = { margin: "4px 8px", borderRadius: 8 };

export function getSidebarMenuItems({
  pathname,
  navigate,
  unreadNotifications = 0,
}: SidebarMenuOptions): MenuProps["items"] {
  const isOrtuSection = pathname.startsWith("/ortu");
  const isYayasanSection = pathname.startsWith("/yayasan");
  const isSantriSection = pathname.startsWith("/santri");
  const isGuruSection = pathname.startsWith("/guru");
  const isAdminSection = pathname.startsWith("/admin");

  if (isOrtuSection) return getOrtuMenu(navigate);
  if (isYayasanSection) return getYayasanMenu(navigate);
  if (isSantriSection) return getSantriMenu(navigate);
  if (isGuruSection) return getGuruMenu(navigate);
  if (isAdminSection) return getAdminMenu(navigate);
  
  return getSuperAdminMenu(navigate, unreadNotifications);
}
