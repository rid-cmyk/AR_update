/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { Layout, Menu, Tooltip } from "antd";
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
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const pathname = usePathname();
  const router = useRouter();

  // ✅ Fungsi menentukan menu yang sedang aktif berdasarkan path URL
  const getSelectedKey = () => {
    // === Super Admin Section ===
    if (pathname === "/" || pathname.startsWith("/super-admin")) return "1";
    if (pathname.startsWith("/users")) return "2";
    if (pathname.startsWith("/settings/raport")) return "3-1";
    if (pathname.startsWith("/settings/tahun-ajaran")) return "3-2";
    if (pathname.startsWith("/settings/backup-database")) return "3-3";
    if (pathname.startsWith("/settings")) return "3";

    // === Admin Section ===
    if (pathname === "/admin" || pathname.startsWith("/admin/dashboard")) return "4-1";
    if (pathname.startsWith("/admin/halaqah")) return "4-2";
    if (pathname.startsWith("/admin/jadwal")) return "4-3";
    if (pathname.startsWith("/admin/pengumuman")) return "4-4";
    if (pathname.startsWith("/admin/laporan")) return "4-5";
    if (pathname.startsWith("/admin/settings")) return "4-6";

    // === Guru Section ===
    if (pathname === "/guru/dashboard") return "5-1";
    if (pathname === "/guru/hafalan") return "5-2";
    if (pathname === "/guru/target") return "5-3";
    if (pathname === "/guru/absensi") return "5-4";
    if (pathname === "/guru/ujian") return "5-5";
    if (pathname === "/guru/grafik") return "5-6";
    if (pathname === "/guru/raport") return "5-7";
    if (pathname === "/guru/notifikasi") return "5-8";
    if (pathname === "/guru/profil") return "5-9";

    return "";
  };

  // ✅ Penanda halaman berdasarkan role
  const isAdminSection = pathname.startsWith("/admin");
  const isGuruSection = pathname.startsWith("/guru");
  const isSuperAdminSection =
    pathname === "/" ||
    pathname.startsWith("/super-admin") ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/settings");

  // ✅ Fungsi Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // ✅ Navigasi manual untuk item menu
  const navigate = (path: string) => {
    router.push(path);
  };


  // ✅ Navigasi manual untuk item menu
  const navigate = (path: string) => {
    router.push(path);
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* 🔰 Logo Sidebar */}
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
        <img
          src="/quran.svg"
          alt="Logo"
          style={{ height: 32, marginRight: collapsed ? 0 : 8 }}
        />
        {!collapsed && "Ar-Hapalan"}
      </div>

      {/* 📜 Menu Navigasi */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        items={
          // Jika guru login
          isGuruSection
            ? [
                {
                  key: "5-1",
                  icon: <DashboardOutlined />,
                  label: "Dashboard",
                  onClick: () => navigate("/guru/dashboard"),
                },
                {
                  key: "5-2",
                  icon: <BookOutlined />,
                  label: "Data Hafalan",
                  onClick: () => navigate("/guru/hafalan"),
                },
                {
                  key: "5-3",
                  icon: <AimOutlined />,
                  label: "Target Hafalan",
                  onClick: () => navigate("/guru/target"),
                },
                {
                  key: "5-4",
                  icon: <CheckCircleOutlined />,
                  label: "Absensi",
                  onClick: () => navigate("/guru/absensi"),
                },
                {
                  key: "5-5",
                  icon: <FileDoneOutlined />,
                  label: "Penilaian Ujian",
                  onClick: () => navigate("/guru/ujian"),
                },
                {
                  key: "5-6",
                  icon: <BarChartOutlined />,
                  label: "Grafik Perkembangan",
                  onClick: () => navigate("/guru/grafik"),
                },
                {
                  key: "5-7",
                  icon: <ProfileOutlined />,
                  label: "Raport Hafalan",
                  onClick: () => navigate("/guru/raport"),
                },
                {
                  key: "5-8",
                  icon: <NotificationOutlined />,
                  label: "Notifikasi",
                  onClick: () => navigate("/guru/notifikasi"),
                },
                {
                  key: "5-9",
                  icon: <UserOutlined />,
                  label: "Profil",
                  onClick: () => navigate("/guru/profil"),
                },
              ]
            : // Jika admin login
            isAdminSection
            ? [
                {
                  key: "4-1",
                  icon: <DashboardOutlined />,
                  label: "Dashboard",
                  onClick: () => navigate("/admin/dashboard"),
                },
                {
                  key: "4-2",
                  icon: <TeamOutlined />,
                  label: "Halaqah",
                  onClick: () => navigate("/admin/halaqah"),
                },
                {
                  key: "4-3",
                  icon: <CalendarOutlined />,
                  label: "Jadwal",
                  onClick: () => navigate("/admin/jadwal"),
                },
                {
                  key: "4-4",
                  icon: <NotificationOutlined />,
                  label: "Pengumuman",
                  onClick: () => navigate("/admin/pengumuman"),
                },
                {
                  key: "4-5",
                  icon: <BarChartOutlined />,
                  label: "Laporan",
                  onClick: () => navigate("/admin/laporan"),
                },
                {
                  key: "4-6",
                  icon: <SettingFilled />,
                  label: "Settings",
                  onClick: () => navigate("/admin/settings"),
                },
              ]
            : // Jika super admin login
              [
                {
                  key: "1",
                  icon: <DashboardOutlined />,
                  label: "Dashboard",
                  onClick: () => navigate("/super-admin"),
                },
                {
                  key: "2",
                  icon: <UserOutlined />,
                  label: "Users",
                  onClick: () => navigate("/users"),
                },
                {
                  key: "3",
                  icon: <SettingFilled />,
                  label: "Settings",
                  children: [
                    {
                      key: "3-1",
                      label: "Raport",
                      onClick: () => navigate("/settings/raport"),
                    },
                    {
                      key: "3-2",
                      label: "Tahun Ajaran",
                      onClick: () => navigate("/settings/tahun-ajaran"),
                    },
                    {
                      key: "3-3",
                      label: "Backup Database",
                      onClick: () => navigate("/settings/backup-database"),
                    },
                  ],
                },
              ]
        }
      />

      {/* 🌿 Tombol Logout Melingkar */}
      <Tooltip title="Logout" placement="right">
        <div
          role="button"
          tabIndex={0}
          onClick={handleLogout}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleLogout();
          }}
          style={{
            position: "absolute",
            bottom: 30,
            left: "50%",
            transform: "translateX(-50%)",
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "radial-gradient(circle, #2ecc71, #f1c40f)",
            boxShadow: "0 0 20px 5px rgba(241, 196, 15, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            overflow: "hidden",
          }}
        >
          <LogoutOutlined style={{ fontSize: 22, color: "white", zIndex: 2 }} />

          {/* ✨ Tulisan "Bismillah" Berputar Melingkar */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "spin 8s linear infinite",
              zIndex: 1,
            }}
          >
            <svg viewBox="0 0 100 100" width="90" height="90">
              <defs>
                <path
                  id="circlePath"
                  d="M50,50 m-40,0 a40,40 0 1,1 80,0 a40,40 0 1,1 -80,0"
                />
              </defs>
              <text fill="white" fontSize="8" fontWeight="bold" letterSpacing="2">
                <textPath href="#circlePath" startOffset="0%">
                  B I S M I L L A H • B I S M I L L A H •
                </textPath>
              </text>
            </svg>
          </div>
        </div>
      </Tooltip>
    </Sider>
  );
};

export default Sidebar;
