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
    <div className="min-h-[calc(100vh-8rem)] bg-[#f4f9fb] p-4 space-y-6 pb-24">
      {/* Child Switcher Pills */}
      {children.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pilih Ananda:</span>
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
                      ? "bg-blue-green text-white shadow-md shadow-blue-green/25 border border-blue-green"
                      : "bg-white text-slate-500 border border-slate-200 hover:text-deep-space"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      isSelected ? "bg-white text-blue-green" : "bg-slate-100 text-slate-500"
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
      <div className="bg-gradient-to-br from-sky-blue via-blue-green to-deep-space rounded-3xl p-6 text-center space-y-2 shadow-lg shadow-blue-green/20">
        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center text-white text-2xl mb-2">
          <TrophyOutlined />
        </div>
        <span className="inline-block px-3 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold">
          Semester Genap 2025/2026
        </span>
        <h2 className="text-2xl font-bold text-white">Rapor Ananda</h2>
        <p className="text-xs text-white/80">
          Santri: <span className="font-bold text-white">{selectedChild?.namaLengkap || "Ananda"}</span> — Halaqah Tahfizh
        </p>
      </div>

      {/* Rangkuman Nilai */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Predikat Akhir
          </span>
          <h3 className="text-2xl font-bold text-amber-500">{predikat}</h3>
          <p className="text-xs text-slate-500">Rata-rata: {nilaiAkhir} / 100</p>
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
        <h3 className="text-sm font-bold text-deep-space">Rincian Penilaian</h3>
        {rincianNilai.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-sm"
          >
            <div>
              <h4 className="text-sm font-semibold text-deep-space">{item.label}</h4>
              <span className="text-xs text-amber-500 font-medium">
                {item.predikat}
              </span>
            </div>
            <div className="text-xl font-bold text-white bg-sky-blue px-3.5 py-1 rounded-xl shadow-sm">
              {item.nilai}
            </div>
          </div>
        ))}
      </div>

      {/* Catatan Ustadz */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
          <CheckCircleOutlined />
          <span>Catatan Ustadz Pengampu</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed italic">
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
          className="bg-white hover:bg-white text-sky-blue border-slate-200 h-11 rounded-2xl font-semibold shadow-sm"
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
