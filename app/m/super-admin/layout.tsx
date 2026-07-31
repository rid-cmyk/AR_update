"use client";

import React, { useEffect, useState } from "react";
import MobileShell from "@/components/mobile/MobileShell";

export default function MobileSuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userName, setUserName] = useState("Super Administrator");

  useEffect(() => {
    const savedName = localStorage.getItem("user_name");
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  return (
    <MobileShell userName={userName} roleTitle="Super Admin" unreadNotifications={0}>
      {children}
    </MobileShell>
  );
}
