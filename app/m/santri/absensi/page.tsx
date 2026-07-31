"use client";

import React from "react";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

export default function MobileSantriAbsensi() {
  const logAbsensi = [
    {
      id: 1,
      tanggal: "Selasa, 28 Juli 2026",
      status: "HADIR",
      waktu: "06:15 WIB",
      halaqah: "Halaqah Abu Bakar",
      tempat: "Masjid Utama Lantai 2",
    },
    {
      id: 2,
      tanggal: "Senin, 27 Juli 2026",
      status: "HADIR",
      waktu: "06:10 WIB",
      halaqah: "Halaqah Abu Bakar",
      tempat: "Masjid Utama Lantai 2",
    },
    {
      id: 3,
      tanggal: "Minggu, 26 Juli 2026",
      status: "HADIR",
      waktu: "06:12 WIB",
      halaqah: "Halaqah Abu Bakar",
      tempat: "Masjid Utama Lantai 2",
    },
    {
      id: 4,
      tanggal: "Sabtu, 25 Juli 2026",
      status: "IZIN",
      waktu: "06:00 WIB",
      halaqah: "Halaqah Abu Bakar",
      tempat: "Sakit demam (Surat dokter)",
    },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Banner Halaqah */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
            Halaqah Aktif
          </span>
          <h3 className="text-base font-bold text-white">Halaqah Abu Bakar</h3>
          <p className="text-xs text-slate-400">Pengampu: Ust. Hendri Sudianto</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xl">
          <CalendarOutlined />
        </div>
      </div>

      {/* Ringkasan Kehadiran */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5">
          <div className="text-xs text-emerald-400 font-medium mb-0.5">Hadir</div>
          <div className="text-lg font-bold text-white">24</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-2.5">
          <div className="text-xs text-blue-400 font-medium mb-0.5">Izin</div>
          <div className="text-lg font-bold text-white">1</div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5">
          <div className="text-xs text-amber-400 font-medium mb-0.5">Sakit</div>
          <div className="text-lg font-bold text-white">0</div>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5">
          <div className="text-xs text-rose-400 font-medium mb-0.5">Alpa</div>
          <div className="text-lg font-bold text-white">0</div>
        </div>
      </div>

      {/* Daftar Log Kehadiran */}
      <div className="space-y-2.5">
        <h3 className="text-sm font-bold text-slate-300">
          Catatan Kehadiran Juli 2026
        </h3>
        {logAbsensi.map((item) => (
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
