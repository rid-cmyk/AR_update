"use client";

import React from "react";
import MobileShell from "@/components/mobile/MobileShell";

export default function MobileYayasanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileShell
      userName="Pimpinan Yayasan"
      roleTitle="Yayasan"
      unreadNotifications={3}
    >
      {children}
    </MobileShell>
  );
}
