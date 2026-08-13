"use client";

import React, { useEffect, useState } from "react";
import { UserOutlined, SearchOutlined } from "@ant-design/icons";
import { DashboardHeader } from "@/components/ui/dashboard-header";
import { MobileCard } from "@/components/mobile/dashboard";

interface SantriItem {
  id: number;
  namaLengkap: string;
  username: string;
  nis?: string;
  halaqahName?: string;
}

export default function MobileAdminSantri() {
  const [santriList, setSantriList] = useState<SantriItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/users?role=santri")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSantriList(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredList = santriList.filter(
    (s) =>
      s.namaLengkap?.toLowerCase().includes(search.toLowerCase()) ||
      s.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-[#f4f9fb] p-4 space-y-4 pb-24">
      {/* Header Banner */}
      <DashboardHeader
        badge={
          <span className="inline-flex items-center gap-1.5">
            <UserOutlined />
            Data Santri
          </span>
        }
        title="Daftar Santri"
        subtitle="Seluruh santri terdaftar dalam sistem, cari berdasarkan nama atau username."
      />

      {/* Input Pencarian */}
      <div className="relative">
        <SearchOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
        <input
          type="text"
          placeholder="Cari santri berdasarkan nama..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200/80 rounded-2xl pl-10 pr-4 py-3 text-sm text-deep-space placeholder:text-slate-400 shadow-sm focus:outline-none focus:border-blue-green transition-colors"
        />
      </div>

      {/* Daftar Santri */}
      {loading ? (
        <MobileCard className="py-12 text-center text-slate-400 text-sm">
          Memuat data santri...
        </MobileCard>
      ) : filteredList.length === 0 ? (
        <MobileCard className="py-12 text-center text-slate-400 text-sm">
          Tidak ada santri ditemukan
        </MobileCard>
      ) : (
        <div className="space-y-2">
          {filteredList.map((item) => (
            <MobileCard
              key={item.id}
              className="p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-sky-blue/20 text-blue-green flex items-center justify-center flex-shrink-0 font-bold">
                  <UserOutlined />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-deep-space truncate">{item.namaLengkap}</h4>
                  <p className="text-xs text-slate-500 truncate">@{item.username}</p>
                </div>
              </div>
            </MobileCard>
          ))}
        </div>
      )}
    </div>
  );
}
