"use client";

import React, { useEffect, useState } from "react";
import { Input, Avatar, Skeleton } from "antd";
import {
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";

interface SantriUser {
  id: number;
  namaLengkap: string;
  username: string;
  halaqah?: {
    namaHalaqah: string;
    guru?: {
      namaLengkap: string;
    };
  };
}

interface HalaqahStat {
  halaqahId: number;
  namaHalaqah: string;
  guru: string;
  santriCount: number;
}

export default function MobileYayasanSantri() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [santriList, setSantriList] = useState<SantriUser[]>([]);
  const [totalHalaqah, setTotalHalaqah] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function fetchSantriData() {
      try {
        setLoading(true);
        const [usersRes, halaqahRes] = await Promise.all([
          fetch("/api/users?role=santri").then((res) =>
            res.ok ? res.json() : []
          ),
          fetch("/api/analytics/global-reports?type=halaqah").then((res) =>
            res.ok ? res.json() : null
          ),
        ]);

        if (!isMounted) return;

        if (Array.isArray(usersRes)) {
          setSantriList(usersRes);
        }

        if (halaqahRes && Array.isArray(halaqahRes.halaqahStats)) {
          setTotalHalaqah(halaqahRes.halaqahStats.length);
        }
      } catch (err) {
        console.error("Error fetching santri list for Yayasan:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchSantriData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = santriList.filter(
    (s) =>
      s.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.username &&
        s.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.halaqah?.namaHalaqah &&
        s.halaqah.namaHalaqah.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-[#f4f9fb] p-4 space-y-4 pb-24">
      {/* Search & Header */}
      <div>
        <h3 className="text-sm font-bold text-deep-space mb-1">
          Direktori Santri Lembaga
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          {loading
            ? "Memuat direktori santri..."
            : `Total ${santriList.length.toLocaleString("id-ID")} Santri dari ${totalHalaqah} Halaqah`}
        </p>
        <Input
          prefix={<SearchOutlined className="text-slate-500 mr-1" />}
          placeholder="Cari nama santri atau halaqah..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-white border-slate-200 rounded-2xl h-11 text-deep-space placeholder:text-slate-400 shadow-sm"
        />
      </div>

      {/* Daftar Santri */}
      {loading ? (
        <div className="space-y-2.5" data-testid="skeleton-santri">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm"
            >
              <Skeleton active avatar paragraph={{ rows: 1 }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center text-slate-400 text-xs shadow-sm">
          Santri tidak ditemukan.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  size={42}
                  style={{ backgroundColor: "#219ebc" }}
                  icon={<UserOutlined />}
                  className="flex-shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-deep-space truncate">
                    {item.namaLengkap}
                  </h4>
                  <div className="text-xs text-blue-green font-medium truncate">
                    {item.halaqah?.namaHalaqah || "Halaqah Reguler"}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    NIS: {item.username} &bull;{" "}
                    {item.halaqah?.guru?.namaLengkap || "Ustadz Pembimbing"}
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="inline-block px-2.5 py-1 rounded-xl bg-sky-blue/20 text-blue-green font-bold text-xs">
                  Aktif
                </span>
                <div className="text-[10px] text-emerald-600 mt-1">
                  &bull; Terverifikasi
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
