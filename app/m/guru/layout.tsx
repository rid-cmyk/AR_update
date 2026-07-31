"use client";

import React, { useEffect, useState } from "react";
import MobileShell from "@/components/mobile/MobileShell";

export default function MobileGuruLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userName, setUserName] = useState("Ust. Hendri Sudianto");

  useEffect(() => {
    // Ambil info nama user dari localStorage/cookie/session jika ada
    const savedName = localStorage.getItem("user_name");
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  return (
    <MobileShell userName={userName} roleTitle="Guru" unreadNotifications={3}>
      {children}
    </MobileShell>
  );
}
