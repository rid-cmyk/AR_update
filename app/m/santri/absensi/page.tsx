"use client";

import React, { useState, useEffect } from "react";
import { Skeleton } from "antd";
import { MobileCard, MobileSectionTitle } from "@/components/mobile/dashboard";
import { DashboardHeader } from "@/components/ui/dashboard-header";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
} from "@ant-design/icons";

interface AbsensiItem {
  id: number;
  tanggal: string;
  status: string;
  halaqah: string;
  guru: string;
  hari?: string;
  jamMulai?: string;
  jamSelesai?: string;
}

export default function MobileSantriAbsensi() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<AbsensiItem[]>([]);
  const [stats, setStats] = useState<{
    totalHadir: number;
    totalIzin: number;
    totalAlpha: number;
    attendanceRate: number;
    totalAbsensi: number;
  }>({
    totalHadir: 0,
    totalIzin: 0,
    totalAlpha: 0,
    attendanceRate: 100,
    totalAbsensi: 0,
  });

  useEffect(() => {
    const fetchAbsensi = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/santri/absensi");
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setRecords(json.data.absensi || []);
            if (json.data.stats) {
              setStats(json.data.stats);
            }
          }
        }
      } catch (e) {
        console.error("Gagal memuat absensi santri:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAbsensi();
  }, []);

  const halaqahAktif = records.length > 0 ? records[0].halaqah : "Halaqah Tahfizh";
  const guruPengampu = records.length > 0 ? records[0].guru : "Ustadz Pembimbing";

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-[#f4f9fb] p-4 space-y-4 pb-24">
      {/* Header Banner */}
      <DashboardHeader
        badge={
          <span className="inline-flex items-center gap-1.5">
            <CheckCircleOutlined />
            Kehadiran
          </span>
        }
        title="Absensi Halaqah"
        subtitle="Pantau kehadiran rutin di halaqah, dipandu langsung oleh guru pengampu."
      >
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">
              Halaqah Aktif
            </span>
            <h3 className="text-sm font-bold text-white">{halaqahAktif}</h3>
            <p className="text-xs text-white/70">Pengampu: {guruPengampu}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-white/20 text-white flex items-center justify-center text-lg">
            <TeamOutlined />
          </div>
        </div>
      </DashboardHeader>

      {/* Banner Halaqah (Mobile) */}
      <MobileCard className="p-4 flex items-center justify-between sm:hidden">
        <div>
          <span className="text-[11px] font-semibold text-blue-green uppercase tracking-wider">
            Halaqah Aktif
          </span>
          <h3 className="text-sm font-bold text-deep-space">{halaqahAktif}</h3>
          <p className="text-xs text-slate-500">Pengampu: {guruPengampu}</p>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-sky-blue/20 text-blue-green flex items-center justify-center text-lg">
          <TeamOutlined />
        </div>
      </MobileCard>

      {/* Ringkasan Kehadiran */}
      <div className="space-y-2.5">
        <MobileSectionTitle title="Ringkasan Kehadiran" icon={<CalendarOutlined />} />
        <div className="grid grid-cols-4 gap-2 text-center">
          <MobileCard className="p-3">
            <div className="mx-auto mb-1.5 h-1.5 w-6 rounded-full bg-emerald-500/70" />
            <div className="text-[11px] font-semibold text-emerald-600 mb-0.5">Hadir</div>
            <div className="text-lg font-extrabold text-deep-space">{stats.totalHadir}</div>
          </MobileCard>
          <MobileCard className="p-3">
            <div className="mx-auto mb-1.5 h-1.5 w-6 rounded-full bg-blue-green/70" />
            <div className="text-[11px] font-semibold text-blue-green mb-0.5">Izin</div>
            <div className="text-lg font-extrabold text-deep-space">{stats.totalIzin}</div>
          </MobileCard>
          <MobileCard className="p-3">
            <div className="mx-auto mb-1.5 h-1.5 w-6 rounded-full bg-amber-flame/70" />
            <div className="text-[11px] font-semibold text-princeton mb-0.5">Sakit</div>
            <div className="text-lg font-extrabold text-deep-space">0</div>
          </MobileCard>
          <MobileCard className="p-3">
            <div className="mx-auto mb-1.5 h-1.5 w-6 rounded-full bg-rose-500/70" />
            <div className="text-[11px] font-semibold text-rose-500 mb-0.5">Alpa</div>
            <div className="text-lg font-extrabold text-deep-space">{stats.totalAlpha}</div>
          </MobileCard>
        </div>
      </div>

      {/* Log Kehadiran */}
      <div className="space-y-2.5">
        <MobileSectionTitle title="Riwayat Absensimu" icon={<CalendarOutlined />} />
        {loading ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : records.length > 0 ? (
          records.map((item) => (
            <MobileCard
              key={item.id}
              className="p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    item.status === "hadir" || item.status === "masuk"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-princeton"
                  }`}
                >
                  {item.status === "hadir" || item.status === "masuk" ? "H" : "I"}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-deep-space">
                    {new Date(item.tanggal).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <ClockCircleOutlined />
                      {item.jamMulai ? `${item.jamMulai} WIB` : "06:00 WIB"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <EnvironmentOutlined />
                      {item.halaqah}
                    </span>
                  </div>
                </div>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  item.status === "hadir" || item.status === "masuk"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-500/30"
                    : "bg-amber-50 text-princeton border border-amber-500/30"
                }`}
              >
                {item.status.toUpperCase()}
              </span>
            </MobileCard>
          ))
        ) : (
          <MobileCard className="py-8 text-center text-slate-400 text-xs">
            Belum ada riwayat absensi halaqah tercatat.
          </MobileCard>
        )}
      </div>
    </div>
  );
}
