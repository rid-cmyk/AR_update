"use client";

import React, { useState } from "react";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

export default function MobileGuruJadwal() {
  const [selectedDay, setSelectedDay] = useState("Selasa");

  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  const jadwalList = [
    {
      id: 1,
      waktu: "06:00 - 07:30 WIB",
      halaqah: "Halaqah Abu Bakar (Tahfizh)",
      tempat: "Masjid Utama Lantai 2",
      jumlahSantri: 14,
      status: "Berlangsung",
      type: "pagi",
    },
    {
      id: 2,
      waktu: "16:00 - 17:30 WIB",
      halaqah: "Halaqah Umar bin Khattab (Tahsin)",
      tempat: "Ruang Kelas 102",
      jumlahSantri: 14,
      status: "Akan Datang",
      type: "sore",
    },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Hari Selector (Horizontal Scroll) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
              selectedDay === day
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Banner Tanggal Hari Ini */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-lg">
            <CalendarOutlined />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Jadwal Mengajar</h3>
            <p className="text-xs text-slate-400">Hari {selectedDay}, 28 Juli 2026</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full">
          2 Sesi
        </span>
      </div>

      {/* Vertical Timeline Jadwal */}
      <div className="space-y-3 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
        {jadwalList.map((item) => (
          <div
            key={item.id}
            className="relative pl-12 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2 transition-all hover:border-slate-700"
          >
            {/* Dot Timeline */}
            <div
              className={`absolute left-3.5 top-5 w-3 h-3 rounded-full border-2 ${
                item.status === "Berlangsung"
                  ? "bg-blue-500 border-blue-300 ring-4 ring-blue-500/20"
                  : "bg-slate-700 border-slate-500"
              }`}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                <ClockCircleOutlined />
                <span>{item.waktu}</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.status === "Berlangsung"
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {item.status}
              </span>
            </div>

            <h4 className="text-base font-bold text-white">{item.halaqah}</h4>

            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-1">
                <EnvironmentOutlined className="text-slate-500" />
                <span>{item.tempat}</span>
              </div>
              <div className="flex items-center gap-1">
                <TeamOutlined className="text-slate-500" />
                <span>{item.jumlahSantri} Santri</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
