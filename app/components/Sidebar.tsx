// src/components/layout/Sidebar.tsx
/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { Layout, Menu, Tooltip, message } from "antd";
import {
  DashboardOutlined,
  BookOutlined,
  CalendarOutlined,
  AimOutlined,
  FileDoneOutlined,
  BarChartOutlined,
  ProfileOutlined,
  SettingFilled,
  UserOutlined,
  LogoutOutlined,
  CheckCircleOutlined,
  NotificationOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const pathname = usePathname();
  const router = useRouter();

  const getSelectedKey = () => {
    if (pathname === "/" || pathname.startsWith("/super-admin/dashboard")) return "1";
    if (pathname.startsWith("/super-admin/users")) return "2";
    if (pathname.startsWith("/super-admin/settings/raport")) return "3-1";
    if (pathname.startsWith("/super-admin/settings/tahun-ajaran")) return "3-2";
    if (pathname.startsWith("/super-admin/settings/backup-database")) return "3-3";
    if (pathname.startsWith("/super-admin/settings")) return "3";

    if (pathname === "/admin" || pathname.startsWith("/admin/dashboard")) return "4-1";
    if (pathname.startsWith("/admin/halaqah")) return "4-2";
    if (pathname.startsWith("/admin/jadwal")) return "4-3";
    if (pathname.startsWith("/admin/pengumuman")) return "4-4";
    if (pathname.startsWith("/admin/laporan")) return "4-5";
    if (pathname.startsWith("/admin/settings")) return "4-6";
    if (pathname.startsWith("/admin/profil")) return "4-7";

    if (pathname === "/guru/dashboard") return "5-1";
    if (pathname === "/guru/hafalan") return "5-2";
    if (pathname === "/guru/target") return "5-3";
    if (pathname === "/guru/absensi") return "5-4";
    if (pathname === "/guru/ujian") return "5-5";
    if (pathname === "/guru/grafik") return "5-6";
    if (pathname === "/guru/raport") return "5-7";
    if (pathname === "/guru/notifikasi") return "5-8";

    if (pathname === "/admin/dashboard") return "4-1";
    if (pathname.startsWith("/admin/halaqah")) return "4-2";
    if (pathname.startsWith("/admin/jadwal")) return "4-3";
    if (pathname.startsWith("/admin/pengumuman")) return "4-4";
    if (pathname.startsWith("/admin/laporan")) return "4-5";
    if (pathname.startsWith("/admin/settings")) return "4-6";

    if (pathname === "/santri/dashboard") return "8-1";
    if (pathname.startsWith("/santri/hafalan")) return "8-2";
    if (pathname.startsWith("/santri/absensi")) return "8-3";
    if (pathname.startsWith("/santri/raport")) return "8-4";
    if (pathname.startsWith("/santri/notifikasi")) return "8-5";

    if (pathname === "/" || pathname.startsWith("/super-admin/dashboard")) return "1";
    if (pathname.startsWith("/super-admin/users")) return "2";
    if (pathname.startsWith("/super-admin/settings/raport")) return "3-1";
    if (pathname.startsWith("/super-admin/settings/tahun-ajaran")) return "3-2";
    if (pathname.startsWith("/super-admin/settings/backup-database")) return "3-3";
    if (pathname.startsWith("/super-admin/settings")) return "3";

    // Ortu section
    if (pathname === "/ortu/dashboard") return "6-1";
    if (pathname.startsWith("/ortu/hafalan")) return "6-2";
    if (pathname.startsWith("/ortu/absensi")) return "6-3";
    if (pathname.startsWith("/ortu/target")) return "6-4";
    if (pathname.startsWith("/ortu/raport")) return "6-5";
    if (pathname.startsWith("/ortu/pengumuman")) return "6-6";
    if (pathname.startsWith("/ortu/profil")) return "6-7";

    // Santri section
    if (pathname === "/santri/dashboard") return "8-1";
    if (pathname.startsWith("/santri/hafalan")) return "8-2";
    if (pathname.startsWith("/santri/absensi")) return "8-3";
    if (pathname.startsWith("/santri/raport")) return "8-4";
    if (pathname.startsWith("/santri/notifikasi")) return "8-5";
    if (pathname.startsWith("/santri/profil")) return "8-6";

    // Yayasan section
    if (pathname === "/yayasan/dashboard") return "7-1";
    if (pathname.startsWith("/yayasan/hafalan")) return "7-2";
    if (pathname.startsWith("/yayasan/absensi")) return "7-3";
    if (pathname.startsWith("/yayasan/grafik")) return "7-4";
    if (pathname.startsWith("/yayasan/raport")) return "7-5";
    if (pathname.startsWith("/yayasan/pengumuman")) return "7-6";
    if (pathname.startsWith("/yayasan/aktivitas")) return "7-7";
    if (pathname.startsWith("/yayasan/profil")) return "7-8";

    return "";
  };

  const isAdminSection = pathname.startsWith("/admin");
  const isGuruSection = pathname.startsWith("/guru");
  const isOrtuSection = pathname.startsWith("/ortu");
  const isYayasanSection = pathname.startsWith("/yayasan");
  const isSantriSection = pathname.startsWith("/santri");
  const isSuperAdminSection =
    pathname === "/" ||
    pathname.startsWith("/super-admin") ||
    pathname.startsWith("/users");

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      message.success("Logout berhasil!");
      router.push("/login");
    }
  };

  const navigate = (path: string) => {
    router.push(path);
  };

  return (
    <Sider trigger={null} collapsible collapsed={collapsed} style={{ position: "relative", overflow: "hidden" }}>
      {/* Logo */}
      <div
        style={{
          height: 64,
          margin: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          color: "white",
          fontWeight: "bold",
          fontSize: 18,
        }}
      >
        <img src="/quran.svg" alt="Logo" style={{ height: 32, marginRight: collapsed ? 0 : 8 }} />
        {!collapsed && "Ar-Hapalan"}
      </div>

      {/* Menu Navigasi */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        items={
          isOrtuSection
            ? [
                { key: "6-1", icon: <DashboardOutlined />, label: "Dashboard", onClick: () => navigate("/orang-tua") },
                { key: "6-2", icon: <BookOutlined />, label: "Progres Hafalan", onClick: () => navigate("/ortu/hafalan") },
                { key: "6-3", icon: <CalendarOutlined />, label: "Absensi Anak", onClick: () => navigate("/ortu/absensi") },
                { key: "6-4", icon: <AimOutlined />, label: "Target Hafalan", onClick: () => navigate("/ortu/target") },
                { key: "6-5", icon: <FileDoneOutlined />, label: "Raport & Prestasi", onClick: () => navigate("/ortu/raport") },
                { key: "6-6", icon: <NotificationOutlined />, label: "Pengumuman", onClick: () => navigate("/ortu/pengumuman") },
                { key: "6-7", icon: <UserOutlined />, label: "Profil Anak", onClick: () => navigate("/ortu/profil") },
              ]
            : isYayasanSection
            ? [
                { key: "7-1", icon: <DashboardOutlined />, label: "Dashboard", onClick: () => navigate("/yayasan/dashboard") },
                { key: "7-2", icon: <BookOutlined />, label: "Laporan Hafalan", onClick: () => navigate("/yayasan/hafalan") },
                { key: "7-3", icon: <CalendarOutlined />, label: "Rekap Absensi", onClick: () => navigate("/yayasan/absensi") },
                { key: "7-4", icon: <BarChartOutlined />, label: "Grafik Perkembangan", onClick: () => navigate("/yayasan/grafik") },
                { key: "7-5", icon: <FileDoneOutlined />, label: "Raport Tahfidz", onClick: () => navigate("/yayasan/raport") },
                { key: "7-6", icon: <NotificationOutlined />, label: "Pengumuman", onClick: () => navigate("/yayasan/pengumuman") },
                { key: "7-7", icon: <CheckCircleOutlined />, label: "Monitoring Aktivitas", onClick: () => navigate("/yayasan/aktivitas") },
                { key: "7-8", icon: <UserOutlined />, label: "Profil", onClick: () => navigate("/yayasan/profil") },
              ]
            : isSantriSection
            ? [
                { key: "8-1", icon: <DashboardOutlined />, label: "Dashboard", onClick: () => navigate("/santri/dashboard") },
                { key: "8-2", icon: <BookOutlined />, label: "Hafalan Saya", onClick: () => navigate("/santri/hafalan") },
                { key: "8-3", icon: <CalendarOutlined />, label: "Absensi Saya", onClick: () => navigate("/santri/absensi") },
                { key: "8-4", icon: <FileDoneOutlined />, label: "Raport Saya", onClick: () => navigate("/santri/raport") },
                { key: "8-5", icon: <NotificationOutlined />, label: "Notifikasi", onClick: () => navigate("/santri/notifikasi") },
              ]
            : isGuruSection
            ? [
                { key: "5-1", icon: <DashboardOutlined />, label: "Dashboard", onClick: () => navigate("/guru/dashboard") },
                { key: "5-2", icon: <BookOutlined />, label: "Data Hafalan", onClick: () => navigate("/guru/hafalan") },
                { key: "5-3", icon: <AimOutlined />, label: "Target Hafalan", onClick: () => navigate("/guru/target") },
                { key: "5-4", icon: <CheckCircleOutlined />, label: "Absensi", onClick: () => navigate("/guru/absensi") },
                { key: "5-5", icon: <FileDoneOutlined />, label: "Penilaian Ujian", onClick: () => navigate("/guru/ujian") },
                { key: "5-6", icon: <BarChartOutlined />, label: "Grafik Perkembangan", onClick: () => navigate("/guru/grafik") },
                { key: "5-7", icon: <ProfileOutlined />, label: "Raport Hafalan", onClick: () => navigate("/guru/raport") },
                { key: "5-8", icon: <NotificationOutlined />, label: "Notifikasi", onClick: () => navigate("/guru/notifikasi") },
              ]
            : isAdminSection
            ? [
                { key: "4-1", icon: <DashboardOutlined />, label: "Dashboard", onClick: () => navigate("/admin/dashboard") },
                { key: "4-2", icon: <TeamOutlined />, label: "Halaqah", onClick: () => navigate("/admin/halaqah") },
                { key: "4-3", icon: <CalendarOutlined />, label: "Jadwal", onClick: () => navigate("/admin/jadwal") },
                { key: "4-4", icon: <NotificationOutlined />, label: "Pengumuman", onClick: () => navigate("/admin/pengumuman") },
                { key: "4-5", icon: <BarChartOutlined />, label: "Laporan", onClick: () => navigate("/admin/laporan") },
                { key: "4-6", icon: <SettingFilled />, label: "Settings", onClick: () => navigate("/admin/settings") },
              ]
            : [
                { key: "1", icon: <DashboardOutlined />, label: "Dashboard", onClick: () => navigate("/super-admin/dashboard") },
                { key: "2", icon: <UserOutlined />, label: "Users", onClick: () => navigate("/super-admin/users") },
                {
                  key: "3",
                  icon: <SettingFilled />,
                  label: "Settings",
                  children: [
                    { key: "3-1", label: "Raport", onClick: () => navigate("/super-admin/settings/raport") },
                    { key: "3-2", label: "Tahun Ajaran", onClick: () => navigate("/super-admin/settings/tahun-ajaran") },
                    { key: "3-3", label: "Backup Database", onClick: () => navigate("/super-admin/settings/backup-database") },
                  ],
                },
              ]
        }
      />
    </Sider>
  );
};

export default Sidebar;
