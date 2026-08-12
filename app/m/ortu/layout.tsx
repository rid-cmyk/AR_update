"use client";

import React, { useEffect, useState } from "react";
import MobileShell from "@/components/mobile/MobileShell";
import { DownOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";

type Anak = {
  id: number;
  nama: string;
  halaqah: string;
};

export default function MobileOrtuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userName, setUserName] = useState("Orang Tua");
  const [childList, setChildList] = useState<Anak[]>([]);
  const [selectedChild, setSelectedChild] = useState<Anak | null>(null);

  useEffect(() => {
    fetch("/api/ortu/dashboard")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const list = (data?.anakList || []).map((a: any) => ({
          id: a.id,
          nama: a.namaLengkap || "Anak",
          halaqah: a.halaqah || "Tanpa Halaqah",
        }));
        setChildList(list);
        if (list.length > 0) {
          setSelectedChild((prev) => prev ?? list[0]);
        }
        if (data?.orangTuaInfo?.namaLengkap) {
          setUserName(data.orangTuaInfo.namaLengkap);
        }
      })
      .catch(() => {});
  }, []);

  const dropdownItems = (childList.length > 0 ? childList : []).map((item) => ({
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

  const childSwitcherPill = selectedChild ? (
    <Dropdown menu={{ items: dropdownItems }} trigger={["click"]}>
      <button className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-sky-blue/20 border border-sky-blue/40 text-blue-green transition-all tap-active">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-blue-green flex items-center justify-center text-white text-xs font-bold">
            {selectedChild.nama.charAt(0)}
          </div>
          <div className="flex flex-col text-left min-w-0">
            <span className="text-xs font-bold text-deep-space truncate leading-none">
              {selectedChild.nama}
            </span>
            <span className="text-[10px] text-blue-green/80 truncate">
              {selectedChild.halaqah}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-green">
          <span>Ganti Anak</span>
          <DownOutlined className="text-[9px]" />
        </div>
      </button>
    </Dropdown>
  ) : null;

  return (
    <MobileShell
      userName={userName}
      roleTitle="Orang Tua"
      unreadNotifications={0}
      headerExtra={childSwitcherPill || undefined}
    >
      {children}
    </MobileShell>
  );
}
