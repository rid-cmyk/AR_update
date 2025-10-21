"use client";

import React, { Children, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DashboardOutlined,
  UserOutlined,
  PlusOutlined,
  TeamOutlined,
  SettingFilled,
} from "@ant-design/icons";

interface MobileMenuProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    key: "1",
    icon: <DashboardOutlined />,
    label: "Dashboard",
    link: "/",
  },
  {
    key: "2",
    icon: <UserOutlined />,
    label: "User",
    children: [
      {
        key: "2-1",
        icon: <PlusOutlined />,
        label: "Add Users",
        link: "/users",
      },
      {
        key: "2-2",
        icon: <TeamOutlined />,
        label: "Add Roles",
        link: "/roles",
      },
    ],
  },
  {
    key: "3",
    icon: <SettingFilled />,
    label: "Settings",
    children: [
      { key: "3-1", 
        icon: <SettingFilled />, 
        label: "Settings",
        link: "/settings"
      },
      { key: "3-2",
        icon: <SettingFilled />, 
        label: "Tahun Ajaran", 
        link: "/settings/tahun-ajaran" 
      },
      { key: "3-3", 
        icon: <SettingFilled />, 
        label: "Backup Database", 
        link: "/settings/backup-database" 
      },
    ],
  },
];

const MobileMenu: React.FC<MobileMenuProps> = ({ children }) => {
  const [openUserDropdown, setOpenUserDropdown] = useState(false);
  const pathname = usePathname();

  const getActiveKey = () => {
    if (pathname === "/") return "1";
    if (pathname.startsWith("/users")) return "2-1";
    if (pathname.startsWith("/roles")) return "2-2";
    if (pathname.startsWith("/settings")) return "3";
    return "";
  };
  const activeKey = getActiveKey();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Logo */}
      <div
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#001529",
          color: "white",
          fontWeight: "bold",
          fontSize: 18,
        }}
      >
        Ar-Hapalan
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>{children}</div>

      {/* Bottom Menu */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          height: 70,
          borderTop: "1px solid #eee",
          background: "#fff",
          boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
          position: "sticky",
          bottom: 0,
          zIndex: 1000,
        }}
      >
        {menuItems.map((item) => {
          if (item.children) {
            // User menu dengan popup
            return (
              <div key={item.key} style={{ position: "relative", textAlign: "center" }}>
                <div
                  onClick={() => setOpenUserDropdown(!openUserDropdown)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                    color: activeKey.startsWith("2") ? "#1890ff" : "#555",
                  }}
                >
                  <div style={{ fontSize: 24 }}>{item.icon}</div>
                  <div style={{ fontSize: 12, marginTop: 2 }}>{item.label}</div>
                </div>

                {/* Popup Submenu */}
                {openUserDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "70px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#fff",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      borderRadius: 8,
                      padding: 8,
                      minWidth: 140,
                      zIndex: 2000,
                    }}
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.key}
                        href={child.link}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "6px 12px",
                          textDecoration: "none",
                          color: pathname === child.link ? "#1890ff" : "#555",
                          fontWeight: pathname === child.link ? "bold" : "normal",
                          fontSize: 12,
                        }}
                        onClick={() => setOpenUserDropdown(false)}
                      >
                        <div style={{ fontSize: 16 }}>{child.icon}</div>
                        <span style={{ marginLeft: 6 }}>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // Menu biasa
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
                color: activeKey === item.key ? "#1890ff" : "#555",
                fontWeight: activeKey === item.key ? "bold" : "normal",
              }}
            >
              <div style={{ fontSize: 24 }}>{item.icon}</div>
              <div style={{ fontSize: 12, marginTop: 2 }}>{item.label}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileMenu;
