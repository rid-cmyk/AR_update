"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DashboardOutlined,
  BookOutlined,
  AimOutlined,
  FileDoneOutlined,
  UserOutlined,
  TeamOutlined,
  HomeOutlined,
  BarChartOutlined,
  NotificationOutlined,
  LockOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

interface MobileMenuProps {
  children: React.ReactNode;
}

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  link: string;
}

export default function MobileMenu({ children }: MobileMenuProps) {
  const pathname = usePathname();

  // Determine current role based on pathname
  const getRoleMenuItems = (): MenuItem[] => {
    if (pathname.startsWith("/guru")) {
      return [
        { key: "guru-dash", label: "Dashboard", icon: <DashboardOutlined />, link: "/guru/dashboard" },
        { key: "guru-hafalan", label: "Setoran", icon: <BookOutlined />, link: "/guru/hafalan" },
        { key: "guru-target", label: "Target", icon: <AimOutlined />, link: "/guru/target" },
        { key: "guru-ujian", label: "Ujian", icon: <FileDoneOutlined />, link: "/guru/ujian" },
        { key: "guru-laporan", label: "Laporan", icon: <FileTextOutlined />, link: "/guru/laporan" },
        { key: "guru-pengumuman", label: "Pengumuman", icon: <NotificationOutlined />, link: "/guru/pengumuman" },
        { key: "guru-profil", label: "Profil", icon: <UserOutlined />, link: "/guru/profil" },
      ];
    }

    if (pathname.startsWith("/santri")) {
      return [
        { key: "santri-dash", label: "Dashboard", icon: <DashboardOutlined />, link: "/santri/dashboard" },
        { key: "santri-hafalan", label: "Hafalan", icon: <BookOutlined />, link: "/santri/hafalan" },
        { key: "santri-target", label: "Target", icon: <AimOutlined />, link: "/santri/hafalan/target" },
        { key: "santri-jadwal", label: "Jadwal", icon: <CalendarOutlined />, link: "/santri/jadwal" },
        { key: "santri-progress", label: "Progress Juz", icon: <BarChartOutlined />, link: "/santri/progress-juz" },
        { key: "santri-profil", label: "Profil", icon: <UserOutlined />, link: "/santri/profil" },
      ];
    }

    if (pathname.startsWith("/ortu")) {
      return [
        { key: "ortu-dash", label: "Dashboard", icon: <DashboardOutlined />, link: "/ortu/dashboard" },
        { key: "ortu-anak", label: "Data Anak", icon: <TeamOutlined />, link: "/ortu/dashboard" },
        { key: "ortu-notifikasi", label: "Notifikasi", icon: <NotificationOutlined />, link: "/ortu/notifikasi" },
        { key: "ortu-pengumuman", label: "Pengumuman", icon: <FileTextOutlined />, link: "/ortu/pengumuman" },
        { key: "ortu-profil", label: "Profil", icon: <UserOutlined />, link: "/ortu/profil" },
      ];
    }

    if (pathname.startsWith("/yayasan")) {
      return [
        { key: "yayasan-dash", label: "Dashboard", icon: <DashboardOutlined />, link: "/yayasan/dashboard" },
        { key: "yayasan-laporan", label: "Laporan", icon: <BarChartOutlined />, link: "/yayasan/laporan" },
        { key: "yayasan-notifikasi", label: "Notifikasi", icon: <NotificationOutlined />, link: "/yayasan/notifikasi" },
        { key: "yayasan-profil", label: "Profil", icon: <UserOutlined />, link: "/yayasan/profil" },
      ];
    }

    if (pathname.startsWith("/super-admin")) {
      return [
        { key: "super-dash", label: "Dashboard", icon: <DashboardOutlined />, link: "/super-admin/dashboard" },
        { key: "super-users", label: "Pengguna", icon: <TeamOutlined />, link: "/super-admin/users" },
        { key: "super-notif", label: "Notifikasi", icon: <NotificationOutlined />, link: "/super-admin/notifications/forgot-passcode" },
        { key: "super-profil", label: "Profil", icon: <UserOutlined />, link: "/super-admin/profil" },
      ];
    }

    // Default Admin / Fallback
    return [
      { key: "admin-dash", label: "Dashboard", icon: <DashboardOutlined />, link: "/admin/dashboard" },
      { key: "admin-santri", label: "Santri", icon: <TeamOutlined />, link: "/admin/halaqah" },
      { key: "admin-halaqah", label: "Halaqah", icon: <HomeOutlined />, link: "/admin/halaqah" },
      { key: "admin-hafalan", label: "Laporan", icon: <BookOutlined />, link: "/admin/laporan" },
      { key: "admin-izin", label: "Izin Guru", icon: <LockOutlined />, link: "/admin/guru-permissions" },
      { key: "admin-profil", label: "Profil", icon: <UserOutlined />, link: "/admin/profil" },
    ];
  };

  const menuItems = getRoleMenuItems();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        background: "#f8fafc",
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          background: "#023047",
          color: "#ffffff",
          fontWeight: 700,
          fontSize: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>📖</span>
          <span>AR-Hapalan</span>
        </div>
      </div>

      {/* Main Content Viewport */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 12px",
          paddingBottom: "calc(72px + env(safe-area-inset-bottom, 12px))",
        }}
      >
        {children}
      </div>

      {/* Role-Aware Bottom Navigation Bar */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          height: 64,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          background: "#ffffff",
          boxShadow: "0 -4px 16px rgba(0,0,0,0.08)",
          position: "sticky",
          bottom: 0,
          zIndex: 1000,
        }}
      >
        {menuItems.map((item) => {
          const isActive =
            pathname === item.link ||
            (item.link !== "/" && pathname.startsWith(item.link));

          return (
            <Link
              key={item.key}
              href={item.link}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                minWidth: 56,
                minHeight: 44,
                padding: "4px 8px",
                borderRadius: 8,
                color: isActive ? "#219ebc" : "#64748b",
                fontWeight: isActive ? 600 : 400,
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                backgroundColor: isActive ? "rgba(33, 158, 188, 0.08)" : "transparent",
              }}
            >
              <div style={{ fontSize: 20 }}>{item.icon}</div>
              <span style={{ fontSize: 11, marginTop: 2, lineHeight: 1 }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
