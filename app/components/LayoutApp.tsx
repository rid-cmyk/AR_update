"use client";

import React, { useState } from "react";
import { Layout } from "antd";
import Sidebar from "./Sidebar";
import HeaderBar from "./HeaderBar";
import MobileMenu from "./MobileMenu";
import { useMediaQuery } from "react-responsive";

const LayoutApp: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return isMobile ? (
    <MobileMenu>{children}</MobileMenu>
  ) : (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Sider
        style={{
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          zIndex: 1000,
          overflow: 'auto'
        }}
        collapsed={collapsed}
        trigger={null}
      >
        <Sidebar collapsed={collapsed} />
      </Layout.Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Layout.Header
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            left: collapsed ? 80 : 200,
            zIndex: 999,
            padding: 0,
            background: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'left 0.2s'
          }}
        >
          <HeaderBar collapsed={collapsed} setCollapsed={setCollapsed} bgColor="white" />
        </Layout.Header>
        <Layout.Content
          style={{
            marginTop: 64,
            padding: 24,
            minHeight: 'calc(100vh - 64px)',
            background: "#f5f5f5",
          }}
        >
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

export default LayoutApp;
