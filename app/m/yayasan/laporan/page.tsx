"use client";

import React from "react";
import { Progress } from "antd";
import {
  FileTextOutlined,
  RiseOutlined,
  TrophyOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

export default function MobileYayasanLaporan() {
  const statistikBulanan = [
    { bulan: "Juli 2026", tambahanJuz: "+85 Juz", targetSelesai: "89%" },
    { bulan: "Juni 2026", tambahanJuz: "+78 Juz", targetSelesai: "87%" },
    { bulan: "Mei 2026", tambahanJuz: "+92 Juz", targetSelesai: "91%" },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Banner Laporan */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
            Laporan Eksekutif Tahfizh
          </span>
          <h3 className="text-base font-bold text-white mt-0.5">
            Pertumbuhan Hafalan 2026
          </h3>
          <p className="text-xs text-slate-400">
            Total 1,280 Juz dihafal di seluruh lembaga
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center text-xl">
          <BarChartOutlined />
        </div>
      </div>

      {/* Ringkasan Kemajuan Bulanan */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300">
          Tren Tambahan Hafalan per Bulan
        </h3>
        {statistikBulanan.map((item, idx) => (
          <div
            key={idx}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between"
          >
            <div>
              <h4 className="text-sm font-bold text-white">{item.bulan}</h4>
              <span className="text-xs text-purple-400 font-medium">
                Capaian Target: {item.targetSelesai}
              </span>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 font-bold text-sm">
                {item.tambahanJuz}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Distribusi Kategori Santri */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-slate-200">
          Distribusi Kategori Hafalan
        </h3>
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Hafalan &ge; 10 Juz</span>
              <span>42 Santri (12%)</span>
            </div>
            <Progress percent={12} showInfo={false} strokeColor="#a855f7" trailColor="#1e293b" />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Hafalan 5 - 9 Juz</span>
              <span>98 Santri (29%)</span>
            </div>
            <Progress percent={29} showInfo={false} strokeColor="#6366f1" trailColor="#1e293b" />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Hafalan 1 - 4 Juz</span>
              <span>202 Santri (59%)</span>
            </div>
            <Progress percent={59} showInfo={false} strokeColor="#3b82f6" trailColor="#1e293b" />
          </div>
        </div>
      </div>
    </div>
  );
}
