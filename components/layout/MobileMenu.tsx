"use client";

import React from "react";
import MobileTabBar from "@/components/mobile/MobileTabBar";

interface MobileMenuProps {
  children: React.ReactNode;
}

export default function MobileMenu({ children }: MobileMenuProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        background: "#f8fafc",
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          background: "#023047",
          color: "#ffffff",
          fontWeight: 700,
          fontSize: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>📖</span>
          <span>AR-Hapalan</span>
        </div>
      </div>

      {/* Main Content Viewport */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 12px",
          paddingBottom: "calc(96px + env(safe-area-inset-bottom, 12px))",
        }}
      >
        {children}
      </div>

      {/* Bottom Navigation Bar (sama dengan mobile admin) */}
      <MobileTabBar />
    </div>
  );
}
