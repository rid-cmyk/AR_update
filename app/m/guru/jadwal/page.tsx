"use client";

import React, { useState } from "react";
import { Skeleton } from "antd";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { usePageData } from "@/hooks/usePageData";

interface JadwalItem {
  id: number;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  ruangan?: string;
  halaqah?: {
    id: number;
    namaHalaqah: string;
    santri?: unknown[];
  };
}

const DAYS_ID = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function MobileGuruJadwal() {
  const todayName = DAYS_ID[new Date().getDay()] || "Senin";
  const [selectedDay, setSelectedDay] = useState(
    DAYS_ID.includes(todayName) && todayName !== "Ahad" ? todayName : "Senin"
  );
  const { data, loading } = usePageData<JadwalItem[]>({
    endpoint: "/api/guru/jadwal",
    transform: (json: unknown) => {
      const j = json as { data?: JadwalItem[] };
      return Array.isArray(j?.data) ? j.data : [];
    },
  });
  const jadwalList = data ?? [];

  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Ahad"];

  const filteredJadwal = jadwalList.filter(
    (item) => item.hari?.toLowerCase() === selectedDay.toLowerCase()
  );

  return (
    <div className="p-4 space-y-4 pb-20">
      {/* Hari Selector (Horizontal Scroll) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
              selectedDay === day
                ? "bg-blue-green text-white shadow-md shadow-brand-teal/20"
                : "bg-navy-900 text-slate-400 hover:text-white border border-navy-800"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Banner Tanggal & Hari Ini */}
      <div className="bg-navy-900/80 border border-navy-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-teal/10 border border-brand-teal/20 text-brand-teal flex items-center justify-center text-lg">
            <CalendarOutlined />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Jadwal Mengajar</h3>
            <p className="text-xs text-slate-400">
              Hari {selectedDay} • Halaqah Anda
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full">
          {filteredJadwal.length} Sesi
        </span>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton active paragraph={{ rows: 2 }} className="bg-navy-900/50 p-4 rounded-2xl" />
          <Skeleton active paragraph={{ rows: 2 }} className="bg-navy-900/50 p-4 rounded-2xl" />
        </div>
      ) : filteredJadwal.length === 0 ? (
        <div className="p-8 rounded-2xl bg-navy-900/40 border border-navy-800 text-center text-slate-400 text-xs">
          Tidak ada jadwal mengajar pada hari {selectedDay}.
        </div>
      ) : (
        /* Vertical Timeline Jadwal */
        <div className="space-y-3 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-navy-700">
          {filteredJadwal.map((item) => {
            const jumlahSantri = item.halaqah?.santri?.length || 0;
            return (
              <div
                key={item.id}
                className="relative pl-12 bg-navy-900/90 border border-navy-800 rounded-2xl p-4 space-y-2 transition-all hover:border-navy-800"
              >
                <div className="absolute left-3.5 top-5 w-3 h-3 rounded-full border-2 bg-blue-green border-brand-teal ring-4 ring-brand-teal/20" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-brand-teal">
                    <ClockCircleOutlined />
                    <span>
                      {item.jamMulai} - {item.jamSelesai} WIB
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-teal/20 text-brand-teal border border-brand-teal/30">
                    Halaqah Sendiri
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white">
                  {item.halaqah?.namaHalaqah || "Halaqah Tahfizh"}
                </h4>

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 border-t border-navy-800/80">
                  <div className="flex items-center gap-1.5">
                    <EnvironmentOutlined className="text-brand-teal" />
                    <span>{item.ruangan || "Ruang Kelas Utama"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TeamOutlined className="text-brand-teal" />
                    <span>{jumlahSantri} Santri</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
