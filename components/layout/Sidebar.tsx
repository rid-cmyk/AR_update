// src/components/layout/Sidebar.tsx
"use client";

import React from "react";
import Image from "next/image";
import { Layout, Menu, Button } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { getSelectedKey, getOpenKeys, getSidebarMenuItems } from "./SidebarMenus";
import styles from "./Sidebar.module.css";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const pathname = usePathname();
  const router = useRouter();

  const navigate = (path: string) => {
    router.push(path);
  };

  const menuItems = getSidebarMenuItems({
    pathname,
    navigate,
  });

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={230}
      collapsedWidth={80}
      className={styles.sider}
    >
      {/* Signature: faint arabesque / geometric watermark, subtle, full height */}
      <svg
        aria-hidden="true"
        className={styles.signatureSvg}
      >
        <defs>
          <pattern
            id="ar-geo"
            width="56"
            height="56"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(0)"
          >
            <path
              d="M28 0 L56 28 L28 56 L0 28 Z"
              fill="none"
              stroke="#5FD3C4"
              strokeWidth="1"
            />
            <circle cx="28" cy="28" r="4" fill="none" stroke="#5FD3C4" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ar-geo)" />
      </svg>

      {/* Logo Section */}
      <div className={styles.logoSection} style={{ justifyContent: collapsed ? "center" : "space-between" }}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIconWrapper}>
            <Image
              src="/quran.svg"
              alt="Logo"
              width={24}
              height={24}
              className={styles.logoImage}
            />
          </div>

          {!collapsed && (
            <div className={styles.brandTextWrapper}>
              <div className={styles.brandTitle}>
                AR-Hafalan
              </div>
              <div className={styles.brandSubtitle}>
                Manajemen Hafalan
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tombol Sidebar (Direct child of Sider for stable animation) */}
      <Button
        type="primary"
        shape="circle"
        size="small"
        icon={collapsed ? <RightOutlined style={{ fontSize: 12, color: "#fff" }} /> : <LeftOutlined style={{ fontSize: 12, color: "#fff" }} />}
        onClick={() => setCollapsed(!collapsed)}
        className={styles.toggleBtn}
      />

      {/* Divider under logo */}
      <div className={styles.divider} />

      {/* Menu Navigasi */}
      <div className={styles.menuContainer}>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey(pathname)]}
          openKeys={getOpenKeys(pathname)}
          className={styles.menu}
          items={menuItems}
        />
        {/* fade mask at the bottom of the scrollable menu */}
        <div className={styles.menuFadeMask} />
      </div>

      {/* System Info Footer */}
      <div className={`${styles.footer} ${collapsed ? styles.footerCollapsed : styles.footerExpanded}`}>
        {collapsed ? (
          <span
            title="Online • v2.0"
            className={`${styles.pulseDotBase} ${styles.pulseDotCollapsed} ${styles.pulseDot}`}
          />
        ) : (
          <>
            <div className={styles.statusIndicatorContainer}>
              <span
                className={`${styles.pulseDotBase} ${styles.pulseDotExpanded} ${styles.pulseDot}`}
              />
              AR-Hafalan
            </div>
            <div className={styles.footerMeta}>
              v2.0 · Auto-refresh 30s
            </div>
          </>
        )}
      </div>
    </Sider>
  );
};

export default Sidebar;