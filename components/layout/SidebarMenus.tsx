"use client";

import React from "react";
import type { MenuProps } from "antd";
import {
  getOrtuMenu,
  getYayasanMenu,
  getSantriMenu,
  getGuruMenu,
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
  TeamOutlined,
  TrophyOutlined,
  FileTextOutlined,
  HomeOutlined,
  LockOutlined,
} from "@ant-design/icons";

export function getSelectedKey(pathname: string): string {
  // Super Admin routes
  if (pathname === "/" || pathname.startsWith("/super-admin/dashboard")) return "super-1";
  if (pathname.startsWith("/super-admin/users")) return "super-2";
  if (pathname.startsWith("/super-admin/settings/backup")) return "super-4";

  if (pathname.startsWith("/super-admin/halaqah")) return "super-halaqah";
  if (pathname.startsWith("/super-admin/jadwal")) return "super-jadwal";
  if (pathname.startsWith("/super-admin/pengumuman")) return "super-pengumuman";
  if (pathname.startsWith("/super-admin/template-raport")) return "super-template-3";
  if (pathname.startsWith("/super-admin/template-ujian")) return "super-template-4";
  if (pathname.startsWith("/super-admin/jenis-ujian")) return "super-template-2";
  if (pathname.startsWith("/super-admin/tahun-akademik")) return "super-template-1";
  if (pathname.startsWith("/super-admin/laporan")) return "super-laporan";
  if (pathname.startsWith("/super-admin/settings/general")) return "super-settings-1";
  if (pathname.startsWith("/super-admin/settings/security")) return "super-settings-2";
  if (pathname.startsWith("/super-admin/settings/system")) return "super-settings-3";
  if (pathname.startsWith("/super-admin/settings/notifications")) return "super-settings-4";
  if (pathname.startsWith("/super-admin/settings")) return "super-settings-1";
  if (pathname.startsWith("/super-admin/guru-permissions")) return "super-guru-permissions";

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
  const isSuperAdminSection = pathname.startsWith("/super-admin");
  const isTemplateSection =
    pathname.startsWith("/super-admin/template") ||
    pathname.startsWith("/super-admin/jenis-ujian") ||
    pathname.startsWith("/super-admin/tahun-akademik");
  if (isSuperAdminSection && (isTemplateSection || pathname.startsWith("/super-admin/settings"))) {
    return ["super-template", "super-settings"].filter(
      (k) =>
        (k === "super-template" && isTemplateSection) ||
        (k === "super-settings" && pathname.startsWith("/super-admin/settings"))
    );
  }
  return undefined;
}

interface SidebarMenuOptions {
  pathname: string;
  navigate: (path: string) => void;
}

const itemStyle: React.CSSProperties = { margin: "4px 8px", borderRadius: 8 };

export function getSidebarMenuItems({
  pathname,
  navigate,
}: SidebarMenuOptions): MenuProps["items"] {
  const isOrtuSection = pathname.startsWith("/ortu");
  const isYayasanSection = pathname.startsWith("/yayasan");
  const isSantriSection = pathname.startsWith("/santri");
  const isGuruSection = pathname.startsWith("/guru");

  if (isOrtuSection) return getOrtuMenu(navigate);
  if (isYayasanSection) return getYayasanMenu(navigate);
  if (isSantriSection) return getSantriMenu(navigate);
  if (isGuruSection) return getGuruMenu(navigate);
  
  return getSuperAdminMenu(navigate);
}
