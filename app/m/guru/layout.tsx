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
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.data?.namaLengkap) {
          setUserName(data.data.namaLengkap);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <MobileShell userName={userName} roleTitle="Guru" unreadNotifications={3}>
      {children}
    </MobileShell>
  );
}
