"use client";

import React, { useState } from "react";
import {
  TrophyOutlined,
  StarFilled,
  DownloadOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
import RaportModalView from "@/components/raport/RaportModalView";

export default function MobileOrtuRaport() {
  const [modalOpen, setModalOpen] = useState(false);
  const rincianNilai = [
    { label: "Tajwid & Makhorijul Huruf", nilai: 92, predikat: "Mumtaz (A)" },
    { label: "Fashahah & Irama Bacaan", nilai: 88, predikat: "Mumtaz (A-)" },
    { label: "Kelancaran Hafalan (Hifzh)", nilai: 86, predikat: "Jayyid Jiddan (B+)" },
    { label: "Adab & Kedisiplinan Halaqah", nilai: 96, predikat: "Mumtaz (A+)" },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header Raport Anak */}
      <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-slate-900 border border-amber-400/30 rounded-3xl p-6 text-center space-y-2 shadow-lg">
        <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-md mx-auto flex items-center justify-center text-white text-2xl shadow-inner mb-2">
          <TrophyOutlined />
        </div>
        <span className="inline-block px-3 py-0.5 rounded-full bg-white/15 text-amber-100 text-xs font-semibold">
          Semester Genap 2025/2026
        </span>
        <h2 className="text-2xl font-bold text-white">Rapor Ananda</h2>
        <p className="text-xs text-amber-100">
          Santri: <span className="font-bold text-white">Ahmad Zaki</span> — Halaqah Abu Bakar
        </p>
      </div>

      {/* Rangkuman Nilai */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Predikat Akhir
          </span>
          <h3 className="text-2xl font-bold text-amber-400">Mumtaz (A-)</h3>
          <p className="text-xs text-slate-400">Rata-rata: 90.5 / 100</p>
        </div>
        <div className="flex items-center gap-1 text-amber-400 text-lg">
          <StarFilled />
          <StarFilled />
          <StarFilled />
          <StarFilled />
          <StarFilled />
        </div>
      </div>

      {/* Rincian Penilaian */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300">Rincian Penilaian</h3>
        {rincianNilai.map((item, idx) => (
          <div
            key={idx}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between"
          >
            <div>
              <h4 className="text-sm font-semibold text-white">{item.label}</h4>
              <span className="text-xs text-amber-400 font-medium">
                {item.predikat}
              </span>
            </div>
            <div className="text-xl font-bold text-white bg-slate-950 px-3.5 py-1 rounded-xl border border-slate-800">
              {item.nilai}
            </div>
          </div>
        ))}
      </div>

      {/* Catatan Ustadz */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
          <CheckCircleOutlined />
          <span>Catatan Wali Halaqah untuk Orang Tua</span>
        </div>
        <p className="text-xs text-slate-300 italic leading-relaxed">
          &ldquo;Alhamdulillah, Ahmad Zaki menunjukkan semangat hafalan yang luar biasa. Tajwid sangat rapi. Mohon pendampingan Bapak/Ibu di rumah agar ananda tetap muroja&apos;ah bakda subuh.&rdquo;
        </p>
        <div className="text-right text-xs font-bold text-slate-400 pt-1">
          — Ust. Hendri Sudianto
        </div>
      </div>

      {/* Tombol Unduh & Cetak */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          className="w-full h-12 rounded-2xl bg-amber-600 hover:bg-amber-500 font-bold text-xs shadow-lg shadow-amber-500/20 border-none"
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
        title="Rapor Tahfizh - Ananda"
      />
    </div>
  );
}
