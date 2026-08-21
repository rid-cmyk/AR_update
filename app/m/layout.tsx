import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AR-Hafalan Mobile PWA",
  description: "Versi Mobile Progressive Web App dari AR-Hafalan",
};

export const dynamic = 'force-dynamic';

export default function MobileRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f4f9fb] text-deep-space antialiased">
      {children}
    </div>
  );
}
