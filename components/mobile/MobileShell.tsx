"use client";

import React from "react";
import MobileHeader from "./MobileHeader";
import MobileTabBar from "./MobileTabBar";
import { useHideOnScroll } from "@/hooks/useHideOnScroll";

interface MobileShellProps {
  children: React.ReactNode;
  userName?: string;
  roleTitle?: string;
  unreadNotifications?: number;
  headerExtra?: React.ReactNode;
}

export default function MobileShell({
  children,
  userName = "Guru Halaqah",
  roleTitle = "Guru",
  unreadNotifications = 2,
  headerExtra,
}: MobileShellProps) {
  const barHidden = useHideOnScroll();

  return (
    <div className="min-h-screen bg-[#f4f9fb] text-deep-space flex flex-col font-sans selection:bg-sky-blue/30">
      {/* Header Sticky Atas */}
      <MobileHeader
        userName={userName}
        roleTitle={roleTitle}
        unreadNotifications={unreadNotifications}
      />

      {/* Sub-header Ekstra Opsional (misal Child Switcher pada Orang Tua) */}
      {headerExtra && (
        <div className="bg-white/95 border-b border-slate-200/80 px-4 py-2 sticky top-[57px] z-30 backdrop-blur-md">
          <div className="max-w-lg mx-auto">{headerExtra}</div>
        </div>
      )}

      {/* Area Konten Utama (padding bawah untuk Bottom Nav) */}
      <main
        className={`flex-1 overflow-x-hidden transition-[padding] duration-300 ease-out ${
          barHidden ? "pb-4" : "pb-24"
        }`}
      >
        <div className="max-w-lg mx-auto w-full">{children}</div>
      </main>

      {/* Navigation Bar Bawah */}
      <MobileTabBar />
    </div>
  );
}
