"use client";

import React, { useState, useEffect } from "react";
import { Layout } from "antd";
import { useMediaQuery } from "react-responsive";
import Sidebar from "./Sidebar";
import HeaderBar from "./HeaderBar";
import MobileMenu from "./MobileMenu";
import FABChatGuru from "@/components/mobile/FABChatGuru";
import styles from "./LayoutApp.module.css";

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
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout 
        className={styles.contentLayout}
        style={{ marginLeft: collapsed ? 100 : 240 }}
      >
        <Layout.Header
          className={styles.headerWrapper}
          style={{ left: collapsed ? 104 : 264 }}
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
