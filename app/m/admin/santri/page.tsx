"use client";

import React, { useEffect, useState } from "react";
import { UserOutlined, SearchOutlined } from "@ant-design/icons";

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
    fetch("/api/santri")
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
    <div className="p-4 space-y-4">
      {/* Header Halaman */}
      <div>
        <h2 className="text-lg font-bold text-white">Data Santri</h2>
        <p className="text-xs text-slate-400">Daftar seluruh santri terdaftar dalam sistem</p>
      </div>

      {/* Input Pencarian */}
      <div className="relative">
        <SearchOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
        <input
          type="text"
          placeholder="Cari santri berdasarkan nama..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-navy-900 border border-navy-800 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-teal transition-colors"
        />
      </div>

      {/* Daftar Santri */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Memuat data santri...</div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">Tidak ada santri ditemukan</div>
      ) : (
        <div className="space-y-2">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-navy-900/80 border border-navy-800 rounded-2xl p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center flex-shrink-0 font-bold">
                  <UserOutlined />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">{item.namaLengkap}</h4>
                  <p className="text-xs text-slate-400 truncate">@{item.username}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
