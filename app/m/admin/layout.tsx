"use client";

import React, { useEffect, useState } from "react";
import MobileShell from "@/components/mobile/MobileShell";

export default function MobileAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userName, setUserName] = useState("Administrator");

  useEffect(() => {
    const savedName = localStorage.getItem("user_name");
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  return (
    <MobileShell userName={userName} roleTitle="Admin" unreadNotifications={0}>
      {children}
    </MobileShell>
  );
}
