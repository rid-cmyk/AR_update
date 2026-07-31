"use client";

import React, { useEffect, useState } from "react";
import MobileShell from "@/components/mobile/MobileShell";

export default function MobileSantriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userName, setUserName] = useState("Ahmad Zaki");

  useEffect(() => {
    const savedName = localStorage.getItem("user_name");
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  return (
    <MobileShell userName={userName} roleTitle="Santri" unreadNotifications={1}>
      {children}
    </MobileShell>
  );
}
