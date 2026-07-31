"use client";

import React, { useState } from "react";
import MobileShell from "@/components/mobile/MobileShell";
import { UserOutlined, DownOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";

export default function MobileOrtuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedChild, setSelectedChild] = useState({
    id: 1,
    nama: "Ahmad Zaki",
    halaqah: "Halaqah Abu Bakar",
  });

  const childList = [
    {
      id: 1,
      nama: "Ahmad Zaki",
      halaqah: "Halaqah Abu Bakar",
    },
    {
      id: 2,
      nama: "Fatimah Azzahra",
      halaqah: "Halaqah Umar",
    },
  ];

  const dropdownItems = childList.map((item) => ({
    key: item.id.toString(),
    label: (
      <div
        onClick={() => setSelectedChild(item)}
        className="flex flex-col py-1"
      >
        <span className="font-bold text-slate-800 text-xs">{item.nama}</span>
        <span className="text-[10px] text-slate-500">{item.halaqah}</span>
      </div>
    ),
  }));

  const childSwitcherPill = (
    <Dropdown menu={{ items: dropdownItems }} trigger={["click"]}>
      <button className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 transition-all tap-active">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-amber-500/25 flex items-center justify-center text-amber-300 text-xs font-bold">
            {selectedChild.nama.charAt(0)}
          </div>
          <div className="flex flex-col text-left min-w-0">
            <span className="text-xs font-bold text-white truncate leading-none">
              {selectedChild.nama}
            </span>
            <span className="text-[10px] text-amber-200/80 truncate">
              {selectedChild.halaqah}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
          <span>Ganti Anak</span>
          <DownOutlined className="text-[9px]" />
        </div>
      </button>
    </Dropdown>
  );

  return (
    <MobileShell
      userName="Bpk. H. Ahmad Sulaiman"
      roleTitle="Orang Tua"
      unreadNotifications={2}
      headerExtra={childSwitcherPill}
    >
      {children}
    </MobileShell>
  );
}
