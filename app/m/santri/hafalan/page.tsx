"use client";

import React, { useState } from "react";
import { Input, Progress } from "antd";
import {
  BookOutlined,
  SearchOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

export default function MobileSantriHafalan() {
  const [searchQuery, setSearchQuery] = useState("");

  const riwayatList = [
    {
      id: 1,
      surat: "Al-Baqarah",
      ayat: "Ayat 141 - 145",
      waktu: "28 Juli 2026",
      nilai: "Lancar",
      juz: "Juz 2",
      catatan: "Kelancaran sangat baik, pertahankan ghunnah pada ayat 143.",
      ustadz: "Ust. Hendri Sudianto",
    },
    {
      id: 2,
      surat: "Al-Baqarah",
      ayat: "Ayat 135 - 140",
      waktu: "25 Juli 2026",
      nilai: "Lancar",
      juz: "Juz 2",
      catatan: "Mumtaz, mukhraj huruf shaad dan dhaad sudah tepat.",
      ustadz: "Ust. Hendri Sudianto",
    },
    {
      id: 3,
      surat: "Al-Baqarah",
      ayat: "Ayat 125 - 134",
      waktu: "22 Juli 2026",
      nilai: "Sedang",
      juz: "Juz 2",
      catatan: "Perlu diulang sedikit di ayat 130 bagian akhir.",
      ustadz: "Ust. Hendri Sudianto",
    },
    {
      id: 4,
      surat: "Al-Baqarah",
      ayat: "Ayat 110 - 124",
      waktu: "19 Juli 2026",
      nilai: "Lancar",
      juz: "Juz 2",
      catatan: "Lancar alhamdulillah.",
      ustadz: "Ust. Hendri Sudianto",
    },
  ];

  const filteredRiwayat = riwayatList.filter((item) =>
    item.surat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4">
      {/* Ringkasan Progress Juz */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>Progress Juz 2 (Sedang Dihafal)</span>
          <span className="text-emerald-400">80%</span>
        </div>
        <Progress percent={80} showInfo={false} strokeColor="#10b981" trailColor="#1e293b" />
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>16 halaman selesai</span>
          <span>4 halaman sisa</span>
        </div>
      </div>

      {/* Search Bar */}
      <Input
        prefix={<SearchOutlined className="text-slate-500 mr-1" />}
        placeholder="Cari surat atau catatan setoran..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="bg-slate-900 border-slate-800 rounded-2xl h-11 text-white placeholder:text-slate-500"
      />

      {/* Daftar Kartu Riwayat Setoran */}
      <div className="space-y-3">
        {filteredRiwayat.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Surat {item.surat}
                </h4>
                <span className="text-xs text-emerald-400 font-medium">
                  {item.ayat} ({item.juz})
                </span>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  item.nilai === "Lancar"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-amber-500/15 text-amber-400"
                }`}
              >
                {item.nilai}
              </span>
            </div>

            <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 text-xs text-slate-300 italic">
              &ldquo;{item.catatan}&rdquo;
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
              <div className="flex items-center gap-1">
                <ClockCircleOutlined />
                <span>{item.waktu}</span>
              </div>
              <span>{item.ustadz}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
