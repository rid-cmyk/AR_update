"use client";

import React, { useState, useEffect } from "react";
import {
  TrophyOutlined,
  StarFilled,
  DownloadOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { Button, Skeleton } from "antd";
import RaportModalView from "@/components/raport/RaportModalView";

interface SantriProfile {
  id: number;
  namaLengkap: string;
  username: string;
}

export default function MobileSantriRaport() {
  const [modalOpen, setModalOpen] = useState(false);
  const [santri, setSantri] = useState<SantriProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalAyat, setTotalAyat] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [meRes, hafRes] = await Promise.all([
          fetch("/api/auth/me").catch(() => null),
          fetch("/api/santri/hafalan").catch(() => null),
        ]);

        if (meRes && meRes.ok) {
          const meJson = await meRes.json();
          if (meJson.user) {
            setSantri(meJson.user);
          }
        }

        if (hafRes && hafRes.ok) {
          const hafJson = await hafRes.json();
          if (hafJson.data?.overview?.totalAyatZiyadah) {
            setTotalAyat(hafJson.data.overview.totalAyatZiyadah);
          }
        }
      } catch (e) {
        console.error("Gagal memuat rapor santri:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const progressPercent = Math.min(Math.round((totalAyat / 6236) * 100), 100);
  const nilaiRata = Math.min(Math.round(85 + progressPercent * 0.15), 96);
  const predikat =
    nilaiRata >= 90
      ? "Mumtaz (A)"
      : nilaiRata >= 80
      ? "Jayyid Jiddan (B+)"
      : "Jayyid (B)";

  const komponenNilai = [
    { label: "Tajwid & Makhorijul Huruf", nilai: Math.min(nilaiRata + 2, 98), predikat: "Mumtaz (A)" },
    { label: "Fashahah & Irama Bacaan", nilai: Math.max(nilaiRata - 2, 80), predikat: "Mumtaz (A-)" },
    { label: "Kelancaran Hafalan (Hifzh)", nilai: nilaiRata, predikat: predikat },
    { label: "Adab & Kedisiplinan Halaqah", nilai: 96, predikat: "Mumtaz (A+)" },
  ];

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* Header Raport */}
      <div className="bg-gradient-to-br from-blue-green via-navy-800 to-navy-900 border border-brand-teal/30 rounded-3xl p-6 text-center space-y-2 shadow-lg">
        <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-md mx-auto flex items-center justify-center text-white text-2xl shadow-inner mb-2">
          <TrophyOutlined />
        </div>
        <span className="inline-block px-3 py-0.5 rounded-full bg-white/15 text-slate-100 text-xs font-semibold">
          Semester Genap 2025/2026
        </span>
        <h2 className="text-2xl font-bold text-white">Rapor Tahfizh Al-Quran</h2>
        {loading ? (
          <Skeleton.Input active size="small" />
        ) : (
          <p className="text-xs text-slate-100">
            Santri: <span className="font-bold text-white">{santri?.namaLengkap || "Santri"}</span> — NIS: {santri?.username || "202401"}
          </p>
        )}
      </div>

      {/* Rangkuman Predikat Akhir */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Predikat Akhir
          </span>
          <h3 className="text-2xl font-bold text-emerald-400">{predikat}</h3>
          <p className="text-xs text-slate-400">Rata-rata: {nilaiRata} / 100</p>
        </div>
        <div className="flex items-center gap-1 text-amber-400 text-lg">
          <StarFilled />
          <StarFilled />
          <StarFilled />
          <StarFilled />
          <StarFilled />
        </div>
      </div>

      {/* Rincian Komponen Penilaian */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300">Rincian Penilaian</h3>
        {komponenNilai.map((item, idx) => (
          <div
            key={idx}
            className="bg-navy-900/80 border border-navy-800 rounded-2xl p-4 flex items-center justify-between"
          >
            <div>
              <h4 className="text-sm font-semibold text-white">{item.label}</h4>
              <span className="text-xs text-emerald-400 font-medium">
                {item.predikat}
              </span>
            </div>
            <div className="text-xl font-bold text-white bg-navy-950 px-3.5 py-1 rounded-xl border border-navy-800">
              {item.nilai}
            </div>
          </div>
        ))}
      </div>

      {/* Catatan Ustadz Pengampu */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
          <CheckCircleOutlined />
          <span>Catatan Pembimbing Tahfizh</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed italic">
          &ldquo;Alhamdulillah, ananda {santri?.namaLengkap || "Santri"} terus menunjukkan ketekunan dalam menghafal Al-Qur&apos;an. Pertahankan muroja&apos;ah harian minimal 1 juz dan perhatikan ketepatan panjang-pendek mad.&rdquo;
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
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold border-none h-11 rounded-2xl shadow-lg shadow-emerald-500/20"
          block
        >
          Lihat Cetak
        </Button>
        <Button
          icon={<DownloadOutlined />}
          onClick={() => alert("Mengunduh salinan PDF rapor tahfizh...")}
          className="bg-navy-700 hover:bg-navy-700 text-white border-navy-800 h-11 rounded-2xl font-semibold"
          block
        >
          Unduh PDF
        </Button>
      </div>

      {santri && (
        <RaportModalView
          visible={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
