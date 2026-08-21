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
import { DashboardHeader } from "@/components/ui/dashboard-header";
import { MobileCard } from "@/components/mobile/dashboard";

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
    <div className="min-h-[calc(100vh-8rem)] bg-[#f4f9fb] p-4 space-y-4 pb-24">
      {/* Header Banner */}
      <DashboardHeader
        badge={
          <span className="inline-flex items-center gap-1.5">
            <CalendarOutlined />
            Jadwal Guru
          </span>
        }
        title="Jadwal Mengajar"
        subtitle="Lihat jadwal halaqah Anda per hari dan cek jumlah sesi aktif."
      />

      {/* Hari Selector (Horizontal Scroll) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
              selectedDay === day
                ? "bg-blue-green text-white shadow-md shadow-blue-green/20"
                : "bg-white text-slate-500 hover:text-deep-space border border-slate-200/80"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Banner Tanggal & Hari Ini */}
      <MobileCard className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-blue/20 border border-sky-blue/30 text-blue-green flex items-center justify-center text-lg">
            <CalendarOutlined />
          </div>
          <div>
            <h3 className="text-sm font-bold text-deep-space">Jadwal Mengajar</h3>
            <p className="text-xs text-slate-500">
              Hari {selectedDay} • Halaqah Anda
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          {filteredJadwal.length} Sesi
        </span>
      </MobileCard>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton active paragraph={{ rows: 2 }} className="bg-white p-4 rounded-2xl" />
          <Skeleton active paragraph={{ rows: 2 }} className="bg-white p-4 rounded-2xl" />
        </div>
      ) : filteredJadwal.length === 0 ? (
        <MobileCard className="py-8 text-center text-slate-400 text-xs">
          Tidak ada jadwal mengajar pada hari {selectedDay}.
        </MobileCard>
      ) : (
        /* Vertical Timeline Jadwal */
        <div className="space-y-3 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-sky-blue/40">
          {filteredJadwal.map((item) => {
            const jumlahSantri = item.halaqah?.santri?.length || 0;
            return (
              <MobileCard
                key={item.id}
                className="relative pl-12 space-y-2 transition-all hover:ring-sky-blue/60"
              >
                <div className="absolute left-3.5 top-5 w-3 h-3 rounded-full border-2 bg-blue-green border-white ring-4 ring-sky-blue/30" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-green">
                    <ClockCircleOutlined />
                    <span>
                      {item.jamMulai} - {item.jamSelesai} WIB
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-blue/20 text-blue-green border border-sky-blue/30">
                    Halaqah Sendiri
                  </span>
                </div>

                <h4 className="text-sm font-bold text-deep-space">
                  {item.halaqah?.namaHalaqah || "Halaqah Tahfizh"}
                </h4>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <EnvironmentOutlined className="text-blue-green" />
                    <span>{item.ruangan || "Ruang Kelas Utama"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TeamOutlined className="text-blue-green" />
                    <span>{jumlahSantri} Santri</span>
                  </div>
                </div>
              </MobileCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
