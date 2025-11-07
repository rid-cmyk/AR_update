// src/components/layout/Sidebar.tsx
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { Layout, Menu, message, Badge } from "antd";
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
  CheckCircleOutlined,
  NotificationOutlined,
  BellOutlined,
  TeamOutlined,
  TrophyOutlined,
  FileTextOutlined,
  HomeOutlined,
  DatabaseOutlined,
  SafetyOutlined,
  ControlOutlined,
  ExperimentOutlined,
  FormOutlined,
  SolutionOutlined,
  FileSearchOutlined,
  CloudServerOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}



const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Define section variables first
  const isAdminSection = pathname.startsWith("/admin");
  const isGuruSection = pathname.startsWith("/guru");
  const isOrtuSection = pathname.startsWith("/ortu");
  const isYayasanSection = pathname.startsWith("/yayasan");
  const isSantriSection = pathname.startsWith("/santri");
  const isSuperAdminSection =
    pathname === "/" ||
    pathname.startsWith("/super-admin") ||
    pathname.startsWith("/users");

  // Fetch unread notifications count for super admin
  const fetchUnreadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/forgot-passcode');
      if (!response.ok) return;
      const data = await response.json();
      const unreadCount = data.filter((n: any) => !n.isRead).length;
      setUnreadNotifications(unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Auto refresh notifications for super admin
  useEffect(() => {
    if (isSuperAdminSection) {
      fetchUnreadNotifications();
      const interval = setInterval(fetchUnreadNotifications, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [isSuperAdminSection]);



  const getSelectedKey = () => {
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
    if (pathname.startsWith("/admin/template")) return "admin-5";
    if (pathname.startsWith("/admin/laporan")) return "admin-6";
    if (pathname.startsWith("/admin/settings")) return "admin-7";

    // Guru routes
    if (pathname === "/guru/dashboard") return "guru-1";
    if (pathname === "/guru/hafalan") return "guru-2";
    if (pathname === "/guru/target") return "guru-3";
    if (pathname === "/guru/absensi") return "guru-4";
    if (pathname === "/guru/ujian") return "guru-5";
    if (pathname.startsWith("/guru/ujian")) return "guru-5";
    if (pathname.startsWith("/guru/jadwal")) return "guru-6";
    if (pathname === "/guru/prestasi") return "guru-7";
    if (pathname === "/guru/grafik") return "guru-9";
    if (pathname === "/guru/raport") return "guru-10";
    if (pathname === "/guru/notifikasi") return "guru-11";

    // Ortu routes
    if (pathname === "/ortu/dashboard") return "ortu-1";
    if (pathname.startsWith("/ortu/hafalan")) return "ortu-2";
    if (pathname.startsWith("/ortu/absensi")) return "ortu-3";
    if (pathname.startsWith("/ortu/target")) return "ortu-4";
    if (pathname.startsWith("/ortu/raport")) return "ortu-5";
    if (pathname.startsWith("/ortu/notifikasi") || pathname.startsWith("/ortu/pengumuman")) return "ortu-6";
    if (pathname.startsWith("/ortu/profil")) return "ortu-7";

    // Santri routes
    if (pathname === "/santri/dashboard") return "santri-1";
    if (pathname.startsWith("/santri/hafalan")) return "santri-2";
    if (pathname.startsWith("/santri/absensi")) return "santri-3";
    if (pathname.startsWith("/santri/raport")) return "santri-4";
    if (pathname.startsWith("/santri/notifikasi")) return "santri-5";
    if (pathname.startsWith("/santri/profil")) return "santri-6";

    // Yayasan routes
    if (pathname === "/yayasan/dashboard") return "yayasan-1";
    if (pathname.startsWith("/yayasan/laporan")) return "yayasan-2";
    if (pathname.startsWith("/yayasan/santri")) return "yayasan-3";
    if (pathname.startsWith("/yayasan/raport")) return "yayasan-4";
    if (pathname.startsWith("/yayasan/notifikasi")) return "yayasan-5";
    if (pathname.startsWith("/yayasan/profil")) return "yayasan-6";

    return "";
  };

  const navigate = (path: string) => {
    router.push(path);
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      style={{
        position: "relative",
        overflow: "hidden",
        height: "100vh",
        background: "linear-gradient(180deg, #001529 0%, #002140 50%, #003a70 100%)",
        boxShadow: "4px 0 20px rgba(0, 0, 0, 0.15)",
        borderRight: "1px solid rgba(255, 255, 255, 0.1)"
      }}
    >
      {/* Logo Section */}
      <div
        style={{
          height: 64,
          margin: "16px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          color: "white",
          fontWeight: "bold",
          fontSize: 18,
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: 12,
          padding: "8px 12px",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          transition: "all 0.3s ease"
        }}
      >
        <img src="/quran.svg" alt="Logo" style={{ height: 32, marginRight: collapsed ? 0 : 8 }} />
        {!collapsed && (
          <span style={{
            background: "linear-gradient(135deg, #fff 0%, #e6f7ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontWeight: 800,
            letterSpacing: "-0.5px"
          }}>
            Ar-Hapalan
          </span>
        )}
      </div>


      {/* Menu Navigasi */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        style={{
          background: "transparent",
          border: "none",
          fontSize: 14,
          height: "calc(100vh - 96px)",
          overflowY: "auto"
        }}
        items={
          isOrtuSection
            ? [
              {
                key: "ortu-1",
                icon: <HomeOutlined style={{ fontSize: 16 }} />,
                label: "Dashboard Anak",
                onClick: () => navigate("/ortu/dashboard"),
                style: { margin: "4px 8px", borderRadius: 8 }
              },
              {
                key: "ortu-2",
                icon: <BookOutlined style={{ fontSize: 16 }} />,
                label: "Progres Hafalan",
                onClick: () => navigate("/ortu/hafalan"),
                style: { margin: "4px 8px", borderRadius: 8 }
              },
              {
                key: "ortu-3",
                icon: <CheckCircleOutlined style={{ fontSize: 16 }} />,
                label: "Absensi Anak",
                onClick: () => navigate("/ortu/absensi"),
                style: { margin: "4px 8px", borderRadius: 8 }
              },
              {
                key: "ortu-4",
                icon: <AimOutlined style={{ fontSize: 16 }} />,
                label: "Target Hafalan",
                onClick: () => navigate("/ortu/target"),
                style: { margin: "4px 8px", borderRadius: 8 }
              },
              {
                key: "ortu-5",
                icon: <FileDoneOutlined style={{ fontSize: 16 }} />,
                label: "Raport & Prestasi",
                onClick: () => navigate("/ortu/raport"),
                style: { margin: "4px 8px", borderRadius: 8 }
              },
              {
                key: "ortu-6",
                icon: <NotificationOutlined style={{ fontSize: 16 }} />,
                label: "Notifikasi",
                onClick: () => navigate("/ortu/notifikasi"),
                style: { margin: "4px 8px", borderRadius: 8 }
              },
            ]
            : isYayasanSection
              ? [
                {
                  key: "yayasan-1",
                  icon: <HomeOutlined style={{ fontSize: 16 }} />,
                  label: "Dashboard",
                  onClick: () => navigate("/yayasan/dashboard"),
                  style: { margin: "4px 8px", borderRadius: 8 }
                },
                {
                  key: "yayasan-2",
                  icon: <BookOutlined style={{ fontSize: 16 }} />,
                  label: "Laporan",
                  onClick: () => navigate("/yayasan/laporan"),
                  style: { margin: "4px 8px", borderRadius: 8 }
                },
                {
                  key: "yayasan-3",
                  icon: <TeamOutlined style={{ fontSize: 16 }} />,
                  label: "Data Santri",
                  onClick: () => navigate("/yayasan/santri"),
                  style: { margin: "4px 8px", borderRadius: 8 }
                },
                {
                  key: "yayasan-4",
                  icon: <FileDoneOutlined style={{ fontSize: 16 }} />,
                  label: "Raport Tahfidz",
                  onClick: () => navigate("/yayasan/raport"),
                  style: { margin: "4px 8px", borderRadius: 8 }
                },
                {
                  key: "yayasan-5",
                  icon: <NotificationOutlined style={{ fontSize: 16 }} />,
                  label: "Notifikasi",
                  onClick: () => navigate("/yayasan/notifikasi"),
                  style: { margin: "4px 8px", borderRadius: 8 }
                },
              ]
              : isSantriSection
                ? [
                  {
                    key: "santri-1",
                    icon: <HomeOutlined style={{ fontSize: 16 }} />,
                    label: "Dashboard",
                    onClick: () => navigate("/santri/dashboard"),
                    style: { margin: "4px 8px", borderRadius: 8 }
                  },
                  {
                    key: "santri-2",
                    icon: <BookOutlined style={{ fontSize: 16 }} />,
                    label: "Hafalan Saya",
                    onClick: () => navigate("/santri/hafalan"),
                    style: { margin: "4px 8px", borderRadius: 8 }
                  },
                  {
                    key: "santri-3",
                    icon: <CalendarOutlined style={{ fontSize: 16 }} />,
                    label: "Absensi Saya",
                    onClick: () => navigate("/santri/absensi"),
                    style: { margin: "4px 8px", borderRadius: 8 }
                  },
                  {
                    key: "santri-4",
                    icon: <FileDoneOutlined style={{ fontSize: 16 }} />,
                    label: "Raport Saya",
                    onClick: () => navigate("/santri/raport"),
                    style: { margin: "4px 8px", borderRadius: 8 }
                  },
                  {
                    key: "santri-5",
                    icon: <NotificationOutlined style={{ fontSize: 16 }} />,
                    label: "Notifikasi",
                    onClick: () => navigate("/santri/notifikasi"),
                    style: { margin: "4px 8px", borderRadius: 8 }
                  },
                ]
                : isGuruSection
                  ? [
                    {
                      key: "guru-1",
                      icon: <HomeOutlined style={{ fontSize: 16 }} />,
                      label: "Dashboard",
                      onClick: () => navigate("/guru/dashboard"),
                      style: { margin: "4px 8px", borderRadius: 8 }
                    },
                    {
                      key: "guru-2",
                      icon: <BookOutlined style={{ fontSize: 16 }} />,
                      label: "Data Hafalan",
                      onClick: () => navigate("/guru/hafalan"),
                      style: { margin: "4px 8px", borderRadius: 8 }
                    },
                    {
                      key: "guru-3",
                      icon: <AimOutlined style={{ fontSize: 16 }} />,
                      label: "Target Hafalan",
                      onClick: () => navigate("/guru/target"),
                      style: { margin: "4px 8px", borderRadius: 8 }
                    },
                    {
                      key: "guru-4",
                      icon: <CheckCircleOutlined style={{ fontSize: 16 }} />,
                      label: "Absensi",
                      onClick: () => navigate("/guru/absensi"),
                      style: { margin: "4px 8px", borderRadius: 8 }
                    },
                    {
                      key: "guru-5",
                      icon: <FileDoneOutlined style={{ fontSize: 16 }} />,
                      label: "Penilaian Ujian",
                      onClick: () => navigate("/guru/ujian"),
                      style: { margin: "4px 8px", borderRadius: 8 }
                    },

                    {
                      key: "guru-6",
                      icon: <CalendarOutlined style={{ fontSize: 16 }} />,
                      label: "Jadwal Mengajar",
                      onClick: () => navigate("/guru/jadwal"),
                      style: { margin: "4px 8px", borderRadius: 8 }
                    },
                    {
                      key: "guru-7",
                      icon: <TrophyOutlined style={{ fontSize: 16 }} />,
                      label: "Prestasi Santri",
                      onClick: () => navigate("/guru/prestasi"),
                      style: { margin: "4px 8px", borderRadius: 8 }
                    },
                    {
                      key: "guru-9",
                      icon: <BarChartOutlined style={{ fontSize: 16 }} />,
                      label: "Grafik Progress",
                      onClick: () => navigate("/guru/grafik"),
                      style: { margin: "4px 8px", borderRadius: 8 }
                    },
                    {
                      key: "guru-10",
                      icon: <ProfileOutlined style={{ fontSize: 16 }} />,
                      label: "Raport Hafalan",
                      onClick: () => navigate("/guru/raport"),
                      style: { margin: "4px 8px", borderRadius: 8 }
                    },
                    {
                      key: "guru-11",
                      icon: <NotificationOutlined style={{ fontSize: 16 }} />,
                      label: "Notifikasi",
                      onClick: () => navigate("/guru/notifikasi"),
                      style: { margin: "4px 8px", borderRadius: 8 }
                    },
                  ]
                  : isAdminSection
                    ? [
                      {
                        key: "admin-1",
                        icon: <HomeOutlined style={{ fontSize: 16 }} />,
                        label: "Dashboard",
                        onClick: () => navigate("/admin/dashboard"),
                        style: { margin: "4px 8px", borderRadius: 8 }
                      },
                      {
                        key: "admin-2",
                        icon: <TeamOutlined style={{ fontSize: 16 }} />,
                        label: "Kelola Halaqah",
                        onClick: () => navigate("/admin/halaqah"),
                        style: { margin: "4px 8px", borderRadius: 8 }
                      },
                      {
                        key: "admin-3",
                        icon: <CalendarOutlined style={{ fontSize: 16 }} />,
                        label: "Jadwal Kegiatan",
                        onClick: () => navigate("/admin/jadwal"),
                        style: { margin: "4px 8px", borderRadius: 8 }
                      },
                      {
                        key: "admin-4",
                        icon: <NotificationOutlined style={{ fontSize: 16 }} />,
                        label: "Pengumuman",
                        onClick: () => navigate("/admin/pengumuman"),
                        style: { margin: "4px 8px", borderRadius: 8 }
                      },
                      {
                        key: "admin-5",
                        icon: <FileTextOutlined style={{ fontSize: 16 }} />,
                        label: "Template System",
                        onClick: () => navigate("/admin/template"),
                        style: { margin: "4px 8px", borderRadius: 8 }
                      },

                      {
                        key: "admin-6",
                        icon: <BarChartOutlined style={{ fontSize: 16 }} />,
                        label: "Laporan & Analisis",
                        onClick: () => navigate("/admin/laporan"),
                        style: { margin: "4px 8px", borderRadius: 8 }
                      },
                      {
                        key: "admin-7",
                        icon: <SettingFilled style={{ fontSize: 16 }} />,
                        label: "Pengaturan",
                        onClick: () => navigate("/admin/settings"),
                        style: { margin: "4px 8px", borderRadius: 8 }
                      },
                    ]
                    : [
                      {
                        key: "super-1",
                        icon: <HomeOutlined style={{ fontSize: 16 }} />,
                        label: "Dashboard",
                        onClick: () => navigate("/super-admin/dashboard"),
                        style: { margin: "4px 8px", borderRadius: 8 }
                      },
                      {
                        key: "super-2",
                        icon: <UserOutlined style={{ fontSize: 16 }} />,
                        label: "User Management",
                        onClick: () => navigate("/super-admin/users"),
                        style: { margin: "4px 8px", borderRadius: 8 }
                      },
                      {
                        key: "super-3",
                        icon: <BellOutlined style={{ fontSize: 16 }} />,
                        label: (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span>Notifikasi</span>
                            {unreadNotifications > 0 && (
                              <Badge
                                count={unreadNotifications}
                                size="small"
                                style={{
                                  backgroundColor: '#ff4d4f',
                                  fontSize: '10px',
                                  minWidth: '16px',
                                  height: '16px',
                                  lineHeight: '16px',
                                  borderRadius: '8px',
                                  marginLeft: '8px'
                                }}
                              />
                            )}
                          </div>
                        ),
                        onClick: () => navigate("/super-admin/notifications/forgot-passcode"),
                        style: { margin: "4px 8px", borderRadius: 8 }
                      },
                      {
                        key: "super-4",
                        icon: <DatabaseOutlined style={{ fontSize: 16 }} />,
                        label: "Database Backup",
                        onClick: () => navigate("/super-admin/settings/backup-database"),
                        style: { margin: "4px 8px", borderRadius: 8 }
                      },
                    ]
        }
      />



      {/* Custom CSS untuk styling menu */}
      <style jsx>{`
        :global(.ant-layout-sider) {
          background: linear-gradient(180deg, #001529 0%, #002140 50%, #003a70 100%) !important;
        }

        :global(.ant-menu-dark .ant-menu-item-selected) {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%) !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          backdrop-filter: blur(10px) !important;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
        }

        :global(.ant-menu-dark .ant-menu-item:hover) {
          background: rgba(255, 255, 255, 0.15) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          backdrop-filter: blur(8px) !important;
          transform: translateX(4px) !important;
          transition: all 0.3s ease !important;
        }

        :global(.ant-menu-dark .ant-menu-item) {
          color: rgba(255, 255, 255, 0.9) !important;
          font-weight: 500 !important;
          transition: all 0.3s ease !important;
          border: 1px solid transparent !important;
        }

        :global(.ant-menu-dark .ant-menu-item .anticon) {
          color: rgba(255, 255, 255, 0.8) !important;
        }

        :global(.ant-menu-dark .ant-menu-item-selected .anticon) {
          color: #fff !important;
        }

        /* Custom scrollbar for menu */
        :global(.ant-menu-dark) {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }

        :global(.ant-menu-dark::-webkit-scrollbar) {
          width: 6px;
        }

        :global(.ant-menu-dark::-webkit-scrollbar-track) {
          background: transparent;
        }

        :global(.ant-menu-dark::-webkit-scrollbar-thumb) {
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        :global(.ant-menu-dark::-webkit-scrollbar-thumb:hover) {
          background-color: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </Sider>
  );
};

export default Sidebar;