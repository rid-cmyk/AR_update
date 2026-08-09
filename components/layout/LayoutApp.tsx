"use client";

import React, { useState, useEffect } from "react";
import { Layout } from "antd";
import { useMediaQuery } from "react-responsive";
import dynamic from "next/dynamic";
import styles from "./LayoutApp.module.css";

const Sidebar = dynamic(() => import("./Sidebar"), { ssr: false });
const HeaderBar = dynamic(() => import("./HeaderBar"), { ssr: false });
const MobileMenu = dynamic(() => import("./MobileMenu"), { ssr: false });
const FABChatGuru = dynamic(() => import("@/components/mobile/FABChatGuru"), { ssr: false });

const LayoutApp: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const isMobileQuery = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isMobile = isMounted ? isMobileQuery : false;

  return isMobile ? (
    <>
      <MobileMenu>{children}</MobileMenu>
      <FABChatGuru />
    </>
  ) : (
    <Layout className={styles.mainLayout}>
      <Layout.Sider
        className={styles.siderWrapper}
        collapsed={collapsed}
        trigger={null}
        width={200}
        collapsedWidth={80}
      >
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </Layout.Sider>
      <Layout 
        className={styles.contentLayout}
        style={{ marginLeft: collapsed ? 80 : 200 }}
      >
        <Layout.Header
          className={styles.headerWrapper}
          style={{ left: collapsed ? 80 : 200 }}
        >
          <HeaderBar collapsed={collapsed} />
        </Layout.Header>
        <Layout.Content className={styles.contentWrapper}>
          <div className={styles.contentInner}>
            {children}
          </div>
        </Layout.Content>
      </Layout>

      <FABChatGuru />
    </Layout>
  );
};

export default LayoutApp;
