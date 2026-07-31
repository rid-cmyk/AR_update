"use client";

import React from "react";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

export default function MobileOrtuAbsensi() {
  const logAbsensiAnak = [
    {
      id: 1,
      tanggal: "Selasa, 28 Juli 2026",
      status: "HADIR",
      waktu: "06:15 WIB",
      tempat: "Masjid Utama Lantai 2",
    },
    {
      id: 2,
      tanggal: "Senin, 27 Juli 2026",
      status: "HADIR",
      waktu: "06:10 WIB",
      tempat: "Masjid Utama Lantai 2",
    },
    {
      id: 3,
      tanggal: "Sabtu, 25 Juli 2026",
      status: "IZIN",
      waktu: "06:00 WIB",
      tempat: "Sakit demam (Surat dokter)",
    },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Banner Rekap Kehadiran */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
          Statistik Kehadiran Ananda
        </span>
        <h3 className="text-base font-bold text-white mt-0.5">
          100% Kehadiran Efektif
        </h3>
        <p className="text-xs text-slate-400">
          Dari 25 pertemuan halaqah bulan ini
        </p>

        <div className="grid grid-cols-4 gap-2 mt-4 text-center">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2">
            <div className="text-[11px] text-emerald-400 font-medium">Hadir</div>
            <div className="text-base font-bold text-white">24</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-2">
            <div className="text-[11px] text-blue-400 font-medium">Izin</div>
            <div className="text-base font-bold text-white">1</div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2">
            <div className="text-[11px] text-amber-400 font-medium">Sakit</div>
            <div className="text-base font-bold text-white">0</div>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-2">
            <div className="text-[11px] text-rose-400 font-medium">Alpa</div>
            <div className="text-base font-bold text-white">0</div>
          </div>
        </div>
      </div>

      {/* Log Kehadiran */}
      <div className="space-y-2.5">
        <h3 className="text-sm font-bold text-slate-300">
          Riwayat Absensi Ananda
        </h3>
        {logAbsensiAnak.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-base ${
                  item.status === "HADIR"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                    : "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                }`}
              >
                {item.status === "HADIR" ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{item.tanggal}</h4>
                <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                  <EnvironmentOutlined className="text-slate-500" />
                  <span>{item.tempat}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  item.status === "HADIR"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-blue-500/20 text-blue-400"
                }`}
              >
                {item.status}
              </span>
              <div className="text-[10px] text-slate-500 mt-1">{item.waktu}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
