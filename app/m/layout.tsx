import React from "react";
import type { Metadata } from "next";
import { MobileThemeProvider } from "@/components/mobile/theme/MobileThemeProvider";

export const metadata: Metadata = {
  title: "AR-Hafalan Mobile PWA",
  description: "Versi Mobile Progressive Web App dari AR-Hafalan",
};

export default function MobileRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileThemeProvider>
      <div className="min-h-screen bg-navy-950 text-slate-100 antialiased">
        {children}
      </div>
    </MobileThemeProvider>
  );
}
