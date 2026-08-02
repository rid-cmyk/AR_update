"use client";

import React from "react";
import { Badge } from "antd";
import type { MenuProps } from "antd";
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

  if (isOrtuSection) {
    return [
      {
        key: "ortu-1",
        icon: <HomeOutlined className="text-base" />,
        label: "Dashboard Anak",
        onClick: () => navigate("/ortu/dashboard"),
        style: itemStyle,
      },
      {
        key: "ortu-2",
        icon: <BookOutlined className="text-base" />,
        label: "Progres Hafalan",
        onClick: () => navigate("/ortu/hafalan"),
        style: itemStyle,
      },
      {
        key: "ortu-3",
        icon: <CheckCircleOutlined className="text-base" />,
        label: "Absensi Anak",
        onClick: () => navigate("/ortu/absensi"),
        style: itemStyle,
      },
      {
        key: "ortu-4",
        icon: <AimOutlined className="text-base" />,
        label: "Target Hafalan",
        onClick: () => navigate("/ortu/target"),
        style: itemStyle,
      },
      {
        key: "ortu-5",
        icon: <FileDoneOutlined className="text-base" />,
        label: "Raport & Prestasi",
        onClick: () => navigate("/ortu/raport"),
        style: itemStyle,
      },
    ];
  }

  if (isYayasanSection) {
    return [
      {
        key: "yayasan-1",
        icon: <HomeOutlined className="text-base" />,
        label: "Dashboard",
        onClick: () => navigate("/yayasan/dashboard"),
        style: itemStyle,
      },
      {
        key: "yayasan-2",
        icon: <BookOutlined className="text-base" />,
        label: "Laporan",
        onClick: () => navigate("/yayasan/laporan"),
        style: itemStyle,
      },
      {
        key: "yayasan-3",
        icon: <TeamOutlined className="text-base" />,
        label: "Data Santri",
        onClick: () => navigate("/yayasan/santri"),
        style: itemStyle,
      },
      {
        key: "yayasan-4",
        icon: <FileDoneOutlined className="text-base" />,
        label: "Raport Tahfidz",
        onClick: () => navigate("/yayasan/raport"),
        style: itemStyle,
      },
    ];
  }

  if (isSantriSection) {
    return [
      {
        key: "santri-1",
        icon: <HomeOutlined className="text-base" />,
        label: "Dashboard",
        onClick: () => navigate("/santri/dashboard"),
        style: itemStyle,
      },
      {
        key: "santri-2",
        icon: <BookOutlined className="text-base" />,
        label: "Hafalan Saya",
        onClick: () => navigate("/santri/hafalan"),
        style: itemStyle,
      },
      {
        key: "santri-3",
        icon: <CalendarOutlined className="text-base" />,
        label: "Absensi Saya",
        onClick: () => navigate("/santri/absensi"),
        style: itemStyle,
      },
      {
        key: "santri-4",
        icon: <FileDoneOutlined className="text-base" />,
        label: "Raport Saya",
        onClick: () => navigate("/santri/raport"),
        style: itemStyle,
      },
    ];
  }

  if (isGuruSection) {
    return [
      {
        key: "guru-1",
        icon: <HomeOutlined className="text-base" />,
        label: "Dashboard",
        onClick: () => navigate("/guru/dashboard"),
        style: itemStyle,
      },
      {
        key: "guru-2",
        icon: <BookOutlined className="text-base" />,
        label: "Data Hafalan",
        onClick: () => navigate("/guru/hafalan"),
        style: itemStyle,
      },
      {
        key: "guru-3",
        icon: <AimOutlined className="text-base" />,
        label: "Target Hafalan",
        onClick: () => navigate("/guru/target"),
        style: itemStyle,
      },
      {
        key: "guru-4",
        icon: <CheckCircleOutlined className="text-base" />,
        label: "Absensi",
        onClick: () => navigate("/guru/absensi"),
        style: itemStyle,
      },
      {
        key: "guru-5",
        icon: <FileDoneOutlined className="text-base" />,
        label: "Penilaian Ujian",
        onClick: () => navigate("/guru/ujian"),
        style: itemStyle,
      },
      {
        key: "guru-6",
        icon: <CalendarOutlined className="text-base" />,
        label: "Jadwal Mengajar",
        onClick: () => navigate("/guru/jadwal"),
        style: itemStyle,
      },
      {
        key: "guru-7",
        icon: <TrophyOutlined className="text-base" />,
        label: "Prestasi Santri",
        onClick: () => navigate("/guru/prestasi"),
        style: itemStyle,
      },
      {
        key: "guru-9",
        icon: <BarChartOutlined className="text-base" />,
        label: "Grafik Progress",
        onClick: () => navigate("/guru/grafik"),
        style: itemStyle,
      },
      {
        key: "guru-10",
        icon: <ProfileOutlined className="text-base" />,
        label: "Raport Hafalan",
        onClick: () => navigate("/guru/raport"),
        style: itemStyle,
      },
    ];
  }

  if (isAdminSection) {
    return [
      {
        key: "admin-1",
        icon: <HomeOutlined className="text-base" />,
        label: "Dashboard",
        onClick: () => navigate("/admin/dashboard"),
        style: itemStyle,
      },
      {
        key: "admin-2",
        icon: <TeamOutlined className="text-base" />,
        label: "Kelola Halaqah",
        onClick: () => navigate("/admin/halaqah"),
        style: itemStyle,
      },
      {
        key: "admin-3",
        icon: <CalendarOutlined className="text-base" />,
        label: "Jadwal Kegiatan",
        onClick: () => navigate("/admin/jadwal"),
        style: itemStyle,
      },
      {
        key: "admin-4",
        icon: <NotificationOutlined className="text-base" />,
        label: "Pengumuman",
        onClick: () => navigate("/admin/pengumuman"),
        style: itemStyle,
      },
      {
        key: "admin-5",
        icon: <FileTextOutlined className="text-base" />,
        label: "Template System",
        style: itemStyle,
        children: [
          {
            key: "admin-5-1",
            label: "Tahun Akademik",
            onClick: () => navigate("/admin/template/tahun-akademik"),
            style: itemStyle,
          },
          {
            key: "admin-5-2",
            label: "Jenis Ujian",
            onClick: () => navigate("/admin/template/jenis-ujian"),
            style: itemStyle,
          },
          {
            key: "admin-5-3",
            label: "Template Raport",
            onClick: () => navigate("/admin/template/raport"),
            style: itemStyle,
          },
        ],
      },
      {
        key: "admin-6",
        icon: <BarChartOutlined className="text-base" />,
        label: "Laporan & Analisis",
        onClick: () => navigate("/admin/laporan"),
        style: itemStyle,
      },
      {
        key: "admin-7",
        icon: <SettingFilled className="text-base" />,
        label: "Pengaturan",
        style: itemStyle,
        children: [
          {
            key: "admin-7-1",
            label: "Umum",
            onClick: () => navigate("/admin/settings/general"),
            style: itemStyle,
          },
          {
            key: "admin-7-2",
            label: "Keamanan",
            onClick: () => navigate("/admin/settings/security"),
            style: itemStyle,
          },
          {
            key: "admin-7-3",
            label: "Sistem",
            onClick: () => navigate("/admin/settings/system"),
            style: itemStyle,
          },
          {
            key: "admin-7-4",
            label: "Notifikasi",
            onClick: () => navigate("/admin/settings/notifications"),
            style: itemStyle,
          },
          {
            key: "admin-7-5",
            label: "Backup",
            onClick: () => navigate("/admin/settings/backup"),
            style: itemStyle,
          },
        ],
      },
    ];
  }

  // Default: Super Admin routes
  return [
    {
      key: "super-1",
      icon: <HomeOutlined className="text-base" />,
      label: "Dashboard",
      onClick: () => navigate("/super-admin/dashboard"),
      style: itemStyle,
    },
    {
      key: "super-2",
      icon: <UserOutlined className="text-base" />,
      label: "User Management",
      onClick: () => navigate("/super-admin/users"),
      style: itemStyle,
    },
    {
      key: "super-3",
      icon: <BellOutlined className="text-base" />,
      label: (
        <div className="flex w-full items-center justify-between">
          <span>Notifikasi</span>
          {unreadNotifications > 0 && (
            <Badge
              count={unreadNotifications}
              size="small"
              className="ml-2 bg-rose-500"
            />
          )}
        </div>
      ),
      onClick: () => navigate("/super-admin/notifications/forgot-passcode"),
      style: itemStyle,
    },
    {
      key: "super-4",
      icon: <DatabaseOutlined className="text-base" />,
      label: "Database Backup",
      onClick: () => navigate("/super-admin/settings/backup-database"),
      style: itemStyle,
    },
  ];
}
