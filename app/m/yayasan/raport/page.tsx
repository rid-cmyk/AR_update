"use client";

import React, { useState } from "react";
import {
  TrophyOutlined,
  DownloadOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { Progress, Button } from "antd";
import RaportModalView from "@/components/raport/RaportModalView";

export default function MobileYayasanRaport() {
  const [modalOpen, setModalOpen] = useState(false);
  const rekapHalaqah = [
    { halaqah: "Halaqah Abu Bakar", lulus: 24, total: 25, persentase: 96 },
    { halaqah: "Halaqah Umar bin Khattab", lulus: 22, total: 24, persentase: 91.6 },
    { halaqah: "Halaqah Utsman bin Affan", lulus: 23, total: 26, persentase: 88.4 },
    { halaqah: "Halaqah Ali bin Abi Thalib", lulus: 20, total: 24, persentase: 83.3 },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header Rekap Rapor Lembaga */}
      <div className="bg-gradient-to-br from-purple-700 via-indigo-800 to-slate-900 border border-purple-400/30 rounded-3xl p-6 text-center space-y-2 shadow-lg">
        <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-md mx-auto flex items-center justify-center text-white text-2xl shadow-inner mb-2">
          <TrophyOutlined />
        </div>
        <span className="inline-block px-3 py-0.5 rounded-full bg-white/15 text-purple-100 text-xs font-semibold">
          Rekapitulasi Akhir Semester Genap
        </span>
        <h2 className="text-2xl font-bold text-white">
          89.4% Lulus Target
        </h2>
        <p className="text-xs text-purple-100">
          306 dari 342 santri berhasil memenuhi target tahfizh semester
        </p>
      </div>

      {/* Rincian Kelulusan per Halaqah */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300">
          Tingkat Kelulusan per Halaqah
        </h3>
        {rekapHalaqah.map((item, idx) => (
          <div
            key={idx}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">
                {item.halaqah}
              </span>
              <span className="text-xs font-bold text-purple-400">
                {item.persentase}% Lulus
              </span>
            </div>
            <Progress
              percent={item.persentase}
              showInfo={false}
              strokeColor="#a855f7"
              trailColor="#1e293b"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{item.lulus} Santri Lulus</span>
              <span>Total {item.total} Santri</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tombol Unduh Laporan Eksekutif */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          className="w-full h-12 rounded-2xl bg-purple-600 hover:bg-purple-500 font-bold text-xs shadow-lg shadow-purple-500/20 border-none"
          onClick={() => setModalOpen(true)}
        >
          Unduh PDF
        </Button>
        <Button
          icon={<PrinterOutlined />}
          className="w-full h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-white border-none"
          onClick={() => setModalOpen(true)}
        >
          Cetak A4
        </Button>
      </div>

      <RaportModalView
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Laporan Eksekutif - Yayasan"
      />
    </div>
  );
}
