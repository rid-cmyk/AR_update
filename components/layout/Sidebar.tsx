// src/components/layout/Sidebar.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Layout, Menu } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { getSelectedKey, getOpenKeys, getSidebarMenuItems } from "./SidebarMenus";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const isSuperAdminSection =
    pathname.startsWith("/super-admin") || pathname.startsWith("/users");

  const fetchUnreadNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/forgot-passcode");
      if (!response.ok) return;
      const data = await response.json();
      const unreadCount = data.filter(
        (n: Record<string, unknown>) => !n.isRead
      ).length;
      setUnreadNotifications(unreadCount);
    } catch (error) {
      console.warn(
        "Error fetching notifications (server might be restarting):",
        error
      );
    }
  }, []);

  useEffect(() => {
    if (isSuperAdminSection) {
      fetchUnreadNotifications();
      const interval = setInterval(fetchUnreadNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [isSuperAdminSection, fetchUnreadNotifications]);

  const navigate = (path: string) => {
    router.push(path);
  };

  const menuItems = getSidebarMenuItems({
    pathname,
    navigate,
    unreadNotifications,
  });

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      style={{
        position: "relative",
        overflow: "hidden",
        height: "100vh",
        background:
          "linear-gradient(180deg, #001529 0%, #002140 50%, #003a70 100%)",
        boxShadow: "4px 0 20px rgba(0, 0, 0, 0.15)",
        borderRight: "1px solid rgba(255, 255, 255, 0.1)",
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
          transition: "all 0.3s ease",
        }}
      >
        <Image
          src="/quran.svg"
          alt="Logo"
          width={32}
          height={32}
          style={{ height: 32, marginRight: collapsed ? 0 : 8 }}
        />
        {!collapsed && (
          <span
            style={{
              background: "linear-gradient(135deg, #fff 0%, #e6f7ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontWeight: 800,
              letterSpacing: "-0.5px",
            }}
          >
            Ar-Hapalan
          </span>
        )}
      </div>

      {/* Menu Navigasi */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[getSelectedKey(pathname)]}
        openKeys={getOpenKeys(pathname)}
        style={{
          background: "transparent",
          border: "none",
          fontSize: 14,
          height: "calc(100vh - 96px)",
          overflowY: "auto",
        }}
        items={menuItems}
      />

      {/* Global styling for dark theme ant menu */}
      <style jsx>{`
        :global(.ant-menu-dark .ant-menu-item-selected) {
          background: linear-gradient(
            135deg,
            rgba(24, 144, 255, 0.9) 0%,
            rgba(24, 144, 255, 0.7) 100%
          ) !important;
          border-radius: 8px !important;
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

        :global(.ant-menu-dark .ant-menu-submenu),
        :global(.ant-menu-dark .ant-menu-submenu .ant-menu),
        :global(.ant-menu-dark .ant-menu-sub) {
          background: transparent !important;
        }

        :global(.ant-menu-dark .ant-menu-submenu-title:hover) {
          background: rgba(255, 255, 255, 0.1) !important;
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