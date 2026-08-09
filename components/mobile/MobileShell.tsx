"use client";

import React from "react";
import MobileHeader from "./MobileHeader";
import MobileTabBar from "./MobileTabBar";
import { useMobileTheme } from "@/components/mobile/theme/MobileThemeProvider";
import dynamic from "next/dynamic";

const MobileThemeModal = dynamic(() => import("@/components/mobile/theme/MobileThemeModal"), {
  ssr: false,
});

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
  const { theme, density } = useMobileTheme();

  const getThemeClass = () => {
    if (theme === "light") {
      return "min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-blue-500/30";
    }
    return "min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500/30";
  };

  const getHeaderExtraClass = () => {
    if (theme === "light") {
      return "bg-white/90 border-b border-slate-200 px-4 py-2 sticky top-[57px] z-30 backdrop-blur-md";
    }
    return "bg-navy-900/90 border-b border-navy-800 px-4 py-2 sticky top-[57px] z-30 backdrop-blur-md";
  };

  return (
    <div className={getThemeClass()}>
      {/* Header Sticky Atas */}
      <MobileHeader
        userName={userName}
        roleTitle={roleTitle}
        unreadNotifications={unreadNotifications}
      />

      {/* Sub-header Ekstra Opsional (misal Child Switcher pada Orang Tua) */}
      {headerExtra && (
        <div className={getHeaderExtraClass()}>
          <div className="max-w-lg mx-auto">{headerExtra}</div>
        </div>
      )}

      {/* Area Konten Utama (padding bawah untuk Bottom Nav) */}
      <main
        className={`flex-1 pb-24 overflow-x-hidden ${
          density === "compact" ? "space-y-2" : ""
        }`}
      >
        <div className="max-w-lg mx-auto w-full">{children}</div>
      </main>

      {/* Navigation Bar Bawah */}
      <MobileTabBar />

      {/* Bottom Sheet Modal Kustomisasi Visual UI/UX */}
      <MobileThemeModal roleTitle={roleTitle} />
    </div>
  );
}
