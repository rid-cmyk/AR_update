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
    <Layout style={{ 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f0f2f5 0%, #e6f7ff 100%)"
    }}>
      <Layout.Sider
        style={{
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          zIndex: 1000,
          overflow: 'auto',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.08)',
        }}
        collapsed={collapsed}
        trigger={null}
        width={200}
        collapsedWidth={80}
      >
        <Sidebar collapsed={collapsed} />
      </Layout.Sider>
      <Layout style={{ 
        marginLeft: collapsed ? 80 : 200, 
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: '100vh'
      }}>
        <Layout.Header
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            left: collapsed ? 80 : 200,
            zIndex: 999,
            padding: 0,
            height: 64,
            background: 'transparent',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            backdropFilter: 'blur(20px)',
            transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <HeaderBar collapsed={collapsed} setCollapsed={setCollapsed} bgColor="transparent" />
        </Layout.Header>
        <Layout.Content
          style={{
            marginTop: 64,
            padding: '24px 24px 24px 24px',
            minHeight: 'calc(100vh - 64px)',
            background: "transparent",
            position: 'relative'
          }}
        >
          <div style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: 16,
            padding: 24,
            minHeight: 'calc(100vh - 112px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)'
          }}>
            {children}
          </div>
        </Layout.Content>
      </Layout>

      {/* Global Styles */}
      <style jsx global>{`
        /* Custom scrollbar for the entire app */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
          transition: background 0.3s ease;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }

        /* Enhanced Ant Design component styling */
        .ant-card {
          border-radius: 12px !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06) !important;
          border: 1px solid rgba(0, 0, 0, 0.06) !important;
          backdrop-filter: blur(10px) !important;
        }

        .ant-card-head {
          border-bottom: 1px solid rgba(0, 0, 0, 0.06) !important;
          border-radius: 12px 12px 0 0 !important;
        }

        .ant-btn-primary {
          background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%) !important;
          border: none !important;
          box-shadow: 0 4px 15px rgba(24, 144, 255, 0.3) !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .ant-btn-primary:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 25px rgba(24, 144, 255, 0.4) !important;
        }

        .ant-table {
          border-radius: 12px !important;
          overflow: hidden !important;
        }

        .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%) !important;
          border-bottom: 2px solid #e8e8e8 !important;
          font-weight: 600 !important;
        }

        .ant-modal {
          backdrop-filter: blur(8px) !important;
        }

        .ant-modal-content {
          border-radius: 16px !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }

        .ant-modal-header {
          border-radius: 16px 16px 0 0 !important;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06) !important;
        }

        /* Loading and transition effects */
        .page-transition-enter {
          opacity: 0;
          transform: translateY(20px);
        }

        .page-transition-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
      `}</style>
    </Layout>
  );
};

export default LayoutApp;
