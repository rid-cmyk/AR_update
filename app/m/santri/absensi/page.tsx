"use client";

import React, { useState, useEffect } from "react";
import { Skeleton } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
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
      {/* Banner Halaqah */}
      <div className="bg-gradient-to-br from-sky-blue via-blue-green to-deep-space rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-blue-green/20">
        <div>
          <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">
            Halaqah Aktif
          </span>
          <h3 className="text-base font-bold text-white">{halaqahAktif}</h3>
          <p className="text-xs text-white/70">Pengampu: {guruPengampu}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center text-xl">
          <CalendarOutlined />
        </div>
      </div>

      {/* Ringkasan Kehadiran */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-sm">
          <div className="text-xs text-emerald-600 font-medium mb-0.5">Hadir</div>
          <div className="text-lg font-bold text-deep-space">{stats.totalHadir}</div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-sm">
          <div className="text-xs text-blue-green font-medium mb-0.5">Izin</div>
          <div className="text-lg font-bold text-deep-space">{stats.totalIzin}</div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-sm">
          <div className="text-xs text-princeton font-medium mb-0.5">Sakit</div>
          <div className="text-lg font-bold text-deep-space">0</div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-sm">
          <div className="text-xs text-rose-500 font-medium mb-0.5">Alpa</div>
          <div className="text-lg font-bold text-deep-space">{stats.totalAlpha}</div>
        </div>
      </div>

      {/* Log Kehadiran */}
      <div className="space-y-2.5">
        <h3 className="text-sm font-bold text-deep-space">Riwayat Absensimu</h3>
        {loading ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : records.length > 0 ? (
          records.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-sm"
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
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-xs text-slate-400 bg-white rounded-2xl border border-slate-200/80">
            Belum ada riwayat absensi halaqah tercatat.
          </div>
        )}
      </div>
    </div>
  );
}
