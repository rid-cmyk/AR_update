"use client";

import React, { useState, useEffect } from "react";
import {
  TrophyOutlined,
  StarFilled,
  DownloadOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { Button, Spin } from "antd";
import RaportModalView from "@/components/raport/RaportModalView";
import { useOrtuChildDashboard } from "@/hooks/useOrtuChildDashboard";

export default function MobileOrtuRaport() {
  const [modalOpen, setModalOpen] = useState(false);

  const {
    children,
    childNames,
    loading,
    selectedChild: selectedChildName,
    setSelectedChild,
  } = useOrtuChildDashboard<Record<string, never>>({
    transformAnak: (anak: any) => ({
      data: {},
      child: {
        id: anak.id,
        namaLengkap: anak.namaLengkap,
        username: anak.username,
        hafalanProgress: anak.hafalanProgress,
      },
    }),
    initialData: {},
    defaultSelectedChild: "",
  });

  const selectedSantriId = children.find((c) => c.namaLengkap === selectedChildName)?.id ?? null;

  useEffect(() => {
    if (childNames.length > 0 && !selectedChildName) {
      setSelectedChild(childNames[0]);
    }
  }, [childNames, selectedChildName, setSelectedChild]);

  const selectedChild = children.find((c) => c.id === selectedSantriId);

  const progress = selectedChild?.hafalanProgress || 85;
  const nilaiAkhir = Math.min(Math.round(progress + 15), 95);
  const predikat =
    nilaiAkhir >= 90
      ? "Mumtaz (A)"
      : nilaiAkhir >= 80
      ? "Jayyid Jiddan (B+)"
      : "Jayyid (B)";

  const rincianNilai = [
    { label: "Tajwid & Makhorijul Huruf", nilai: Math.min(nilaiAkhir + 2, 98), predikat: "Mumtaz (A)" },
    { label: "Fashahah & Irama Bacaan", nilai: Math.max(nilaiAkhir - 2, 80), predikat: "Mumtaz (A-)" },
    { label: "Kelancaran Hafalan (Hifzh)", nilai: nilaiAkhir, predikat: predikat },
    { label: "Adab & Kedisiplinan Halaqah", nilai: 96, predikat: "Mumtaz (A+)" },
  ];

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* Child Switcher Pills */}
      {children.length > 0 && (
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Pilih Ananda:</span>
            {loading && <Spin size="small" />}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {children.map((child) => {
              const isSelected = selectedSantriId === child.id;
              return (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => setSelectedChild(child.namaLengkap)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? "bg-brand-teal text-navy-950 shadow-md shadow-brand-teal/25 border border-brand-teal"
                      : "bg-navy-950 text-slate-400 border border-navy-800 hover:text-white"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      isSelected ? "bg-navy-950 text-brand-teal" : "bg-navy-700 text-slate-300"
                    }`}
                  >
                    {child.namaLengkap.charAt(0)}
                  </div>
                  <span>{child.namaLengkap}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Header Raport Anak */}
      <div className="bg-gradient-to-br from-blue-green via-navy-800 to-navy-900 border border-brand-teal/30 rounded-3xl p-6 text-center space-y-2 shadow-lg">
        <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-md mx-auto flex items-center justify-center text-white text-2xl shadow-inner mb-2">
          <TrophyOutlined />
        </div>
        <span className="inline-block px-3 py-0.5 rounded-full bg-white/15 text-slate-100 text-xs font-semibold">
          Semester Genap 2025/2026
        </span>
        <h2 className="text-2xl font-bold text-white">Rapor Ananda</h2>
        <p className="text-xs text-slate-100">
          Santri: <span className="font-bold text-white">{selectedChild?.namaLengkap || "Ananda"}</span> — Halaqah Tahfizh
        </p>
      </div>

      {/* Rangkuman Nilai */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Predikat Akhir
          </span>
          <h3 className="text-2xl font-bold text-amber-400">{predikat}</h3>
          <p className="text-xs text-slate-400">Rata-rata: {nilaiAkhir} / 100</p>
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
            className="bg-navy-900/80 border border-navy-800 rounded-2xl p-4 flex items-center justify-between"
          >
            <div>
              <h4 className="text-sm font-semibold text-white">{item.label}</h4>
              <span className="text-xs text-amber-400 font-medium">
                {item.predikat}
              </span>
            </div>
            <div className="text-xl font-bold text-white bg-navy-950 px-3.5 py-1 rounded-xl border border-navy-800">
              {item.nilai}
            </div>
          </div>
        ))}
      </div>

      {/* Catatan Ustadz */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
          <CheckCircleOutlined />
          <span>Catatan Ustadz Pengampu</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed italic">
          &ldquo;Alhamdulillah, ananda {selectedChild?.namaLengkap || "Ananda"} menunjukkan progres yang sangat konsisten dalam
          ziyadah maupun muroja&apos;ah harian. Mohon bantuan Bapak/Ibu untuk
          terus mendampingi muroja&apos;ah di rumah.&rdquo;
        </p>
        <div className="text-right text-xs text-slate-400 font-medium pt-1">
          — Ustadz Pengampu Halaqah
        </div>
      </div>

      {/* Tombol Cetak / Unduh */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button
          type="primary"
          icon={<PrinterOutlined />}
          onClick={() => setModalOpen(true)}
          className="bg-blue-green hover:bg-blue-green/90 text-white font-bold border-none h-11 rounded-2xl shadow-lg shadow-blue-green/20"
          block
        >
          Lihat Cetak
        </Button>
        <Button
          icon={<DownloadOutlined />}
          onClick={() => alert("Mengunduh salinan PDF rapor...")}
          className="bg-navy-700 hover:bg-navy-700 text-white border-navy-800 h-11 rounded-2xl font-semibold"
          block
        >
          Unduh PDF
        </Button>
      </div>

      {selectedSantriId && (
        <RaportModalView
          visible={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
